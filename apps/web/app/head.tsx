// apps/web/app/head.tsx
export default function Head() {
  const title = 'TonStars — покупка Telegram Stars за TON';
  const description =
    'Покупай Telegram Stars за TON без KYC.';

  return (
    <>
      {/* Основные метатеги */}
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <meta name="description" content={description} />

      {/* Канонический URL */}
      <link rel="canonical" href="https://tonstars.io" />

      {/* hreflang для многоязычия */}
      <link rel="alternate" href="https://tonstars.io" hrefLang="ru" />
      <link rel="alternate" href="https://tonstars.io/en" hrefLang="en" />
      <link rel="alternate" href="https://tonstars.io" hrefLang="x-default" />

      {/* Open Graph (Telegram/соцсети) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TonStars" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://tonstars.io" />
      <meta
        property="og:image"
        content="https://tonstars.io/og-image.png"
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content="https://tonstars.io/og-image.png"
      />

      {/* Индексация */}
      <meta name="robots" content="index,follow" />
    </>
  );
}
