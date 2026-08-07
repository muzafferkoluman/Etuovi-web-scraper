import { PropertyRepository } from './repository.interface';
import { InMemoryPropertyRepository } from './in-memory.repository';
import { PostgresPropertyRepository } from './postgres.repository';

export interface DatabaseHealth {
  mode: 'postgres' | 'memory';
  healthy: boolean;
  latencyMs?: number;
  error?: string;
  timestamp: string;
}

let repositoryInstance: PropertyRepository;
let databaseMode: 'postgres' | 'memory' = 'memory';

const configuredMode = (process.env.DATABASE_MODE || '').toLowerCase();
const databaseUrl = process.env.DATABASE_URL;

if (configuredMode === 'postgres' && databaseUrl) {
  try {
    repositoryInstance = new PostgresPropertyRepository(databaseUrl);
    databaseMode = 'postgres';
    console.log('🌲 [KotiScout Database] Initialized real Supabase/PostgreSQL repository via Drizzle ORM.');
  } catch (err: unknown) {
    console.error('⚠️ [KotiScout Database] Failed to initialize PostgreSQL repository. Falling back to InMemoryRepository:', err);
    repositoryInstance = new InMemoryPropertyRepository();
    databaseMode = 'memory';
  }
} else {
  repositoryInstance = new InMemoryPropertyRepository();
  databaseMode = 'memory';
  console.log('🌲 [KotiScout Database] Initialized InMemoryPropertyRepository (local zero-friction development mode).');
}

export const dbRepository: PropertyRepository = repositoryInstance;

export function getDatabaseMode(): 'postgres' | 'memory' {
  return databaseMode;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  if (databaseMode === 'postgres' && repositoryInstance instanceof PostgresPropertyRepository) {
    try {
      const client = await repositoryInstance.getClient();
      await client`SELECT 1`;
      return {
        mode: 'postgres',
        healthy: true,
        latencyMs: Date.now() - start,
        timestamp
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Database ping error';
      return {
        mode: 'postgres',
        healthy: false,
        latencyMs: Date.now() - start,
        error: errorMsg,
        timestamp
      };
    }
  }

  // In-Memory health
  return {
    mode: 'memory',
    healthy: true,
    latencyMs: 0,
    timestamp
  };
}
