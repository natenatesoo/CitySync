import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — City/Sync",
  description: "City/Sync Demo Application Privacy Policy",
};

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 36,
};

const H2_STYLE: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#fff",
  marginBottom: 10,
  letterSpacing: 0.2,
};

const P_STYLE: React.CSSProperties = {
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.75,
  marginBottom: 10,
};

const UL_STYLE: React.CSSProperties = {
  paddingLeft: 20,
  marginBottom: 10,
};

const LI_STYLE: React.CSSProperties = {
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.75,
  marginBottom: 4,
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#15151E",
        padding: "48px 24px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Back link */}
        <Link
          href="/demo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "rgba(65,105,225,0.85)",
            textDecoration: "none",
            marginBottom: 36,
            fontWeight: 600,
          }}
        >
          ← Back to City/Sync
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: "rgba(65,105,225,0.9)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Legal
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 0 }}>Last updated: March 13, 2026</p>
        </div>

        {/* Disclaimer banner */}
        <div
          style={{
            background: "rgba(65,105,225,0.08)",
            border: "1px solid rgba(65,105,225,0.2)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 36,
          }}
        >
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "rgba(255,255,255,0.8)" }}>Demo Application Notice.</strong> City/Sync is currently
            operating as a public demo on the Base Sepolia testnet. No real assets, funds, or personal financial data
            are processed. This policy describes how we handle information collected during the demo.
          </p>
        </div>

        {/* Content card */}
        <div
          style={{
            background: "#1E1E2C",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: "36px 32px",
          }}
        >
          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>1. Information We Collect</h2>
            <p style={P_STYLE}>
              When you use the City/Sync demo application, we may collect the following categories of information:
            </p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Authentication data</strong> — Your email address or
                OAuth identity (e.g., Google) used to create and access your smart account via Alchemy Account Kit. We
                do not store passwords.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Wallet address</strong> — Your ERC-4337 smart account
                address derived from your identity credential. This address is publicly visible on the Base Sepolia
                blockchain.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Profile data</strong> — Display names and profile
                photos you voluntarily set within the app. Photos are stored locally in your browser's localStorage and
                are never uploaded to our servers.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Usage data</strong> — Interactions with demo features
                such as task claims, offer redemptions, and governance votes. These actions are recorded on the public
                Base Sepolia blockchain.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Device and browser data</strong> — Standard technical
                information (browser type, operating system, IP address) collected automatically by web servers and
                analytics tools.
              </li>
            </ul>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>2. How We Use Your Information</h2>
            <p style={P_STYLE}>We use collected information solely to:</p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>Authenticate your identity and maintain your session across visits.</li>
              <li style={LI_STYLE}>Derive and manage your smart account address on the Base Sepolia testnet.</li>
              <li style={LI_STYLE}>Display your profile name and photo within the demo interface.</li>
              <li style={LI_STYLE}>
                Process testnet transactions (task claims, verifications, offer redemptions) on your behalf.
              </li>
              <li style={LI_STYLE}>Analyze aggregate usage patterns to improve the demo experience.</li>
              <li style={LI_STYLE}>Respond to support inquiries and bug reports.</li>
            </ul>
            <p style={P_STYLE}>
              We do not use your information for advertising, and we do not sell or rent your data to third parties.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>3. Local Storage & Cookies</h2>
            <p style={P_STYLE}>
              City/Sync stores certain data directly in your browser to provide a seamless experience across sessions:
            </p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Profile names and photos</strong> are persisted in
                localStorage, keyed to your wallet address. This data lives entirely in your browser and is never
                transmitted to our servers.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Session tokens</strong> from Alchemy Account Kit may
                be stored in cookies or localStorage to maintain your sign-in state.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Task state</strong> (created tasks, claimed
                opportunities) is cached in localStorage to reduce onchain read overhead.
              </li>
            </ul>
            <p style={P_STYLE}>
              You can clear all locally stored data at any time by clearing your browser's site data for this domain.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>4. Blockchain Data</h2>
            <p style={P_STYLE}>
              Actions you take in the demo (registering as an Issuer or Redeemer, claiming tasks, redeeming offers)
              result in transactions written to the Base Sepolia testnet. This is a public blockchain — your wallet
              address and transaction history are permanently and publicly visible to anyone. We cannot delete or modify
              onchain data.
            </p>
            <p style={P_STYLE}>
              The Base Sepolia testnet is a test network and holds no real monetary value. Testnet tokens have no market
              value and cannot be exchanged for real currency.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>5. Third-Party Services</h2>
            <p style={P_STYLE}>City/Sync integrates with third-party services that have their own privacy practices:</p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Alchemy Account Kit</strong> — Provides smart account
                infrastructure and authentication. See Alchemy's Privacy Policy at alchemy.com.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Google OAuth</strong> — If you sign in with Google,
                Google's Privacy Policy applies to that authentication step.
              </li>
              <li style={LI_STYLE}>
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>Base Sepolia (Coinbase / OP Labs)</strong> — A public
                Ethereum L2 testnet. Transactions are publicly recorded.
              </li>
            </ul>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>6. Data Retention</h2>
            <p style={P_STYLE}>
              Authentication records and usage logs are retained for a maximum of 12 months from your last activity,
              after which they are deleted from our systems. Profile data stored in your browser's localStorage persists
              until you clear it manually. Onchain data is permanent by the nature of blockchain technology.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>7. Children's Privacy</h2>
            <p style={P_STYLE}>
              City/Sync is not intended for use by individuals under the age of 13. We do not knowingly collect personal
              information from children under 13. If you believe a child has provided us with personal information,
              please contact us so we can delete it.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>8. Your Rights</h2>
            <p style={P_STYLE}>
              Depending on your jurisdiction, you may have rights to access, correct, or delete personal information we
              hold about you. To exercise these rights or ask questions about your data, contact us at the address
              below. We will respond within 30 days.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>9. Changes to This Policy</h2>
            <p style={P_STYLE}>
              We may update this Privacy Policy as the City/Sync protocol evolves from demo to production. Material
              changes will be communicated via a notice on the application. Continued use of the app after such notice
              constitutes acceptance of the revised policy.
            </p>
          </div>

          <div style={{ ...SECTION_STYLE, marginBottom: 0 }}>
            <h2 style={H2_STYLE}>10. Contact</h2>
            <p style={{ ...P_STYLE, marginBottom: 0 }}>
              For privacy-related questions or data requests, please reach out via the City/Sync project repository or
              official communication channels listed at the project homepage.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 40,
          }}
        >
          <Link
            href="/demo/terms"
            style={{ fontSize: 13, color: "rgba(65,105,225,0.7)", textDecoration: "none", fontWeight: 600 }}
          >
            Terms of Service →
          </Link>
          <Link href="/demo" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            Back to Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
