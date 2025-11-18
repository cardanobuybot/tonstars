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

type StatusFilter =
  | 'open'
  | 'pending'
  | 'paid'
  | 'delivered'
  | 'refunded'
  | 'all';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('open');
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  async function loadOrders(currentFilter: StatusFilter = filter) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/admin/orders?status=${encodeURIComponent(currentFilter)}`
      );
      const data = await res.json();

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

  useEffect(() => {
    // при первом заходе — открытые заказы
    loadOrders('open');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = async (next: StatusFilter) => {
    setFilter(next);
    await loadOrders(next);
  };

  const markDelivered = async (id: number) => {
    try {
      setActionLoadingId(id);
      setError(null);

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'mark_delivered' })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'ACTION_FAILED');
      }

      // локально обновим статус
      setOrders(prev =>
        prev.map(o =>
          o.id === id
            ? {
                ...o,
                status: data.new_status ?? 'delivered',
                updated_at: new Date().toISOString()
              }
            : o
        )
      );
    } catch (err: any) {
      console.error('markDelivered error:', err);
      setError(err?.message || String(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'open', label: 'Открытые' },
    { key: 'pending', label: 'pending' },
    { key: 'paid', label: 'paid' },
    { key: 'delivered', label: 'delivered' },
    { key: 'refunded', label: 'refunded' },
    { key: 'all', label: 'Все' }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 16px 40px',
        maxWidth: 980,
        margin: '0 auto',
        color: '#e5edf5',
        background:
          'radial-gradient(circle at top,#101827 0,#05070c 55%,#020309 100%)'
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 6 }}>TonStars — Админ / Заказы</h1>
      <div style={{ opacity: 0.7, marginBottom: 16, maxWidth: 720 }}>
        Тут ты видишь заказы, статусы оплаты и можешь отметить, что звёзды уже
        отправлены пользователю вручную (после этого статус станет
        <code>delivered</code>).
      </div>

      {/* панель фильтров / действий */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ opacity: 0.8, alignSelf: 'center' }}>Фильтр:</span>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                border:
                  filter === f.key
                    ? '1px solid rgba(255,255,255,0.8)'
                    : '1px solid rgba(255,255,255,0.2)',
                background:
                  filter === f.key ? 'rgba(0,152,234,0.25)' : 'transparent',
                color: filter === f.key ? '#ffffff' : '#cbd5f5',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => loadOrders(filter)}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(15,23,42,0.9)',
            color: '#e5edf5',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          ⟳ Обновить
        </button>
      </div>

      {/* статус загрузки / ошибок */}
      {loading && (
        <div style={{ marginBottom: 10, fontSize: 14, opacity: 0.8 }}>
          Загружаем заказы…
        </div>
      )}
      {error && (
        <div
          style={{
            marginBottom: 10,
            fontSize: 14,
            color: '#ff6b6b'
          }}
        >
          Ошибка: {error}
        </div>
      )}

      {/* таблица заказов */}
      <div
        style={{
          borderRadius: 16,
          border: '1px solid rgba(148,163,184,0.35)',
          background:
            'linear-gradient(145deg,rgba(15,23,42,0.9),rgba(15,23,42,0.98))',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '70px 170px 80px 120px 170px 120px 120px 120px',
            gap: 0,
            padding: '8px 10px',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.04,
            borderBottom: '1px solid rgba(148,163,184,0.4)',
            background:
              'linear-gradient(to right,rgba(15,23,42,0.9),rgba(30,64,175,0.9))'
          }}
        >
          <div>ID</div>
          <div>Username</div>
          <div>Stars</div>
          <div>TON</div>
          <div>wallet</div>
          <div>Status</div>
          <div>Создан</div>
          <div>Действие</div>
        </div>

        {orders.length === 0 && !loading ? (
          <div
            style={{
              padding: 16,
              fontSize: 14,
              opacity: 0.8
            }}
          >
            Заказов не найдено для выбранного фильтра.
          </div>
        ) : (
          orders.map(o => {
            const created = new Date(o.created_at).toLocaleString();
            const isPaid = o.status === 'paid';
            const isDelivered = o.status === 'delivered';

            return (
              <div
                key={o.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '70px 170px 80px 120px 170px 120px 120px 120px',
                  gap: 0,
                  padding: '8px 10px',
                  fontSize: 13,
                  borderTop: '1px solid rgba(148,163,184,0.18)'
                }}
              >
                <div style={{ opacity: 0.85 }}>#{o.id}</div>
                <div style={{ opacity: 0.95 }}>@{o.tg_username}</div>
                <div style={{ opacity: 0.95 }}>{o.stars}</div>
                <div style={{ opacity: 0.95 }}>{o.ton_amount}</div>
                <div
                  style={{
                    opacity: 0.8,
                    fontSize: 12,
                    wordBreak: 'break-all'
                  }}
                >
                  {o.ton_wallet_addr || '—'}
                </div>
                <div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: 0.05,
                      background: isDelivered
                        ? 'rgba(34,197,94,0.2)'
                        : isPaid
                        ? 'rgba(59,130,246,0.25)'
                        : 'rgba(148,163,184,0.12)',
                      border: '1px solid rgba(148,163,184,0.45)'
                    }}
                  >
                    {o.status}
                  </span>
                </div>
                <div style={{ opacity: 0.75, fontSize: 12 }}>{created}</div>
                <div>
                  <button
                    disabled={!isPaid || actionLoadingId === o.id}
                    onClick={() => markDelivered(o.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 999,
                      border: '1px solid rgba(34,197,94,0.5)',
                      background:
                        !isPaid || actionLoadingId === o.id
                          ? 'rgba(15,23,42,0.7)'
                          : 'rgba(22,163,74,0.35)',
                      color:
                        !isPaid || actionLoadingId === o.id
                          ? 'rgba(148,163,184,0.7)'
                          : '#bbf7d0',
                      fontSize: 11,
                      cursor:
                        !isPaid || actionLoadingId === o.id
                          ? 'default'
                          : 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {actionLoadingId === o.id
                      ? 'Сохраняем…'
                      : 'Отметить delivered'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
