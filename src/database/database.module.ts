import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pool } from 'pg';
import { databaseProvider, dbPoolProvider, DB_POOL, DRIZZLE } from './database.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [dbPoolProvider, databaseProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(DB_POOL)
    private readonly pool: Pool,
  ) {}

  async onApplicationShutdown() {
    // Gracefully shut down postgres pool connections when application closes
    await this.pool.end();
  }
}
