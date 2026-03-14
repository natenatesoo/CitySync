import { NextResponse } from "next/server";

export const dynamic = "force-static";

const TERMS_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Terms of Service - City/Sync Demo</title>
    <meta name="description" content="City/Sync Demo Application Terms of Service" />
    <style>
      :root {
        color-scheme: dark;
      }
      body {
        margin: 0;
        padding: 40px 20px;
        background: #15151e;
        color: #f4f4f8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.65;
      }
      main {
        max-width: 800px;
        margin: 0 auto;
        background: #1e1e2c;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 28px 24px;
      }
      h1,
      h2 {
        line-height: 1.25;
        margin: 0 0 12px;
      }
      h1 {
        font-size: 2rem;
      }
      h2 {
        font-size: 1.1rem;
        margin-top: 24px;
      }
      p,
      li {
        color: rgba(255, 255, 255, 0.88);
      }
      a {
        color: #7fa6ff;
      }
      .meta {
        color: rgba(255, 255, 255, 0.7);
        margin: 0 0 18px;
      }
      .note {
        padding: 12px 14px;
        border: 1px solid rgba(127, 166, 255, 0.35);
        border-radius: 10px;
        background: rgba(65, 105, 225, 0.12);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Terms of Service</h1>
      <p class="meta">Last updated: March 13, 2026</p>

      <p class="note">
        Demo application notice: City/Sync is a public demonstration running on Base Sepolia testnet. Tokens and balances in
        this demo are test-only and have no real monetary value.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the City/Sync demo application, you agree to these Terms of Service. If you do not agree, do
        not use the service.
      </p>

      <h2>2. Demo Service Scope</h2>
      <p>
        The app is provided for testing and demonstration purposes. Features may change without notice. We may suspend or
        discontinue demo access at any time.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 13 years old to use this demo. If you are using it on behalf of an organization, you confirm you
        have authority to do so.
      </p>

      <h2>4. Accounts and Wallets</h2>
      <ul>
        <li>Authentication may be performed through email, passkey, or social login.</li>
        <li>An ERC-4337 smart account may be created and used for testnet actions.</li>
        <li>You are responsible for maintaining access to your authentication method.</li>
      </ul>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the app for unlawful activity.</li>
        <li>Attempt to exploit contracts, abuse infrastructure, or interfere with service availability.</li>
        <li>Impersonate others or submit fraudulent actions through the demo flow.</li>
      </ul>

      <h2>6. Testnet No-Value Disclaimer</h2>
      <p>
        CITY, VOTE, and MCE balances shown in this demo exist on testnet and do not represent real currency or transferable
        financial assets.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        City/Sync names, logos, and proprietary design/content remain owned by City/Sync or its licensors. Open-source
        components remain governed by their own licenses.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        The app is provided "as is" and "as available" without warranties of any kind, express or implied, including
        reliability, availability, and fitness for a particular purpose.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, City/Sync is not liable for indirect, incidental, special, consequential, or
        punitive damages arising from use of the demo.
      </p>

      <h2>10. Contact</h2>
      <p>
        Terms questions: <a href="mailto:hello@city-sync.org">hello@city-sync.org</a>
      </p>
    </main>
  </body>
</html>`;

export function GET() {
  return new NextResponse(TERMS_HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
