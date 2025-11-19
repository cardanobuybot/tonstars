// apps/web/app/en/privacy/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TonStars',
  description:
    'Privacy Policy of TonStars — a non-custodial service to buy Telegram Stars with TON.',
  alternates: {
    languages: {
      en: 'https://www.tonstars.io/en/privacy',
      ru: 'https://www.tonstars.io/privacy',
      'x-default': 'https://www.tonstars.io/en/privacy',
    },
  },
};

export default function PrivacyEnPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 16px 40px',
        maxWidth: 860,
        margin: '0 auto',
        color: '#e5edf5',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Privacy Policy</h1>
      <div style={{ opacity: 0.7, marginBottom: 24, fontSize: 14 }}>
        Last updated: 01 Jun 2025
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>1. Introduction</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          This Policy describes how data is processed when using the{' '}
          <strong>TonStars</strong> platform. By using the Platform, you agree
          to this Policy.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>2. What Data We Use</h2>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.1. Account Data
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          You may connect via Telegram or by linking a TON wallet. We do not
          link these data sets together or store IP addresses or device
          identifiers on our side.
        </p>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.2. Transaction History
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          All operations are recorded on the public TON network. TonStars does
          not hold or control your funds – all transfers are executed via your
          own wallets.
        </p>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.3. Anonymous Statistics
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          We may collect anonymized technical data (device type, browser,
          country, basic logs) for up to 6 months for anti-fraud, monitoring
          and service improvements.
        </p>

        <h3 style={{ fontSize: 16, marginTop: 12, marginBottom: 4 }}>
          2.4. Cookies and Local Storage
        </h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          We use cookies and the browser&apos;s local storage to keep interface
          language and wallet connection status. You can disable cookies in
          your browser, but some features may stop working.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>3. How We Use Data</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          We do not store user funds and do not link TON payments to specific
          login data. Only interface preferences (such as language) and minimal
          technical records may be stored temporarily for support and security.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>4. Data Sharing</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          We do not share personal data with third parties within the service.
          Transactions on the TON network are public by nature of blockchain.
          Aggregated technical statistics may be shared in response to lawful
          requests from regulators.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>5. Your Rights</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Since we store almost no personalized data, deletion requests are
          usually not necessary. You can stop using the service at any time by
          disconnecting your wallet and no longer visiting the site.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>6. Third-Party Services</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          When using TonStars you also interact with third-party services:
          Telegram, TON wallets (Tonkeeper, MyTonWallet, OpenMask), TON
          explorers, hosting infrastructure (e.g. Vercel, Cloudflare). Each of
          these services has its own privacy policy which you should review
          separately.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>7. Security</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          We apply technical protection measures appropriate for this type of
          service. The Platform is non-custodial: the security of your assets
          depends on how you store and protect your wallets.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>8. International Transfers</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Transaction data is distributed across TON network nodes worldwide –
          this is an inherent property of a public blockchain and is not
          centrally controlled by us.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>9. Changes</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          The current version of this Policy is always available on this page.
          The update date is shown above. We may update the Policy as the
          service evolves.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>10. Contacts</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Telegram: <a href="https://t.me/tonstars_support">@tonstars_support</a>
          <br />
          Website: <a href="https://www.tonstars.io">tonstars.io</a>
        </p>
      </section>
    </main>
  );
}
