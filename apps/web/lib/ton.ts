// apps/web/lib/ton.ts

const TONAPI_KEY = process.env.TONAPI_KEY;

// Базовый URL TonAPI (v2)
const TONAPI_BASE = "https://tonapi.io/v2";

/**
 * Получить транзакцию по хэшу через TonAPI.
 * Мы берём только то, что нам нужно: адрес получателя, сумму и комментарий.
 */
export async function getTonTransaction(txHash: string) {
  if (!TONAPI_KEY) {
    console.warn("TONAPI_KEY is not set");
    throw new Error("NO_TONAPI_KEY");
  }

  const url = `${TONAPI_BASE}/blockchain/transactions/${encodeURIComponent(
    txHash,
  )}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TONAPI_KEY}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("TonAPI error:", res.status, text);
    throw new Error(`TONAPI_HTTP_${res.status}`);
  }

  const data: any = await res.json();

  // В разных версиях TonAPI структура может отличаться,
  // поэтому максимально аккуратно достаём поля.
  const tx = data.transaction ?? data;

  const inMsg = tx.in_msg ?? tx.in_message ?? tx.in_msg_value ?? tx;

  const valueNano = Number(inMsg.value ?? tx.amount ?? 0);
  const amountTon = valueNano / 1e9;

  const recipientRaw =
    inMsg.destination?.address ??
    inMsg.destination ??
    tx.account?.address ??
    "";

  // Комментарий может лежать в msg_data.text или похожих полях
  const comment =
    inMsg.msg_data?.text ??
    inMsg.message ??
    inMsg.body ??
    tx.comment ??
    "";

  return {
    amountTon,
    recipient: String(recipientRaw || "").toLowerCase(),
    comment: String(comment || ""),
    raw: tx,
  };
}
