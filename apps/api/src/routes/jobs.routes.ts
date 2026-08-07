import { FastifyInstance } from 'fastify';
import { schedulerService } from '../services/scheduler.service';

export async function jobsRoutes(server: FastifyInstance) {
  const CRON_SECRET = process.env.CRON_SECRET || 'koti_scout_secret_cron_token_change_in_prod';

  // Protected internal endpoint for Supabase Cron / GitHub Actions / external cron
  // POST /internal/jobs/run-scheduled-searches
  server.post('/run-scheduled-searches', async (request, reply) => {
    const authHeader = (request.headers['x-cron-secret'] || request.headers.authorization) as string | undefined;
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (!providedSecret || providedSecret !== CRON_SECRET) {
      return reply.status(401).send({
        error: 'Unauthorized. Invalid or missing CRON_SECRET token.'
      });
    }

    try {
      const dueSearches = await schedulerService.getDueSearches();
      let totalNewProps = 0;
      let totalPricesChanged = 0;
      let totalNotificationsCreated = 0;
      const results = [];

      for (const search of dueSearches) {
        try {
          const runResult = await schedulerService.executeSearch(search.id);
          totalNewProps += runResult.searchRun.newProperties;
          totalPricesChanged += runResult.searchRun.priceChanges;
          totalNotificationsCreated += (runResult.searchRun.newProperties + runResult.searchRun.priceChanges);

          results.push({
            savedSearchId: search.id,
            name: search.name,
            status: 'SUCCESS',
            result: runResult
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Execution error';
          results.push({
            savedSearchId: search.id,
            name: search.name,
            status: 'FAILED',
            error: msg
          });
        }
      }

      return reply.send({
        success: true,
        processedSearches: dueSearches.length,
        newProperties: totalNewProps,
        priceChanges: totalPricesChanged,
        notificationsCreated: totalNotificationsCreated,
        timestamp: new Date().toISOString(),
        results
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Internal scheduler error';
      return reply.status(500).send({
        error: 'Scheduler pipeline error',
        details: msg
      });
    }
  });
}
