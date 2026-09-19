/**
 * Wipes test data and leaves only: the admin user (login untouched), the
 * hand-seeded "demo" artist, and the admin's own profile — both rebuilt in the
 * current links format. Invite codes are kept, with their usage counter reset.
 *
 * DESTRUCTIVE and irreversible. Run once, right after deploying the code that
 * reads the new links format:  npm run db:reset --workspace=apps/agriolinks
 */
import { eq, ne } from 'drizzle-orm';
import { getDb } from '../src/db';
import { artists, dailyStats, inviteCodes, users } from '../src/db/schema';
import { defaultLinks } from '../src/lib/links';

const ADMIN_EMAIL = 'ojoagrio@gmail.com';

async function main() {
  const db = getDb();

  const [admin] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (!admin) {
    console.error(`No existe el usuario ${ADMIN_EMAIL} — abortando, no se borró nada.`);
    process.exit(1);
  }

  // Keep the admin's identity (name, bio, photo) so recreating the profile isn't a downgrade;
  // links go back to the four defaults, per the new format.
  const [oldProfile] = await db.select().from(artists).where(eq(artists.userId, admin.id)).limit(1);

  const otherUsers = await db.select({ email: users.email }).from(users).where(ne(users.email, ADMIN_EMAIL));
  const allArtists = await db.select({ slug: artists.slug }).from(artists);
  console.log(`Se borran ${allArtists.length} artista(s): ${allArtists.map((a) => a.slug).join(', ') || '—'}`);
  console.log(`Se borran ${otherUsers.length} usuario(s): ${otherUsers.map((u) => u.email).join(', ') || '—'}`);

  await db.delete(dailyStats);
  await db.delete(artists);
  await db.delete(users).where(ne(users.email, ADMIN_EMAIL));
  await db.update(inviteCodes).set({ usesCount: 0 });

  await db.insert(artists).values({
    id: 'demo',
    userId: 'demo-user',
    slug: 'demo',
    displayName: 'Artista Demo',
    bio: 'Esta es una página de ejemplo de AgrioLinks — así se va a ver la tuya.',
    links: [
      { id: 'demo-ig', type: 'instagram', href: 'https://instagram.com', label: 'Instagram', sub: '@artista.demo' },
      { id: 'demo-sp', type: 'spotify', href: 'https://open.spotify.com', label: 'Spotify', sub: 'Escuchá mi música' },
    ],
    backgroundEffect: 'liquid',
  });

  await db.insert(artists).values({
    id: crypto.randomUUID(),
    userId: admin.id,
    slug: 'ojoagrio',
    displayName: oldProfile?.displayName ?? 'ojoagrio',
    bio: oldProfile?.bio ?? '',
    avatarUrl: oldProfile?.avatarUrl ?? null,
    links: defaultLinks(),
    backgroundEffect: oldProfile?.backgroundEffect ?? 'liquid',
  });

  console.log(`Listo. Quedan: usuario ${ADMIN_EMAIL}, artista "demo" y tu perfil "ojoagrio". Códigos de invitación con usesCount = 0.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
