/**
 * Deletes every account except the main one (ojoagrio@gmail.com) and the
 * hand-seeded "demo" artist (no login, kept because the landing page's
 * embedded example and "Ver un ejemplo real" link point at it).
 *
 * Run: npm run db:cleanup --workspace=apps/agriolinks
 */
import { getDb } from '../src/db';
import { users, artists } from '../src/db/schema';
import { eq, ne, and } from 'drizzle-orm';

const KEEP_EMAIL = 'ojoagrio@gmail.com';
const KEEP_ARTIST_SLUG = 'demo';

async function main() {
  const db = getDb();

  const keepUser = await db.select().from(users).where(eq(users.email, KEEP_EMAIL)).limit(1);
  if (keepUser.length === 0) {
    console.error(`No se encontró ningún usuario con email ${KEEP_EMAIL} — abortando, no se borró nada.`);
    process.exit(1);
  }
  const keepUserId = keepUser[0].id;

  const artistsToDelete = await db
    .select({ slug: artists.slug, userId: artists.userId })
    .from(artists)
    .where(and(ne(artists.userId, keepUserId), ne(artists.slug, KEEP_ARTIST_SLUG)));

  const usersToDelete = await db.select({ email: users.email }).from(users).where(ne(users.email, KEEP_EMAIL));

  console.log(`Se van a borrar ${artistsToDelete.length} artista(s):`, artistsToDelete.map((a) => a.slug));
  console.log(`Se van a borrar ${usersToDelete.length} usuario(s):`, usersToDelete.map((u) => u.email));
  console.log(`Se conservan: usuario ${KEEP_EMAIL} y el artista "${KEEP_ARTIST_SLUG}".`);

  await db.delete(artists).where(and(ne(artists.userId, keepUserId), ne(artists.slug, KEEP_ARTIST_SLUG)));
  await db.delete(users).where(ne(users.email, KEEP_EMAIL));

  console.log('Listo.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
