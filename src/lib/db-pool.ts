import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

// Create a connection pool that will be shared across the server
export const pool = new Pool({
  connectionString,
  // For local development, we don't strictly require SSL unless the user uses a hosted Postgres like Neon.
  // We can let pg parse it, and if it's hosted, neon usually requires SSL.
  ssl: connectionString.includes('neon.tech') || connectionString.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false,
});
