import { getDb } from '../src/db';
import { artists, inviteCodes } from '../src/db/schema';

async function main() {
  const db = getDb();

  await db
    .insert(artists)
    .values({
      id: 'demo',
      userId: 'demo-user',
      slug: 'demo',
      displayName: 'Artista Demo',
      bio: 'Esta es una página de ejemplo de AgrioLinks — así se va a ver la tuya.',
      links: [
        { type: 'instagram', href: 'https://instagram.com', label: 'Instagram', sub: '@artista.demo' },
        { type: 'spotify', href: 'https://open.spotify.com', label: 'Spotify', sub: 'Escuchá mi música' },
      ],
      backgroundEffect: 'liquid',
    })
    .onConflictDoNothing();

  await db
    .insert(inviteCodes)
    .values({ code: 'AGRIO2026', note: 'Primer código de prueba' })
    .onConflictDoNothing();

  console.log('Seed listo: artista "demo" y código de invitación "AGRIO2026".');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
