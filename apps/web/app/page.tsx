'use client';
import { TonConnectUIProvider, TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useMemo, useState } from 'react';

const dict = {
  ru: { title:'Покупай Telegram Stars за TON', sub:'Быстро. Без KYC. Прозрачно.',
        buy:'Купить Stars', username:'Telegram username', amount:'Сумма Stars',
        connectFirst:'Подключите кошелёк', toPay:'К оплате (TON)', privacy:'Политика конфиденциальности', terms:'Условия использования' },
  en: { title:'Buy Telegram Stars with TON', sub:'Fast. No KYC. Transparent.',
        buy:'Buy Stars', username:'Telegram username', amount:'Stars amount',
        connectFirst:'Connect a wallet', toPay:'To pay (TON)', privacy:'Privacy Policy', terms:'Terms of Service' }
} as const;

export default function Page() {
  const manifestUrl = '/tonconnect-manifest.json';
  const [lang, setLang] = useState<'ru'|'en'>('ru');
  const t = (k: keyof typeof dict['ru']) => dict[lang][k];

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <div style={{maxWidth:960, margin:'0 auto', padding:'24px'}}>
        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#22d3ee',display:'grid',placeItems:'center',color:'#0b1220',fontWeight:900}}>✦</div>
            <div style={{fontWeight:700}}>TonStars</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <select value={lang} onChange={e=>setLang(e.target.value as any)}
              style={{background:'transparent',color:'#e5edf5',border:'1px solid #2b3344',borderRadius:8,padding:'6px 8px'}}>
              <option value="ru" style={{color:'#000'}}>RU</option>
              <option value="en" style={{color:'#000'}}>EN</option>
            </select>
            <TonConnectButton />
          </div>
        </header>

        <section style={{padding:'24px 0'}}>
          <h1 style={{fontSize:34, lineHeight:1.15, margin:0}}>{t('title')}</h1>
          <p style={{opacity:.8, marginTop:8}}>{t('sub')}</p>
        </section>

        <BuyCard t={t} />

        <footer style={{opacity:.8, fontSize:14, marginTop:36, paddingTop:16, borderTop:'1px solid #1a2233',
          display:'flex', gap:16, flexWrap:'wrap', justifyContent:'space-between'}}>
          <div>© {new Date().getFullYear()} TonStars</div>
          <div style={{display:'flex', gap:16}}>
            <a href="/privacy">{t('privacy')}</a>
            <a href="/terms">{t('terms')}</a>
          </div>
        </footer>
      </div>
    </TonConnectUIProvider>
  );
}

function BuyCard({ t }: { t: (k:any)=>string }) {
  const wallet = useTonWallet();
  const connected = !!wallet;
  const [amount, setAmount] = useState(1000);

  const estimatedTon = useMemo(() => (Math.max(0.001, amount / 5000)).toFixed(4), [amount]); // заглушка

  return (
    <div style={{border:'1px solid #1a2233', background:'#0c1424', borderRadius:16, padding:16}}>
      <div style={{fontWeight:600, fontSize:18, marginBottom:10}}>{t('buy')}</div>
      <div style={{display:'grid', gap:12}}>
        <label style={{display:'grid', gap:6}}>
          <span style={{opacity:.8}}>@{t('username')}</span>
          <input placeholder="username" style={{padding:'10px 12px', borderRadius:12, border:'1px solid #233048', background:'#0a1220', color:'#e5edf5'}}/>
        </label>
        <label style={{display:'grid', gap:6}}>
          <span style={{opacity:.8}}>{t('amount')}</span>
          <input type="number" min={50} max={20000} step={50} value={amount}
            onChange={e=>setAmount(parseInt(e.target.value || '0'))}
            style={{padding:'10px 12px', borderRadius:12, border:'1px solid #233048', background:'#0a1220', color:'#e5edf5'}}/>
        </label>

        <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center'}}>
          <div style={{opacity:.8}}>{t('toPay')}</div>
          <div style={{fontWeight:700}}>≈ {estimatedTon} TON</div>
        </div>

        <button disabled={!connected}
          style={{
            marginTop:4,
            background: connected ? '#22d3ee' : '#0f1729',
            color: connected ? '#06101b' : '#6b7a90',
            border:'1px solid #22d3ee55',
            borderRadius:14, padding:'12px 14px', fontWeight:700
          }}>
          {connected ? t('buy') : t('connectFirst')}
        </button>
      </div>
    </div>
  );
}
