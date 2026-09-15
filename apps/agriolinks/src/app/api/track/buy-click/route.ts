import { NextResponse } from 'next/server';
import { incrementBuyClickCount } from '@/lib/artists';

/** Public, unauthenticated — just a counter bump, fired from the storefront's own "Comprar por WhatsApp" button. */
export async function POST(request: Request): Promise<NextResponse> {
  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  if (typeof slug !== 'string' || !slug) {
    return NextResponse.json({ error: 'Falta slug' }, { status: 400 });
  }

  await incrementBuyClickCount(slug);
  return NextResponse.json({ ok: true });
}
