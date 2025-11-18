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

      const res = await fetch(`/api/admin/orders?status=${encodeURIComponent(currentFilter)}`);
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

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status: data.new_status ?? 'delivered', updated_at: new Date().toISOString() }
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

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 12px 40px',
        maxWidth: 1100,
        margin: '0 auto',
        color: '#e5edf5'
      }}
    >
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>TonStars — Админ / Заказы</h1>
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
          alignItems: 'center'
        }}
      >
        <span style={{ opacity: 0.8 }}>Фильтр:</span>
        {(['open', 'pending', 'paid', 'delivered', 'refunded', 'all'] as StatusFilter[]).map(
          (st) => {
            const labelMap: Record<StatusFilter, string> = {
              open: 'Открытые',
              pending: 'pending',
              paid: 'paid',
              delivered: 'delivered',
              refunded: 'refunded',
              all: 'Все'
            };
            const active = filter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => handleFilterChange(st)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active
                    ? '1px solid rgba(22,227,201,0.8)'
                    : '1px solid rgba(148,163,184,0.45)',
                  background: active
                    ? 'linear-gradient(90deg,#2563eb,#14b8a6)'
                    : 'rgba(15,23,42,0.85)',
                  color: active ? '#001014' : '#e5edf5',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {labelMap[st]}
              </button>
            );
          }
        )}

        <button
          type="button"
          onClick={() => loadOrders(filter)}
          style={{
            marginLeft: 'auto',
            padding: '8px 14px',
            borderRadius: 999,
            border: '1px solid rgba(148,163,184,0.45)',
            background: 'rgba(15,23,42,0.9)',
            color: '#e5edf5',
            fontWeight: 500,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          ⟳ Обновить
        </button>
      </div>

      {loading && (
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.85 }}>Загружаем заказы…</div>
      )}

      {error && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 14,
            color: '#fecaca'
          }}
        >
          Ошибка: {error}
        </div>
      )}

      {/* Таблица заказов */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 14,
          border: '1px solid rgba(148,163,184,0.45)',
          background: 'rgba(15,23,42,0.95)'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 700
          }}
        >
          <thead>
            <tr
              style={{
                background: 'linear-gradient(90deg,#0f172a,#020617)'
              }}
            >
              <th style={thStyle}>ID</th>
              <th style={thStyle}>USERNAME</th>
              <th style={thStyle}>STARS</th>
              <th style={thStyle}>TON</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>CREATED</th>
              <th style={thStyle}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '14px 10px',
                    textAlign: 'center',
                    fontSize: 14,
                    opacity: 0.7
                  }}
                >
                  Заказов нет.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const ton = Number(o.ton_amount);
                const tonPretty = Number.isFinite(ton)
                  ? ton.toFixed(4)
                  : o.ton_amount;

                const isDelivered = o.status === 'delivered';

                return (
                  <tr
                    key={o.id}
                    style={{
                      borderTop: '1px solid rgba(30,41,59,0.9)'
                    }}
                  >
                    <td style={tdStyle}>#{o.id}</td>
                    <td style={tdStyle}>@{o.tg_username}</td>
                    <td style={tdStyle}>{o.stars}</td>
                    <td style={tdStyle}>{tonPretty}</td>
                    <td style={tdStyle}>{o.status}</td>
                    <td style={tdStyle}>{formatDate(o.created_at)}</td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => markDelivered(o.id)}
                        disabled={isDelivered || actionLoadingId === o.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          border: '1px solid rgba(56,189,248,0.7)',
                          background: isDelivered
                            ? 'rgba(22,163,74,0.2)'
                            : 'rgba(8,47,73,0.9)',
                          color: isDelivered ? '#bbf7d0' : '#e0f2fe',
                          fontSize: 13,
                          cursor:
                            isDelivered || actionLoadingId === o.id
                              ? 'default'
                              : 'pointer',
                          opacity:
                            isDelivered || actionLoadingId === o.id ? 0.6 : 1
                        }}
                      >
                        {isDelivered
                          ? '✓ delivered'
                          : actionLoadingId === o.id
                          ? '…'
                          : 'Mark delivered'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: 12,
  letterSpacing: 0.7,
  textTransform: 'uppercase',
  opacity: 0.7,
  whiteSpace: 'nowrap'
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 14,
  whiteSpace: 'nowrap'
};
