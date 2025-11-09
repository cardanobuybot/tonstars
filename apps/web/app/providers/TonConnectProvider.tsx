'use client';

import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TonProvider({ children }: { children: React.ReactNode }) {
  const manifestUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/.well-known/tonconnect-manifest.json`
      : '/.well-known/tonconnect-manifest.json';

  return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>;
}
