import { emailDispatcher } from './email.service';
import { SavedSearch, SearchRun, SearchRunResult } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';
import { searchService } from './search.service';
import { PropertyDiffEngine } from '@koti-scout/property-engine';
import { notificationService } from './notification.service';

export interface SearchScheduler {
  getDueSearches(): Promise<SavedSearch[]>;
  executeSearch(savedSearchId: string): Promise<SearchRunResult>;
}

export class SchedulerService implements SearchScheduler {
  private diffEngine = new PropertyDiffEngine();

  public async getDueSearches(): Promise<SavedSearch[]> {
    const all = await dbRepository.getAllDueSavedSearches();
    const now = new Date();

    return all.filter((search) => {
      if (!search.enabled || search.scheduleType === 'MANUAL') return false;
      if (!search.lastRunAt) return true; // Never run before

      const lastRun = new Date(search.lastRunAt).getTime();
      const elapsedMs = now.getTime() - lastRun;

      switch (search.scheduleType) {
        case 'ONCE_DAILY':
          return elapsedMs >= 23 * 3600 * 1000;
        case 'TWICE_DAILY':
          return elapsedMs >= 11.5 * 3600 * 1000;
        case 'THRICE_DAILY':
          return elapsedMs >= 7.5 * 3600 * 1000;
        case 'CUSTOM':
          return elapsedMs >= 5 * 60 * 1000; // Check interval
        default:
          return false;
      }
    });
  }

  public async executeSearch(savedSearchId: string): Promise<SearchRunResult> {
    const savedSearch = await dbRepository.getSavedSearchById(savedSearchId);
    if (!savedSearch) {
      throw new Error(`Saved search with ID ${savedSearchId} not found`);
    }

    const startedAt = new Date().toISOString();
    const runId = `run-${savedSearchId}-${Date.now()}`;

    try {
      // 1. Execute PropertyProvider.search(filters)
      const searchResult = await searchService.search(savedSearch.filters);
      const properties = searchResult.properties;

      // 2. Fetch previous snapshot mappings for diff comparison
      const previousSnapshotsMap = new Map();
      for (const prop of properties) {
        const snapshots = await dbRepository.getPropertySnapshots(prop.id);
        if (snapshots.length > 0) {
          // Latest snapshot
          previousSnapshotsMap.set(prop.id, snapshots[snapshots.length - 1]);
        }
      }

      // 3. Upsert properties into database
      for (const prop of properties) {
        await dbRepository.upsertProperty(prop);
      }

      // 4. Property Diff Engine analysis
      const diffResult = this.diffEngine.detectBatchDiffs({
        currentProperties: properties,
        previousSnapshotsMap,
        savedSearchId: savedSearch.id,
        minimumScoreThreshold: savedSearch.minimumScore
      });

      // 5. Store detected events
      if (diffResult.events.length > 0) {
        await dbRepository.addPropertyEvents(diffResult.events);
      }

      // 6. Generate targeted notifications
      const notifSettings = savedSearch.notificationSettings;
      const newPropertyIds = diffResult.newProperties.map(p => p.id);
      const priceChangePropertyIds = diffResult.priceDrops.map(p => p.property.id);

      if (notifSettings.inApp) {
        // Notify on new properties
        if (notifSettings.notifyOnNewProperty && diffResult.newProperties.length > 0) {
          for (const newProp of diffResult.newProperties.slice(0, 3)) {
            await notificationService.notify({
              userId: savedSearch.userId,
              savedSearchId: savedSearch.id,
              propertyId: newProp.id,
              type: 'NEW_PROPERTY',
              title: `New Property Match: ${newProp.address}`,
              message: `Listed for €${newProp.price.toLocaleString('fi-FI')} in ${newProp.district}, ${newProp.city}. Match Score: ${newProp.score ?? 0}/100.`
            });

            // Dispatch instant email alert
            try {
              await emailDispatcher.sendPropertyAlert(newProp, 'GREAT_MATCH');
            } catch (emailErr) {
              console.warn('[Scheduler] Email dispatch notice:', emailErr);
            }
          }
        }

        // Notify on price drops
        if (notifSettings.notifyOnPriceDrop && diffResult.priceDrops.length > 0) {
          for (const drop of diffResult.priceDrops) {
            await notificationService.notify({
              userId: savedSearch.userId,
              savedSearchId: savedSearch.id,
              propertyId: drop.property.id,
              type: 'PRICE_DROP',
              title: `Price Drop: ${drop.property.address}`,
              message: `Price reduced by €${Math.abs(drop.diff).toLocaleString('fi-FI')} (${drop.percentage}%) to €${drop.newPrice.toLocaleString('fi-FI')}.`
            });

            // Dispatch instant email alert for price drop
            try {
              await emailDispatcher.sendPropertyAlert(drop.property, 'PRICE_DROP');
            } catch (emailErr) {
              console.warn('[Scheduler] Email price drop dispatch notice:', emailErr);
            }
          }
        }
      }

      const completedAt = new Date().toISOString();
      const matchingCount = properties.filter(p => (p.score ?? 0) >= savedSearch.minimumScore).length;

      // 7. Save SearchRun record
      const searchRun: SearchRun = {
        id: runId,
        savedSearchId: savedSearch.id,
        startedAt,
        completedAt,
        status: 'SUCCESS',
        totalFound: properties.length,
        newProperties: diffResult.newProperties.length,
        priceChanges: diffResult.priceDrops.length,
        removedProperties: 0,
        matchingProperties: matchingCount
      };

      await dbRepository.recordSearchRun(searchRun);

      // 8. Calculate next run schedule handling Europe/Helsinki timezone
      const nextRunAt = this.calculateNextRun(savedSearch.scheduleType, savedSearch.timezone);
      await dbRepository.updateSavedSearch(savedSearch.id, {
        lastRunAt: completedAt,
        nextRunAt
      });

      return {
        searchRun,
        newPropertyIds,
        priceChangePropertyIds,
        totalScanned: properties.length
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown search execution failure';
      const searchRun: SearchRun = {
        id: runId,
        savedSearchId: savedSearch.id,
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'FAILED',
        totalFound: 0,
        newProperties: 0,
        priceChanges: 0,
        removedProperties: 0,
        matchingProperties: 0,
        errorMessage
      };

      await dbRepository.recordSearchRun(searchRun);
      throw err;
    }
  }

  private calculateNextRun(scheduleType: string, _timezone = 'Europe/Helsinki'): string | null {
    const now = new Date();
    switch (scheduleType) {
      case 'ONCE_DAILY':
        return new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
      case 'TWICE_DAILY':
        return new Date(now.getTime() + 12 * 3600 * 1000).toISOString();
      case 'THRICE_DAILY':
        return new Date(now.getTime() + 8 * 3600 * 1000).toISOString();
      case 'CUSTOM':
        return new Date(now.getTime() + 6 * 3600 * 1000).toISOString();
      default:
        return null;
    }
  }
}

export const schedulerService = new SchedulerService();
