export const metadata = {
  title: 'TonStars',
  description: 'Buy Telegram Stars with TON',
  icons: { icon: '/icon-512.png' }
};

import './globals.css';
import React from 'react';
import TonProvider from './providers/TonProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/tonconnect-manifest.json" />
      </head>
      <body>
        <TonProvider>{children}</TonProvider>
      </body>
    </html>
  );
}
