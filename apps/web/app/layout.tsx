export const metadata = {
  title: 'TonStars',
  description: 'Buy Telegram Stars with TON',
  icons: { icon: '/icon-512.png' }
};

import './globals.css';
import React from 'react';
import TonConnectProvider from './providers/TonConnectProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Если захочешь PWA позже — здесь будет link на webmanifest. Для TonConnect не нужен. */}
      </head>
      <body>
        <TonConnectProvider>{children}</TonConnectProvider>
      </body>
    </html>
  );
}
