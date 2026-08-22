import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { propertyRoutes } from './routes/properties.routes';
import { savedSearchesRoutes } from './routes/saved-searches.routes';
import { favoritesRoutes } from './routes/favorites.routes';
import { notificationsRoutes } from './routes/notifications.routes';
import { jobsRoutes } from './routes/jobs.routes';
import { statsRoutes } from './routes/stats.routes';
import { preferencesRoutes } from './routes/preferences.routes';
import { systemRoutes } from './routes/system.routes';
import { devRoutes } from './routes/dev.routes';
import { authPlugin } from './plugins/auth';

export function buildServer() {
  const server = Fastify({
    logger: process.env.NODE_ENV === 'test' ? false : { level: 'info' }
  });

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : true;

  server.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  });

  server.register(sensible);
  server.register(authPlugin);

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    service: 'koti-scout-api',
    timestamp: new Date().toISOString()
  }));

  // API Route groups
  server.register(systemRoutes, { prefix: '/api/system' });
  server.register(devRoutes, { prefix: '/api/dev' });
  server.register(propertyRoutes, { prefix: '/api/properties' });
  server.register(savedSearchesRoutes, { prefix: '/api/saved-searches' });
  server.register(favoritesRoutes, { prefix: '/api/favorites' });
  server.register(notificationsRoutes, { prefix: '/api/notifications' });
  server.register(jobsRoutes, { prefix: '/internal/jobs' });
  server.register(statsRoutes, { prefix: '/api/stats' });
  server.register(preferencesRoutes, { prefix: '/api/preferences' });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  const server = buildServer();
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '0.0.0.0';

  server.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`🌲 KotiScout API Server listening at ${address}`);
  });
}
