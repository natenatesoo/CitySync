import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — City/Sync",
  description: "City/Sync Demo Application Terms of Service",
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

export default function TermsPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#15151E",
        padding: "48px 24px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 50,
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
            Terms of Service
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
            <strong style={{ color: "rgba(255,255,255,0.8)" }}>Demo Application Notice.</strong> City/Sync is a public
            demonstration running on the Base Sepolia testnet. All tokens and assets within this application are
            test-only and carry no real monetary value. By using this application you agree to these terms.
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
            <h2 style={H2_STYLE}>1. Acceptance of Terms</h2>
            <p style={P_STYLE}>
              By accessing or using the City/Sync demo application (&quot;the App&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the App. These Terms
              apply to all visitors, users, and anyone else who accesses the App.
            </p>
            <p style={P_STYLE}>
              We reserve the right to modify these Terms at any time. Changes become effective upon posting to the App.
              Your continued use after any modification constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>2. Description of Service</h2>
            <p style={P_STYLE}>
              City/Sync is a civic coordination protocol demo that allows users to explore a blockchain-based system for
              earning civic credits, issuing community tasks, and managing redemption offers. The App currently operates
              exclusively on the Base Sepolia testnet — a public Ethereum Layer 2 test network.
            </p>
            <p style={P_STYLE}>Key characteristics of this demo:</p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>
                All CITY, VOTE, and MCE tokens are testnet tokens with zero real-world monetary value.
              </li>
              <li style={LI_STYLE}>
                Smart accounts are provisioned via Alchemy Account Kit using ERC-4337. Gas fees are sponsored and no
                real ETH is required.
              </li>
              <li style={LI_STYLE}>
                The App is provided for demonstration and research purposes only and may be modified, suspended, or
                discontinued at any time without notice.
              </li>
              <li style={LI_STYLE}>
                Features and smart contracts are unaudited. Do not treat this as production-ready infrastructure.
              </li>
            </ul>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>3. Eligibility</h2>
            <p style={P_STYLE}>
              You must be at least 13 years old to use the App. By using the App, you represent and warrant that you
              meet this age requirement. If you are using the App on behalf of an organization, you represent that you
              have authority to bind that organization to these Terms.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>4. User Accounts & Smart Wallets</h2>
            <p style={P_STYLE}>
              Access to the App requires signing in via email, passkey, or an OAuth provider (e.g., Google). Upon
              sign-in, a non-custodial ERC-4337 smart account is derived from your identity credential and deployed to
              the Base Sepolia testnet.
            </p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>You are responsible for maintaining the security of your sign-in credentials.</li>
              <li style={LI_STYLE}>Your wallet address and all transactions are publicly visible on the blockchain.</li>
              <li style={LI_STYLE}>
                We do not have access to your private key and cannot recover a lost account if you lose access to your
                authentication method.
              </li>
              <li style={LI_STYLE}>You may not create accounts for others without their explicit consent.</li>
            </ul>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>5. Acceptable Use</h2>
            <p style={P_STYLE}>You agree not to use the App to:</p>
            <ul style={UL_STYLE}>
              <li style={LI_STYLE}>Violate any applicable laws, regulations, or third-party rights.</li>
              <li style={LI_STYLE}>Attempt to exploit, abuse, or circumvent the smart contracts or protocol rules.</li>
              <li style={LI_STYLE}>Submit false, misleading, or fraudulent task completions or verification claims.</li>
              <li style={LI_STYLE}>
                Spam, phish, or harass other users or attempt to impersonate another person or entity.
              </li>
              <li style={LI_STYLE}>Interfere with or disrupt the App&apos;s infrastructure, servers, or networks.</li>
              <li style={LI_STYLE}>
                Use automated scripts, bots, or other means to interact with the App in a manner not intended for
                regular users, except with our prior written consent.
              </li>
              <li style={LI_STYLE}>
                Reverse engineer, decompile, or attempt to extract the source code of proprietary components of the App
                (open-source components remain governed by their respective licenses).
              </li>
            </ul>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>6. Testnet Tokens & No Real Value</h2>
            <p style={P_STYLE}>
              All tokens earned, held, or transacted within City/Sync — including CITY credits, VOTE tokens, and MCE
              credits — exist solely on the Base Sepolia testnet and have no monetary value, cannot be withdrawn to
              mainnet, and cannot be exchanged for real currency or any asset of value.
            </p>
            <p style={P_STYLE}>
              We make no representations about the future value of any City/Sync token or asset. Nothing in this App
              constitutes financial, investment, or legal advice.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>7. Intellectual Property</h2>
            <p style={P_STYLE}>
              The City/Sync name, logo, design, and proprietary software components are owned by or licensed to the
              City/Sync project. Nothing in these Terms grants you any right to use our trademarks, trade names, or
              branding without our prior written consent.
            </p>
            <p style={P_STYLE}>
              Smart contract source code and open-source components are governed by their respective open-source
              licenses. Your use of those components must comply with the applicable license terms.
            </p>
            <p style={P_STYLE}>
              You retain ownership of any profile names, descriptions, or content you submit to the App. By submitting
              content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and reproduce that
              content solely to operate the App.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>8. Disclaimer of Warranties</h2>
            <p style={P_STYLE}>
              THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES INCLUDING, BUT NOT
              LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p style={P_STYLE}>
              We do not warrant that the App will be uninterrupted, error-free, or free of viruses or other harmful
              components. We do not warrant that smart contracts will function as intended or that testnet
              infrastructure will remain available.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>9. Limitation of Liability</h2>
            <p style={P_STYLE}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE CITY/SYNC PROJECT, ITS
              CONTRIBUTORS, OR PARTNERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
              DAMAGES.
            </p>
            <p style={P_STYLE}>
              Because this is a demo application using testnet infrastructure with no real monetary value, our total
              liability to you for any claim arising from these Terms or your use of the App shall not exceed zero
              dollars (USD $0.00).
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>10. Indemnification</h2>
            <p style={P_STYLE}>
              You agree to indemnify, defend, and hold harmless the City/Sync project and its contributors from and
              against any claims, liabilities, damages, judgments, awards, losses, costs, or expenses (including
              reasonable attorneys&apos; fees) arising out of or relating to your violation of these Terms or your use
              of the App.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>11. Termination</h2>
            <p style={P_STYLE}>
              We reserve the right to suspend or terminate your access to the App at any time, for any reason, without
              notice. You may stop using the App at any time. Upon termination, the provisions of these Terms that by
              their nature should survive termination will survive, including Sections 6 through 12.
            </p>
          </div>

          <div style={SECTION_STYLE}>
            <h2 style={H2_STYLE}>12. Governing Law</h2>
            <p style={P_STYLE}>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without
              regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the
              exclusive jurisdiction of the courts located in the United States.
            </p>
          </div>

          <div style={{ ...SECTION_STYLE, marginBottom: 0 }}>
            <h2 style={H2_STYLE}>13. Contact</h2>
            <p style={{ ...P_STYLE, marginBottom: 0 }}>
              Questions about these Terms? Please reach out via the City/Sync project repository or official
              communication channels listed at the project homepage. We aim to respond to all inquiries within 5
              business days.
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
            href="/demo/privacy"
            style={{ fontSize: 13, color: "rgba(65,105,225,0.7)", textDecoration: "none", fontWeight: 600 }}
          >
            Privacy Policy →
          </Link>
          <Link href="/demo" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            Back to Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
