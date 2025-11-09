'use client';

import React from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI,
  useTonWallet
} from '@tonconnect/ui-react';

export { useTonConnectUI, useTonWallet };

export default function TonConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://tonstars.io/.well-known/tonconnect-manifest.json"
      actionsConfiguration={{ twaReturnUrl: 'https://tonstars.io' }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
