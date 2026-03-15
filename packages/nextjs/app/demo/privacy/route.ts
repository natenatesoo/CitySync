import { NextResponse } from "next/server";

export const dynamic = "force-static";

const PRIVACY_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Privacy Policy - City/Sync Demo</title>
    <meta name="description" content="City/Sync Demo Application Privacy Policy" />
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
      <h1>Privacy Policy</h1>
      <p class="meta">Last updated: March 13, 2026</p>

      <p class="note">
        Demo application notice: City/Sync currently runs as a public demo on the Base Sepolia testnet. No real assets or
        fiat funds are processed by this demo.
      </p>

      <h2>1. Information We Collect</h2>
      <p>When you use the City/Sync demo, we may collect:</p>
      <ul>
        <li>Authentication data used for sign-in (for example, Google OAuth identity).</li>
        <li>Your smart account wallet address.</li>
        <li>Profile data you provide in-app, such as display name and profile image.</li>
        <li>Usage activity such as task actions, redemptions, and votes.</li>
        <li>Standard technical data (browser, operating system, IP address, and request logs).</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>To authenticate users and maintain session state.</li>
        <li>To operate demo smart-account and onchain interactions on Base Sepolia.</li>
        <li>To display account profile preferences in the app.</li>
        <li>To monitor performance, reliability, and abuse of the demo.</li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>3. Local Storage and Cookies</h2>
      <p>
        The app uses browser storage and cookies for session continuity and demo preferences. You can clear this data through
        your browser settings at any time.
      </p>

      <h2>4. Public Blockchain Data</h2>
      <p>
        Transactions made through the demo are written to a public testnet blockchain. Wallet addresses and transaction
        history may be publicly visible and are not fully erasable once onchain.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>
        City/Sync integrates with external providers including Google OAuth and Alchemy Account Kit. These providers may
        process data under their own privacy terms.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain operational logs and support records only as long as needed for demo operations and security. Onchain data
        follows blockchain permanence properties.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        City/Sync is not intended for children under 13. If you believe a child submitted personal data, contact us for
        removal where possible.
      </p>

      <h2>8. Contact</h2>
      <p>
        Privacy questions: <a href="mailto:city-sync@pm.me">city-sync@pm.me</a>
      </p>

      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 28px 0 20px;" />
      <p style="margin: 0; display: flex; gap: 20px; flex-wrap: wrap;">
        <a href="/demo/terms">Terms of Service</a>
        <a href="/demo">← Back to Demo</a>
      </p>
    </main>
  </body>
</html>`;

export function GET() {
  return new NextResponse(PRIVACY_HTML, {
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
