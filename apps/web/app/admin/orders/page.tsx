'use client';

import React, { useEffect, useState } from 'react';

type Order = {
  id: number;
  tg_username: string;
  stars: number;
  ton_amount: string;
  ton_wallet_addr?: string | null;
  ton_tx_hash?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type StatusFilter = 'open' | 'pending' | 'paid' | 'delivered' | 'refunded' | 'all';

const ADMIN_STORAGE_KEY = 'ts_admin_key';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 по умолчанию показываем ВСЕ заказы
  const [filter, setFilter] = useState<StatusFilter>('all');

  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [adminKey, setAdminKey] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // -------- загрузка заказов ----------
  async function loadOrders(currentFilter: StatusFilter = filter, key?: string) {
    const k = key ?? adminKey;
    if (!k) {
      setError('NO_ADMIN_KEY');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/admin/orders?status=${encodeURIComponent(currentFilter)}`,
        {
          headers: {
            'x-admin-token': k,
          },
        },
      );

      const data = await res.json();

      if (res.status === 401) {
        setIsAuthed(false);
        setAdminKey('');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
        throw new Error('UNAUTHORIZED');
      }

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'LOAD_FAILED');
      }

      setOrders(data.orders ?? []);
    } catch (err: any) {
      console.error('loadOrders error:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // восстановить пароль из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      setAdminKey(saved);
      setIsAuthed(true);
      // 🔹 при автологине тоже сразу грузим "all"
      loadOrders('all', saved).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = async (next: StatusFilter) => {
    setFilter(next);
    await loadOrders(next);
  };

  // -------- логин ----------
  const handleLogin = async () => {
    const trimmed = adminKey.trim();
    if (!trimmed) return;

    try {
      setLoginLoading(true);
      setError(null);

      // 🔹 при логине тоже сразу просим "all"
      const res = await fetch('/api/admin/orders?status=all', {
        headers: {
          'x-admin-token': trimmed,
        },
      });

      const data = await res.json();

      if (res.status === 401 || !data.ok) {
        throw new Error('UNAUTHORIZED');
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, trimmed);
      }

      setIsAuthed(true);
      setOrders(data.orders ?? []);
      setFilter('all'); // 🔹 вкладка "Все"
    } catch (err) {
      console.error('login error:', err);
      setError('Неверный админ-пароль');
      setIsAuthed(false);
    } finally {
      setLoginLoading(false);
    }
  };

  // -------- logout ----------
  const handleLogout = () => {
    setIsAuthed(false);
    setAdminKey('');
    setOrders([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  };

  // -------- отметить delivered ----------
  const markDelivered = async (id: number) => {
    if (!adminKey) return;

    try {
      setActionLoadingId(id);
      setError(null);

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminKey,
        },
        body: JSON.stringify({ id, action: 'mark_delivered' }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setIsAuthed(false);
        setAdminKey('');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        }
        throw new Error('UNAUTHORIZED');
      }

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'ACTION_FAILED');
      }

      setOrders(prev =>
        prev.map(o =>
          o.id === id
            ? {
                ...o,
                status: data.new_status ?? 'delivered',
                updated_at: new Date().toISOString(),
              }
            : o,
        ),
      );
    } catch (err: any) {
      console.error('markDelivered error:', err);
      setError(err?.message || String(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // ---------- экран логина ----------
  if (!isAuthed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at top,#18253a,#05070b)',
          color: '#e5edf5',
          padding: 16,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            padding: 24,
            borderRadius: 18,
            background: 'rgba(7,12,20,0.96)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          }}
        >
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>
            TonStars — вход в админку
          </h1>
          <div style={{ opacity: 0.75, marginBottom: 16 }}>
            Введи админ-пароль (значение переменной{' '}
            <code>ADMIN_PANEL_TOKEN / NEXT_PUBLIC_ADMIN_TOKEN</code>).
          </div>

          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder="Админ-пароль"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: '#0c1018',
              padding: '0 14px',
              color: '#e6ebff',
              outline: 'none',
              marginBottom: 12,
            }}
          />

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 8 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loginLoading || !adminKey.trim()}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: 'none',
              background:
                loginLoading || !adminKey.trim()
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(90deg,#2a86ff,#16e3c9)',
              color:
                loginLoading || !adminKey.trim()
                  ? 'rgba(230,235,255,0.5)'
                  : '#001014',
              fontSize: 16,
              fontWeight: 700,
              cursor:
                loginLoading || !adminKey.trim() ? 'default' : 'pointer',
            }}
          >
            {loginLoading ? 'Проверяем…' : 'Войти'}
          </button>
        </div>
      </div>
    );
  }

  // ---------- основная админ-страница ----------
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 16px 40px',
        maxWidth: 960,
        margin: '0 auto',
        color: '#e5edf5',
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>
        TonStars — Админ / Заказы
      </h1>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>
        Тут ты видишь заказы, статусы оплаты и можешь отметить, что звёзды уже
        отправлены пользователю вручную (после этого статус станет{' '}
        <code>delivered</code>).
      </div>

      {/* Фильтр статуса */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <span style={{ opacity: 0.8 }}>Фильтр:</span>
        {(['open', 'pending', 'paid', 'delivered', 'refunded', 'all'] as StatusFilter[]).map(
          st => {
            const labelMap: Record<StatusFilter, string> = {
              open: 'Открытые',
              pending: 'pending',
              paid: 'paid',
              delivered: 'delivered',
              refunded: 'refunded',
              all: 'Все',
            };
            const active = filter === st;
            return (
              <button
                key={st}
                onClick={() => handleFilterChange(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: active ? 'rgba(0,152,234,0.32)' : 'transparent',
                  color: active ? '#fff' : '#cdd6f4',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {labelMap[st]}
              </button>
            );
          },
        )}

        <button
          onClick={() => loadOrders(filter)}
          style={{
            marginLeft: 'auto',
            padding: '6px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: '#cdd6f4',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>↻</span>
          Обновить
        </button>

        <button
          onClick={handleLogout}
          style={{
            marginLeft: 8,
            padding: '6px 18px',
            borderRadius: 999,
            border: '1px solid rgba(255,80,80,0.7)',
            background: 'rgba(255,80,80,0.08)',
            color: '#ff8080',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Выйти
        </button>
      </div>

      {loading && (
        <div style={{ opacity: 0.7, marginBottom: 8 }}>Загружаем заказы…</div>
      )}
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: 8, fontSize: 13 }}>
          Ошибка: {error}
        </div>
      )}

      {/* Таблица заказов */}
      <div
        style={{
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg,#080c12,#05070b)',
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: 760 }}>
          {/* header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '60px 1.6fr 0.6fr 0.9fr 1.1fr 1.4fr 1.1fr',
              padding: '10px 12px',
              background: 'linear-gradient(90deg,#111828,#06101e)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3,
              textTransform: 'uppercase',
              opacity: 0.9,
            }}
          >
            <div>ID</div>
            <div>Username</div>
            <div style={{ textAlign: 'right' }}>Stars</div>
            <div style={{ textAlign: 'right', paddingRight: 8 }}>TON</div>
            <div style={{ paddingLeft: 8 }}>Status</div>
            <div>Created</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>

          {/* rows */}
          {orders.map(o => {
            const created = new Date(o.created_at).toLocaleString();
            const tonNum = Number(o.ton_amount);
            const tonFormatted = Number.isFinite(tonNum)
              ? tonNum.toFixed(4)
              : String(o.ton_amount ?? '');

            const canMarkDelivered = o.status === 'paid';

            return (
              <div
                key={o.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '60px 1.6fr 0.6fr 0.9fr 1.1fr 1.4fr 1.1fr',
                  padding: '9px 12px',
                  fontSize: 14,
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  background:
                    o.status === 'delivered'
                      ? 'rgba(46, 204, 113, 0.04)'
                      : 'transparent',
                }}
              >
                <div style={{ opacity: 0.85 }}>#{o.id}</div>
                <div style={{ opacity: 0.9 }}>@{o.tg_username}</div>
                <div style={{ textAlign: 'right' }}>{o.stars}</div>
                <div
                  style={{
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    paddingRight: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tonFormatted}
                </div>
                <div
                  style={{
                    textTransform: 'lowercase',
                    paddingLeft: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.status}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{created}</div>
                <div style={{ textAlign: 'center' }}>
                  {canMarkDelivered ? (
                    <button
                      onClick={() => markDelivered(o.id)}
                      disabled={actionLoadingId === o.id}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(46, 204, 113, 0.5)',
                        background:
                          actionLoadingId === o.id
                            ? 'rgba(46, 204, 113, 0.1)'
                            : 'transparent',
                        color: '#2ecc71',
                        fontSize: 12,
                        cursor:
                          actionLoadingId === o.id ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {actionLoadingId === o.id ? 'Сохраняю…' : 'delivered'}
                    </button>
                  ) : (
                    <span style={{ opacity: 0.5, fontSize: 12 }}>—</span>
                  )}
                </div>
              </div>
            );
          })}

          {orders.length === 0 && !loading && (
            <div style={{ padding: 14, fontSize: 14, opacity: 0.8 }}>
              Заказов с таким фильтром нет.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
