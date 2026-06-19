import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

export const databaseProvider = {
  provide: DRIZZLE,
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');
    
    const pool = new Pool({
      connectionString,
    });

    // Return the Drizzle ORM instance wrapping the postgres pool
    return drizzle(pool, { schema });
  },
  inject: [ConfigService],
};
export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
