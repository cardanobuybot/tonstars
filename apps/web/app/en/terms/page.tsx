// apps/web/app/en/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | TonStars',
  description:
    'Terms of Use for TonStars, a platform to buy Telegram Stars with TON.',
  alternates: {
    languages: {
      en: 'https://www.tonstars.io/en/terms',
      ru: 'https://www.tonstars.io/terms',
      'x-default': 'https://www.tonstars.io/en/terms',
    },
  },
};

export default function TermsEnPage() {
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
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Terms of Use</h1>
      <div style={{ opacity: 0.7, marginBottom: 24, fontSize: 14 }}>
        Last updated: 01 Jun 2025
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>1. Introduction</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          These Terms govern access to and use of the <strong>TonStars</strong>{' '}
          platform. If you do not agree with these Terms, do not use the
          service.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>2. Platform Description</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          TonStars is an independent platform for purchasing{' '}
          <strong>Telegram Stars</strong> with <strong>TON</strong>. All
          transactions occur on the TON network. The Platform does not hold user
          funds and is not a custodial service provider.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>3. Requirements</h2>
        <ul style={{ opacity: 0.9, lineHeight: 1.6, paddingLeft: 20 }}>
          <li>you must be at least 18 years old;</li>
          <li>you are responsible for the security of your devices and wallets;</li>
          <li>
            you agree to comply with the laws of your jurisdiction when using
            the service.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>4. User Obligations</h2>
        <ul style={{ opacity: 0.9, lineHeight: 1.6, paddingLeft: 20 }}>
          <li>do not use the service for illegal activities;</li>
          <li>do not distribute malware or attempt to hack the service;</li>
          <li>do not engage in fraud or transaction manipulation;</li>
          <li>do not impair the operation of the platform or its infrastructure.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>5. Transactions and Risks</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Transactions on the TON network are irreversible. The Platform cannot
          cancel or refund payments after they are confirmed by the network. You
          must carefully verify addresses and amounts before sending any
          transaction.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>6. Fees</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          The price and fee (including our markup, for example up to 3%) are
          shown before payment. Additional TON network fees may apply. Fees are
          non-refundable except in clearly defined cases (for example, a
          technical failure on the service side where funds are automatically
          returned).
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>7. Limitation of Liability</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          The service is provided &quot;as is&quot;. We do not guarantee
          uninterrupted or error-free operation. We are not liable for direct,
          indirect or consequential losses, including loss of profit or data, nor
          for actions of third parties and external services (wallets, exchanges,
          providers).
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>8. Indemnification</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          The user agrees to indemnify the Platform for damages arising from a
          violation of these Terms or applicable law, including third-party
          claims and reasonable legal costs.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>9. Access Termination</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          We may suspend or restrict access to the service without prior notice
          if we detect violations of these Terms, suspicious activity, or
          receive binding requests from regulators/platforms.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>10. Changes</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          The current version of these Terms is always available on this page.
          The date above shows the latest revision. By continuing to use the
          service after an update, you accept the new version of the Terms.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>11. Governing Law</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          These Terms are governed by the law of the jurisdiction of the Platform
          owner. Disputes shall be resolved by the competent court at the place
          of registration of the owner, unless mandatory provisions of other law
          apply.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>12. Contacts</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Telegram: <a href="https://t.me/tonstars_support">@tonstars_support</a>
          <br />
          Website: <a href="https://www.tonstars.io">tonstars.io</a>
        </p>
      </section>
    </main>
  );
}
