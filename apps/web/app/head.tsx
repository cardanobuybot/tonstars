export default function Head() {
  return (
    <>
      <title>TonStars — Купить Telegram Stars за TON</title>

      <meta
        name="description"
        content="TonStars — сервис для покупки Telegram Stars за TON. Быстро, без KYC, с прозрачной комиссией. Покупай Stars безопасно через TonConnect."
      />

      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* OpenGraph */}
      <meta property="og:title" content="TonStars — Покупка Telegram Stars" />
      <meta
        property="og:description"
        content="Покупай Telegram Stars за TON быстро и без KYC."
      />
      <meta property="og:image" content="/icon-512.png" />
      <meta property="og:type" content="website" />

      {/* hreflang */}
      <link rel="alternate" href="https://tonstars.io" hreflang="ru" />
      <link rel="alternate" href="https://tonstars.io/en" hreflang="en" />
      <link rel="alternate" href="https://tonstars.io" hreflang="x-default" />
    </>
  );
}
