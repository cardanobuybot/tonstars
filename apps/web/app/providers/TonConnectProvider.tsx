'use client';

import React from 'react';
import {
  TonConnectUIProvider,
  useTonConnectUI as useTonConnectUIBase,
  useTonWallet as useTonWalletBase,
} from '@tonconnect/ui-react';

type Props = {
  children: React.ReactNode;
  lang?: 'ru' | 'en'; // делаем необязательным
};

export default function TonConnectProvider({ children, lang = 'ru' }: Props) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://tonstars.io/.well-known/tonconnect-manifest.json"
      language={lang}
      uiPreferences={{ theme: 'DARK' }}
    >
      {children}
    </TonConnectUIProvider>
  );
}

export const useTonConnectUI = useTonConnectUIBase;
export const useTonWallet = useTonWalletBase;
