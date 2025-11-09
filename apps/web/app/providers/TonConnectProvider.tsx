// apps/web/app/providers/TonConnectProvider.tsx
'use client';

import React from 'react';
import {
  TonConnectUIProvider,
  useTonWallet,
  useTonConnectUI
} from '@tonconnect/ui-react';

type Props = {
  lang: 'ru' | 'en';
  children: React.ReactNode;
};

export default function TonConnectProvider({ lang, children }: Props) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://tonstars.io/.well-known/tonconnect-manifest.json"
      language={lang}
      // theme убрали, пусть берёт системную/по умолчанию
    >
      {children}
    </TonConnectUIProvider>
  );
}

// реэкспорт хуков
export { useTonWallet, useTonConnectUI };
