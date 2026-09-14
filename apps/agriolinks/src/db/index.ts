import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy init: `neon()` throws if DATABASE_URL isn't set yet, and Next.js
// evaluates top-level module code at build time — a module-level call here
// would crash `next build` before env vars are configured. Plain function,
// not a Proxy (a Proxy around the client breaks libraries like NextAuth that
// inspect the object's own methods/properties).
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
