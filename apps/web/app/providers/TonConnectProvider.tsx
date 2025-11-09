'use client';

import React, { ReactNode } from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI as useTonConnectUIBase,
  useTonWallet as useTonWalletBase
} from '@tonconnect/ui-react';

type Lang = 'ru' | 'en';

export default function TonConnectProvider({
  children,
  lang = 'ru'
}: {
  children: ReactNode;
  lang?: Lang;
}) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://tonstars.io/.well-known/tonconnect-manifest.json"
      language={lang}
    >
      {children}
    </TonConnectUIProvider>
  );
}

export const useTonConnectUI = useTonConnectUIBase;
export const useTonWallet = useTonWalletBase;
