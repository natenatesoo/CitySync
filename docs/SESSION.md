# CitySync — Session State

> Updated at the end of each working session.
> Read this alongside `CLAUDE.md` to get full context before starting work.

## Starting a New Session
Type **"Start Session"** at the beginning of any new Cowork session. Claude will read `citysync/CLAUDE.md` and `citysync/docs/SESSION.md` and give you a briefing before you begin.

---

## Last Updated
2026-03-06 (Session 4)

## Current Branch
`main`

## Recent Commits (pushed to origin/main)
- `Add demo contract layer: MCE system, identity registries, feedback` ← pending push from Mac
- `Add mid-session save practice to guard against usage limit cutoffs`
- `Replace CSS logo with inline SVG: blue CITY, proper parallelogram slashes` ← pending push from Mac
- `Update landing page: charcoal bg and blue+white mono logo`
- `Add brand identity system and update landing page brand colors`

---

## What Has Been Built

### Knowledge Base (`docs/references/`)
All 14 written essays saved as markdown files (01–14), plus two video presentation transcripts (15–16). Each file includes the full source text and a Key Concepts section. Master index at `docs/references/articles.md`.

### Official Documents (`docs/official/`)
- Original Project Brief and Problem Definition docs saved (originals, unmodified)
- Improved Project Brief (`City_Sync Project Brief (Improved).docx`) — simplified civic credit model, no founding-essay financial complexity
- Artizen pitch deck (`City_Sync_Artizen PitchDeck.pdf`)
- **Whitepaper** (`CitySync Whitepaper.docx`) — comprehensive 11-section whitepaper created this session; covers problem, bifurcated economy theory, system design, on-chain assets, economic model, technical architecture, governance, ethics, pilot program, long-term vision, and conclusion. Includes glossary and reference appendix. 381 paragraphs, validated.
- `build-brief.js` — docx-js build script for improved brief
- `build-whitepaper.js` is at `/sessions/gracious-vigilant-thompson/build-whitepaper.js` (not in repo — move to docs/official/ if needed)
- Problem Definition doc has NOT yet been improved (deferred — had trouble reading original)

### Assets (`docs/official/assets/`)
- `CSVideo.mp4` — project video (nature/purpose TBD — ask Nate)

### Brand Identity System (`docs/brand/`) — NEW Session 3
Full brand asset suite created. True colors extracted from Nate's SVG source files.
- **Confirmed brand colors:** Navy `#23128F`, Gold `#DD9E33`, Black `#000000`, White `#FFFFFF`
- **Website logo style (Session 3 update):** Charcoal background `#15151E`, CITY in royal blue `#4169E1`, double-slash as inline SVG parallelograms (outlined blue left + solid white right), SYNC in white
- **Font:** Rajdhani Bold (heading) + Inter (body) — already on landing page
- **Double-slash mark (web):** inline SVG polygons — left slash outlined #4169E1, right slash solid #FFFFFF; viewBox="0 0 172 30", polygon points precisely calculated
- **logo.svg** saved to `landing/` folder as standalone reference
- **Pre-commit hook** fixed to use direct `/usr/bin/node` path (sh-compatible, no more session path issues)
- `docs/brand/source/` — Nate's original SVG assets (raster-embedded, preserved as master refs)
- `docs/brand/logos/` — 7 clean vector SVG logo variations (primary, dark, light, mono-dark, mono-light, icon, stacked)
- `docs/brand/web/` — favicon.svg, favicon.ico, apple-touch-icon.svg, og-image.svg, icon-{16,32,48,180,192,512}.svg
- `docs/brand/guide/brand-style-guide.html` — comprehensive brand style guide (colors, typography, logo rules, spacing, print, digital)
- `docs/brand/print/letterhead.html` — printable letterhead template
- `docs/brand/print/business-card.html` — business card front+back preview (3.5"×2")

### Smart Contracts (`packages/foundry/contracts/`)

#### Pilot contracts (`contracts/citysync/`) — Session 4, pre-existing + reviewed
- `token/CityToken.sol` — Soul-bound ERC-20 civic credit
- `token/VoteToken.sol` — Soul-bound ERC-20Votes governance token
- `opportunity/OpportunityManager.sol` — Full task lifecycle with 3 verification modes (IssuerOnly, DelegatedVerifiers, EIP712Signature). Already includes representative system via `isVerifierForIssuer`.
- `redeem/RedeemerRegistry.sol`, `Redemption.sol`, `RedemptionReceipt.sol` — Full pilot redemption flow
- `interfaces/` — IEligibility, INonTransferable, IRedemptionPolicy

#### Demo contracts (`contracts/demo/`) — Session 4, NEW
Directory structure: `token/`, `identity/`, `mce/`, `redeem/`, `feedback/`

**Token layer:**
- `token/MCECredit.sol` — Soul-bound ERC-20 for MCE-specific credits. Separate from CivicCredit; `mintTo` takes `mceId` for event tracking. Burns on MCE redemption.

**Identity layer (self-service onboarding):**
- `identity/IssuerRegistry.sol` — Self-registration, auto-generated org name (8 prefixes × 8 suffixes = 64 combos), CERTIFIED_ISSUER_ROLE granted on register. Has STATS_UPDATER_ROLE for task registries to record issuance stats.
- `identity/DemoRedeemerRegistry.sol` — Self-registration, auto-generated venue name. Manages offers (create/update/remove). `setMCEOptIn(bool)` flag required for MCE credit redemption. `getMCERedeemers()` for frontend.

**MCE layer:**
- `mce/MCERegistry.sol` — Full MCE lifecycle: Proposed → Planning → Active → Closed | Rejected. 14-day voting (configurable), 2-day planning. VoteToken-weighted voting. State transitions are permissionless (anyone calls after time elapses).
- `mce/MCETaskRegistry.sol` — MCE-specific tasks. Created during Planning phase, claimable/completable during Active. EIP712 oracle auto-verification (oracle signs after frontend's 10–15s simulated delay). Mints MCECredit + VoteToken. References IssuerRegistry.isActiveIssuer() (not local hasRole — important!).

**Redemption layer:**
- `redeem/MCERedemption.sol` — Burns MCECredit for MCE-specific offers. Requires redeemer `acceptsMCECredits = true`. Emits `MCEOfferPurchased` event for off-chain receipt rendering.

**Auxiliary:**
- `feedback/FeedbackRegistry.sol` — Participant feedback on Issuers/Redeemers. 1–5 rating + 140-char comment. Requires ≥1 CivicCredit to submit (sybil gate). Average rating queryable (×100 for precision). Admin can hide abusive entries.

**Test suite:** `test/CitySyncDemo.t.sol` — comprehensive tests for all demo contracts. Run from Mac: `cd packages/foundry && forge test`

**Deployment role grants required (in deployment script):**
```
mceCredit.grantRole(MINTER_ROLE, address(mceTaskReg))
mceCredit.grantRole(BURNER_ROLE, address(mceRed))
vote.grantRole(MINTER_ROLE, address(mceTaskReg))
issuerReg.grantRole(STATS_UPDATER_ROLE, address(mceTaskReg))
```
Oracle wallet must be granted CITY_ADMIN_ROLE on MCETaskRegistry to sign verifications.

**Design decisions:**
- Demo and pilot contracts are completely separate (no shared inheritance)
- Demo MCE timeline stays at 14 days/2 days — demo is a living city simulation, not a single-session toy
- Task Catalog is backend-managed (anti-spam moderation queue, Nate approves → dropdown options for Issuers)
- Testnet: Base Sepolia (ERC-4337 Paymaster via Alchemy Account Kit for gasless UX)
- `CERTIFIED_ISSUER_ROLE` is managed by IssuerRegistry, not by MCERegistry/MCETaskRegistry — those contracts call `ISSUER_REG.isActiveIssuer()` instead of local hasRole

### Git & Dev Environment
- Pre-commit hook: now uses `/usr/bin/node` directly with `.yarn/releases/yarn-3.2.3.cjs` — no session path dependency
- `git push` workflow: Claude commits here, Nate pushes from Mac terminal
- Cron job on Nate's Mac: every 2 days at 2pm, notifies if unpushed commits exist (`~/citysync-push-reminder.sh`)
- SSH key generated in sandbox but GitHub egress blocked — SSH not usable from sandbox

### Session Memory
- `CLAUDE.md` — auto-read project context (appended to existing Scaffold-ETH AGENTS.md reference)
- `docs/SESSION.md` — this file; updated end of each session

---

## Pending / Next Steps

### High Priority
- **Run `forge test` on Mac** — verify demo contracts compile and all tests pass (`cd packages/foundry && forge test`)
- **Write deployment script** — `script/DeployDemo.s.sol` that deploys all demo contracts in correct order with role grants
- **Alchemy Account Kit integration** — ERC-4337 Paymaster setup on Base Sepolia for gasless demo UX. Fund Paymaster from faucets: Alchemy, Coinbase, Superchain
- **Demo frontend** — mobile wallet UI linked from city-sync.org. Three role chooser screen → mobile app shell with role-specific tabs (Participant: Profile/Explore/MyCity/Vote/Redemptions; Issuer: Profile/Tasks/MyCity/Dashboard/MCEs; Redeemer: Profile/Redemptions/MyCity/Dashboard/MCEs). Wallet icon top-right.
- **Task Catalog backend** — simple form + moderation queue for task proposals; approved tasks appear as dropdown options for Issuers in demo
- **Landing page refinements** — `landing/index.html` is live at `city-sync.org`. Brand colors updated this session (navy #23128F, gold #DD9E33, correct slash mark style). Still needed: (1) replace "DOWNLOAD WHITEPAPER" `#` placeholder with real link once whitepaper is hosted; (2) update Paragraph.com CTA; (3) copy web assets (favicon.svg, og-image.svg) from `docs/brand/web/` into `landing/` folder and commit from Mac.
- **Copy brand web assets to landing/** — copy `docs/brand/web/favicon.svg`, `favicon.ico`, `apple-touch-icon.svg`, `og-image.svg` into `landing/` folder (or `landing/public/`) so they're served by Vercel.
- **dPAN dApp deployment** — second Vercel project from same repo; set Root Directory to `packages/nextjs`; point to `app.city-sync.org` or similar subdomain.
- **Improve the Problem Definition & Impact Factors doc** — original at `docs/official/City_Sync Problem Definition & Impact Factors.docx`. Read with pandoc, create improved version using docx-js.
- **Nate to review and edit the Whitepaper** — he will make modifications; re-generate with updated build script if structural changes needed.

### Medium Priority
- **Move build-whitepaper.js into repo** — currently at `/sessions/gracious-vigilant-thompson/build-whitepaper.js`; copy to `docs/official/` for version control
- **Second pitch deck** — Nate mentioned more decks to come; consider a consistent visual template using brand colors
- **Implementation plan** — created in a previous session; confirm it is saved in `docs/official/` and up to date with simplified civic credit model

### Web3 Dogfooding — Redeemer Partnership Outreach
CitySync acts as its own Issuer, offering public tasks and issuing civic credits redeemable with Web3 public goods partners. Priority outreach targets:

**Tier 1 (highest leverage):**
- **Gitcoin Passport** — add a "verified civic contributor" CitySync stamp; instant distribution across Gitcoin ecosystem. Contact via Twitter/X or Telegram; reach out to Kyle Weiss or Passport product team.
- **OpenCivics** (opencivics.co) — closest philosophical peer; formal partnership or mutual recognition opens city government doors.
- **ETHGlobal** (sponsorships@ethglobal.com) — civic credit holders redeem for hackathon tickets; strong near-term incentive.

**Tier 2 (strategic):**
- **Talent Protocol** — civic credits map to Builder Score; they actively seek novel credential sources.
- **Optimism Collective / Retro Funding** — civic credit holders as retroPGF nominees; entry via gov.optimism.io governance forum.
- **Giveth** (giveth.io) — public goods donation platform; ideologically aligned, approachable team.

**Tier 3 (infrastructure):**
- **Pinata** — IPFS storage credits as Redeemer offering.
- **Akash Network** — decentralized compute credits; actively courts public goods projects.
- **Otterspace** — non-transferable badge NFTs; potential technical partner for credentialing layer.
- **Funding the Commons** — conference speaking slot + Redeemer partnership reinforce each other.
- **Metagov** (metagov.org) — governance research DAO; credibility partner for city government pitches.
- **Plurality Labs** (Arbitrum) — civic credit holders access community grant applications.

### Ongoing
- Update `SESSION.md` and commit at end of each session **and after each major milestone mid-session** (to guard against usage limit cutoffs losing state)
- Remind Nate to `git push` after each session

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use "civic credit" as primary term, `$CITY` as technical placeholder only | `$CITY` reads as a cryptocurrency to non-technical audiences |
| Remove three-phase currency evolution from all documents | Founding essay (14) is exploratory; don't let that complexity leak into current docs |
| No `$BUDG`, no `$cityUSDC`, no intermediate currencies | System is intentionally simple: contribution in, access out |
| Essay 14 is foundational but divergent — reference carefully | Introduced dPANs and project, but contains speculative architecture not in current scope |
| Git commits in sandbox, push from Mac | GitHub egress blocked in Cowork sandbox |
| Skip Next.js lint in Linux ARM64 environment | SWC binary can't be downloaded; real lint enforced on Mac |
| Landing page — separate `landing/` folder, own Vercel project | Two deployments: landing page at city-sync.org, dApp at app.city-sync.org later |
| city-sync.org DNS via GoDaddy | A record → 76.76.21.21; CNAME www → cname.vercel-dns.com; SSL auto-provisioned by Vercel |

---

## Notes on Reading Files in This Environment

- `.docx` files: use `pandoc` to convert to text first: `pandoc -t plain "file.docx"`
- `.pdf` files: use the pdf skill or `pdftotext`
- Large files may need to be read in chunks
- Node scripts: `NODE_PATH=/usr/local/lib/node_modules_global/lib/node_modules node <script.js>`
- Images uploaded inline in Cowork chat are NOT saved to uploads folder — only file attachments are
