import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required to run migrations.');
  }

  console.log('Running production Drizzle migrations...');
  
  // Create a temporary database pool to apply migrations
  const pool = new Pool({
    connectionString,
    max: 1, // Only 1 client is needed for running migrations
  });

  const db = drizzle(pool);

  // Apply migrations located in the './drizzle' folder
  await migrate(db, { migrationsFolder: './drizzle' });

  // Close the temporary pool connection
  await pool.end();
  
  console.log('Migrations applied successfully!');
}

void runMigrations().catch((err) => {
  console.error('Production migration runner failed:', err);
  process.exit(1);
});
