import './globals.css';
import React from 'react';
import TonConnectProvider from './providers/TonConnectProvider';

export const metadata = {
  title: 'TonStars',
  description: 'Buy Telegram Stars with TON easily and securely.',
  icons: { icon: '/icon-512.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang: 'ru' | 'en' = 'ru';

  return (
    <html lang={lang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/tonconnect-manifest.json" />
        <link rel="icon" href="/icon-512.png" />
        <title>TonStars</title>
      </head>
      <body>
        <TonConnectProvider lang={lang}>{children}</TonConnectProvider>
      </body>
    </html>
  );
}
