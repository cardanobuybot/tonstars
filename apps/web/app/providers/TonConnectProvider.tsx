'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { PropsWithChildren } from 'react';

const MANIFEST =
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL
  ?? 'https://tonstars.io/.well-known/tonconnect-manifest.json';

export default function TonConnectProvider({ children }: PropsWithChildren) {
  return <TonConnectUIProvider manifestUrl={MANIFEST}>{children}</TonConnectUIProvider>;
}
