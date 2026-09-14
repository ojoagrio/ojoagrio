import '@ojoagrio/ui/src/styles/global.css';
import type { ReactNode } from 'react';
import { BackgroundSwitcher } from '@ojoagrio/ui';

export const metadata = {
  title: 'AgrioLinks',
  description: 'Tu página de links, con fondos animados, en minutos.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <BackgroundSwitcher brandLabel="🔗 AGRIOLINKS" />
        {children}
      </body>
    </html>
  );
}
