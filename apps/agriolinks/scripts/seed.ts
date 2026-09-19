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
        { id: 'demo-ig', type: 'instagram', href: 'https://instagram.com', label: 'Instagram', sub: '@artista.demo' },
        { id: 'demo-sp', type: 'spotify', href: 'https://open.spotify.com', label: 'Spotify', sub: 'Escuchá mi música' },
      ],
      backgroundEffect: 'liquid',
    })
    .onConflictDoNothing();

  await db
    .insert(inviteCodes)
    .values({ code: 'AGRIO2026', maxUses: 1, trialDays: 30, note: 'Primer código de prueba' })
    .onConflictDoNothing();

  await db
    .insert(inviteCodes)
    .values({
      code: 'AGRIOFREE',
      maxUses: null,
      trialDays: 30,
      note: 'Código público de campaña — botón de la landing, 1 mes gratis, uso ilimitado',
    })
    .onConflictDoNothing();

  console.log('Seed listo: artista "demo", código "AGRIO2026" (1 uso) y "AGRIOFREE" (campaña, ilimitado).');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
