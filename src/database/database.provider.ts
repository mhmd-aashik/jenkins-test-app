import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';
export const DB_POOL = 'DB_POOL';

export const dbPoolProvider = {
  provide: DB_POOL,
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');
    return new Pool({
      connectionString,
    });
  },
  inject: [ConfigService],
};

export const databaseProvider = {
  provide: DRIZZLE,
  useFactory: (pool: Pool) => {
    return drizzle(pool, { schema });
  },
  inject: [DB_POOL],
};

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
