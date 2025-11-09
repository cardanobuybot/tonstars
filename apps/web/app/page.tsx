'use client';

import React, { useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from './providers/TonConnectProvider';

// 1 STAR = 0.0002 TON (1000 → 0.2 TON)
const STAR_TON_RATE = 0.0002;

function shortAddr(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

// простая проверка username (только латиница, цифры и _; 5–32 символов)
const tgUserRe = /^[a-z0-9_]{5,32}$/i;

export default function Page() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [username, setUsername] = useState('');
  const [stars, setStars] = useState<string>('100');

  const parsedStars = useMemo(() => {
    const n = Number(stars);
    return Number.isFinite(n) && Number.isInteger(n) && n >= 1 ? n : NaN;
  }, [stars]);

  const canBuy = Boolean(
    wallet && wallet.account && tgUserRe.test(username) && !Number.isNaN(parsedStars)
  );

  const priceTon = useMemo(() => {
    if (Number.isNaN(parsedStars)) return 0;
    return +(parsedStars * STAR_TON_RATE).toFixed(4);
  }, [parsedStars]);

  const handleConnect = () => tonConnectUI.openModal();

  const handleDisconnect = async () => {
    try { await tonConnectUI.disconnect(); } catch {}
  };

  const onBuy = () => {
    if (!canBuy) return;
    alert(`Отправим ${parsedStars} Stars пользователю @${username} за ≈ ${priceTon} TON`);
    // тут позже добавим реальную отправку/чекаут
  };

  return (
    <div style={{minHeight:'100svh',background:'#0a0f1a',color:'#e5edf5'}}>
      {/* header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'16px 20px',maxWidth:980,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo-64.png" width={36} height={36} alt="TonStars" style={{borderRadius:8}}/>
          <div style={{fontWeight:700,letterSpacing:0.3}}>TonStars</div>
        </div>

        {!wallet ? (
          <button
            onClick={handleConnect}
            style={{
              padding:'10px 16px',
              borderRadius:12,
              background:'linear-gradient(90deg,#3ea6ff,#00d1b2)',
              color:'#081018',
              border:'none',
              fontWeight:700
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{padding:'8px 10px',border:'1px solid #233046',borderRadius:10,background:'#0e1624',fontSize:13,opacity:.9}}>
              {shortAddr(wallet.account.address)}
            </span>
            <button
              onClick={handleDisconnect}
              style={{
                padding:'8px 12px',
                borderRadius:10,
                background:'#172033',
                color:'#9fb3c8',
                border:'1px solid #233046'
              }}
            >
              Выйти
            </button>
          </div>
        )}
      </div>

      {/* hero */}
      <div style={{maxWidth:980,margin:'0 auto',padding:'8px 20px 32px'}}>
        <h1 style={{fontSize:44,lineHeight:1.1,margin:'10px 0 8px'}}>Покупай Telegram Stars<br/>за TON</h1>
        <p style={{opacity:.7,margin:'0 0 22px'}}>Быстро. Без KYC. Прозрачно.</p>

        <div style={{border:'1px solid #233046',background:'#0e1624',borderRadius:20,padding:22,maxWidth:640}}>
          <h2 style={{fontSize:24,margin:'0 0 14px'}}>Купить Stars</h2>

          <label style={{display:'block',marginBottom:8,opacity:.9}}>@Telegram username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value.trim().replace(/^@/, ''))}
            placeholder="username"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width:'100%',padding:'12px 14px',borderRadius:12,
              background:'#0a1220',border:'1px solid #233046',
              color:'#e5edf5',outline:'none'
            }}
          />
          <div style={{minHeight:18,marginTop:6,fontSize:13,opacity: tgUserRe.test(username) ? .6 : 1, color: tgUserRe.test(username) ? '#9fb3c8' : '#ff9c9c'}}>
            {username ? (tgUserRe.test(username) ? `Будет отправлено @${username}` : 'Разрешены: латиница, цифры, _, длина 5–32') : 'Введите ник без @'}
          </div>

          <label style={{display:'block',margin:'16px 0 8px',opacity:.9}}>Сумма Stars</label>
          <input
            value={stars}
            onChange={e => {
              const v = e.target.value.replace(/[^\d]/g, '');
              setStars(v);
            }}
            placeholder="100"
            inputMode="numeric"
            style={{
              width:'100%',padding:'12px 14px',borderRadius:12,
              background:'#0a1220',border:'1px solid #233046',
              color:'#e5edf5',outline:'none'
            }}
          />
          <div style={{minHeight:18,marginTop:6,fontSize:13,opacity: Number.isNaN(parsedStars) ? 1 : .6, color: Number.isNaN(parsedStars) ? '#ff9c9c' : '#9fb3c8'}}>
            {Number.isNaN(parsedStars) ? 'Только целые числа ≥ 1' : `OK — ${parsedStars} Stars`}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',marginTop:16,marginBottom:12}}>
            <div style={{opacity:.8}}>К оплате (TON)</div>
            <div style={{fontWeight:700}}>≈ {priceTon.toFixed(4)} TON</div>
          </div>

          <button
            disabled={!canBuy}
            onClick={onBuy}
            style={{
              width:'100%',
              padding:'14px 16px',
              borderRadius:14,
              border:'none',
              background: canBuy ? 'linear-gradient(90deg,#3ea6ff,#00d1b2)' : '#1a263a',
              color: canBuy ? '#081018' : '#6d7f95',
              fontWeight:800,
              cursor: canBuy ? 'pointer' : 'not-allowed'
            }}
          >
            Купить Stars
          </button>
        </div>
      </div>

      <footer style={{maxWidth:980,margin:'24px auto',padding:'0 20px 40px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,opacity:.9}}>
        <a href="/privacy">Политика конфиденциальности</a>
        <a href="/terms">Условия использования</a>
      </footer>
    </div>
  );
}
