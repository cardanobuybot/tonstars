import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — TonStars",
  description:
    "How TonStars processes and protects user data when buying Telegram Stars with TON.",
};

export default function PrivacyEnPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <div className="mb-8 text-sm text-zinc-400">
        <Link href="/">Home</Link> <span className="mx-2">/</span>{" "}
        <span className="text-zinc-300">Privacy Policy</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-zinc-400">
        Last updated: <time dateTime="2025-06-01">01 Jun 2025</time>
      </p>

      <section className="prose prose-invert prose-zinc mt-8 leading-relaxed">
        <h2 id="intro">1. Introduction</h2>
        <p>
          This Privacy Policy (“Policy”) explains what data is processed when you
          use <strong>TonStars</strong> (“Platform”, “we”, “our”) and how we
          protect your information. By using the Platform, you agree to this
          Policy. TonStars enables users to purchase <strong>Telegram Stars</strong> with{" "}
          <strong>TON</strong>.
        </p>

        <h2 id="data-we-use">2. What data we use</h2>
        <h3>2.1. Account data</h3>
        <p>
          You may sign in via Telegram or connect a TON wallet. We do{" "}
          <strong>not</strong> store personal data, IP addresses, hardware IDs,
          nor do we link Telegram accounts to TON addresses.
        </p>
        <h3>2.2. Transaction history</h3>
        <p>
          All operations are recorded on the public, immutable{" "}
          <strong>TON</strong> blockchain. We do not keep separate transaction
          copies and never have access to your funds.
        </p>
        <h3>2.3. Anonymous statistics</h3>
        <p>
          We may collect anonymized technical data (device type, browser,
          country) for abuse prevention and service improvement. This data is not
          identifiable and is retained for no longer than 6 months.
        </p>
        <h3>2.4. Cookies & local storage</h3>
        <p>
          We use cookies/local storage to remember language and wallet
          connection. You can disable them in your browser settings (some
          features may stop working).
        </p>

        <h2 id="usage">3. How we use data</h2>
        <p>
          TonStars is non-custodial and does not link payments to login data. We
          may temporarily keep interface preferences and language only.
        </p>

        <h2 id="sharing">4. Who we share data with</h2>
        <p>
          We <strong>do not</strong> share personal data with third parties. All
          operations and balances are public on TON. For lawful requests from
          authorities, we may provide only anonymized technical statistics.
        </p>

        <h2 id="rights">5. Your rights</h2>
        <p>
          Since we do not store personal data, deletion requests are not
          necessary. You can stop using the service anytime. If you are in the
          EU, you may: (i) know what we process (this Policy), (ii) object by
          discontinuing use, (iii) withdraw consent by disconnecting your wallet
          or Telegram account.
        </p>

        <h2 id="third-parties">6. Third-party services</h2>
        <p>
          We integrate with: Telegram, TON wallets (Tonkeeper, MyTonWallet,
          OpenMask, etc.), blockchain explorers, hosting <em>Vercel</em> and
          protection <em>Cloudflare</em>. Each has its own policies.
        </p>

        <h2 id="security">7. Security</h2>
        <p>
          We apply technical and organizational measures. The Platform is{" "}
          <em>non-custodial</em>, so your asset security depends on your wallet
          practices. Use official TON wallets, keep seed phrases offline, and
          verify the site: <strong>https://tonstars.io</strong>.
        </p>

        <h2 id="intl">8. International data transfers</h2>
        <p>
          Due to the decentralized nature of TON, transaction data is
          distributed globally across network nodes — this is normal for
          blockchains.
        </p>

        <h2 id="changes">9. Changes to this Policy</h2>
        <p>
          We may update this Policy. The current version is always available at{" "}
          <Link href="/en/privacy">/en/privacy</Link>. The last updated date is
          shown at the top.
        </p>

        <h2 id="contacts">10. Contact</h2>
        <p>
          Questions: Telegram{" "}
          <a
            href="https://t.me/tonstars_support"
            target="_blank"
            rel="noopener noreferrer"
          >
            @tonstars_support
          </a>{" "}
          or{" "}
          <a href="https://tonstars.io" target="_blank" rel="noopener noreferrer">
            tonstars.io
          </a>
          .
        </p>
      </section>
    </main>
  );
}
