import '@ojoagrio/ui/src/styles/global.css';
import type { ReactNode } from 'react';
import { BackgroundSwitcher, BackgroundOverrideProvider } from '@ojoagrio/ui';

export const metadata = {
  metadataBase: new URL('https://ojoagrio.com'),
  title: 'AgrioLinks',
  description: 'Tu página de links, con fondos animados, en minutos.',
  openGraph: {
    title: 'AgrioLinks — Tu página de links, con fondos que se mueven',
    description:
      'Todo tu Instagram, TikTok, Spotify y YouTube en un solo link, con fondos animados. Hecho para artistas independientes.',
    url: '/agriolinks',
    siteName: 'AgrioLinks',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgrioLinks — Tu página de links, con fondos que se mueven',
    description:
      'Todo tu Instagram, TikTok, Spotify y YouTube en un solo link, con fondos animados. Hecho para artistas independientes.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <BackgroundOverrideProvider>
          <BackgroundSwitcher brandLabel="🔗 AGRIOLINKS" />
          {children}
        </BackgroundOverrideProvider>
      </body>
    </html>
  );
}
