'use client';

import React, { ReactNode } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = 'https://tonstars.io/tonconnect-manifest.json';

export default function TonConnectProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
