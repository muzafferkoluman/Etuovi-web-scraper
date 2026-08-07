import { FastifyInstance } from 'fastify';
import { CreateSavedSearchSchema, UpdateSavedSearchSchema, SavedSearch } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';
import { schedulerService } from '../services/scheduler.service';

export async function savedSearchesRoutes(server: FastifyInstance) {
  const currentUserId = 'user-demo-01'; // Supabase auth contextual user

  // GET /api/saved-searches
  server.get('/', async (_request, reply) => {
    const searches = await dbRepository.getSavedSearches(currentUserId);
    return reply.send(searches);
  });

  // POST /api/saved-searches
  server.post('/', async (request, reply) => {
    const parseResult = CreateSavedSearchSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid saved search schema',
        details: parseResult.error.format()
      });
    }

    const data = parseResult.data;
    const newSearch: SavedSearch = {
      id: `search-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUserId,
      name: data.name,
      filters: data.filters,
      minimumScore: data.minimumScore,
      enabled: data.enabled,
      scheduleType: data.scheduleType,
      customScheduleTimes: data.customScheduleTimes || ['08:00', '14:00', '20:00'],
      timezone: data.timezone || 'Europe/Helsinki',
      notificationSettings: data.notificationSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
    };

    const saved = await dbRepository.createSavedSearch(newSearch);
    return reply.status(201).send(saved);
  });

  // PATCH /api/saved-searches/:id
  server.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = UpdateSavedSearchSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid update parameters',
        details: parseResult.error.format()
      });
    }

    const updated = await dbRepository.updateSavedSearch(id, parseResult.data as Partial<SavedSearch>);
    if (!updated) {
      return reply.status(404).send({ error: 'Saved search not found' });
    }
    return reply.send(updated);
  });

  // DELETE /api/saved-searches/:id
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await dbRepository.deleteSavedSearch(id);
    if (!deleted) {
      return reply.status(404).send({ error: 'Saved search not found' });
    }
    return reply.send({ success: true, id });
  });

  // POST /api/saved-searches/:id/run (RUN NOW button)
  server.post('/:id/run', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await schedulerService.executeSearch(id);
      return reply.send({
        success: true,
        message: `Search complete. ${result.searchRun.newProperties} new properties found. ${result.searchRun.priceChanges} price drops detected.`,
        result
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution failed';
      return reply.status(500).send({
        error: 'Could not update this search. Your previous results are still available. Try again later.',
        details: msg
      });
    }
  });

  // GET /api/saved-searches/:id/history
  server.get('/:id/history', async (request, reply) => {
    const { id } = request.params as { id: string };
    const history = await dbRepository.getSearchRuns(id);
    return reply.send(history);
  });
}
