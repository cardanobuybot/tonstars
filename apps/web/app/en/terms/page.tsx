import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — TonStars",
  description:
    "Using TonStars means you agree to these terms. Learn about rules, limitations and liability.",
};

export default function TermsEnPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <div className="mb-8 text-sm text-zinc-400">
        <Link href="/">Home</Link> <span className="mx-2">/</span>{" "}
        <span className="text-zinc-300">Terms of Service</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-zinc-400">
        Last updated: <time dateTime="2025-06-01">01 Jun 2025</time>
      </p>

      <section className="prose prose-invert prose-zinc mt-8 leading-relaxed">
        <h2 id="intro">1. Introduction</h2>
        <p>
          These Terms (“Terms”) govern access to and use of{" "}
          <strong>TonStars</strong> (“Platform”, “we”, “our”). By using the
          Platform, you agree to these Terms. If you disagree, please do not use
          the service.
        </p>

        <h2 id="about">2. Platform description</h2>
        <p>
          TonStars is an independent platform to purchase{" "}
          <strong>Telegram Stars</strong> with <strong>TON</strong>. All
          transactions are executed on the TON blockchain. The Platform is
          non-custodial and does not hold user funds.
        </p>

        <h2 id="eligibility">3. Eligibility</h2>
        <ul>
          <li>You must be at least 18 years old.</li>
          <li>You are responsible for your devices and wallets security.</li>
          <li>You confirm that your use complies with your local laws.</li>
        </ul>

        <h2 id="responsibility">4. User responsibilities</h2>
        <p>You agree not to use the Platform to:</p>
        <ul>
          <li>engage in illegal activities,</li>
          <li>distribute malware or attempt to hack,</li>
          <li>commit fraud or manipulate markets,</li>
          <li>damage or disrupt the service.</li>
        </ul>

        <h2 id="transactions">5. Transactions & risks</h2>
        <p>
          All TON transactions are irreversible. We cannot cancel, refund, or
          modify a transaction once confirmed on-chain. Double-check addresses
          and amounts before paying.
        </p>

        <h2 id="fees">6. Fees & payments</h2>
        <p>
          Prices are shown before payment. Network (gas) fees on TON may apply.
          All fees are non-refundable.
        </p>

        <h2 id="liability">7. Limitation of liability</h2>
        <p>
          The Platform is provided “as is”. We do not guarantee uninterrupted
          operation, error-free experience, or fitness for a particular purpose.
          TonStars is not liable for direct, indirect, incidental or
          consequential damages, including loss of data or profits.
        </p>

        <h2 id="indemnification">8. Indemnification</h2>
        <p>
          You agree to indemnify the Platform from any claims arising out of
          your violation of these Terms or applicable laws.
        </p>

        <h2 id="termination">9. Termination</h2>
        <p>
          We may suspend or terminate access without notice if we believe these
          Terms are violated.
        </p>

        <h2 id="changes">10. Changes</h2>
        <p>
          We may update these Terms. The current version is available at{" "}
          <Link href="/en/terms">/en/terms</Link>. The last updated date is shown
          above.
        </p>

        <h2 id="law">11. Governing law</h2>
        <p>
          These Terms are governed by the applicable law for TonStars
          operations. Disputes shall be resolved by the competent courts at the
          place of the Platform owner’s registration.
        </p>

        <h2 id="contact">12. Contact</h2>
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
