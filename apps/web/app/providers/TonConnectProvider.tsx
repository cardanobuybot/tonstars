'use client';

import React from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonWallet
} from '@tonconnect/ui-react';

// Реэкспортируем хуки, чтобы их можно было импортировать из этого файла
export { useTonConnectUI, useTonWallet };

// Корректный manifestUrl для клиентской и серверной среды
const manifestUrl =
  typeof window !== 'undefined'
    ? `${window.location.origin}/.well-known/tonconnect-manifest.json`
    : '/.well-known/tonconnect-manifest.json';

export default function TonConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
