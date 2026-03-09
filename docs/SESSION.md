# CitySync — Session State

> Updated at the end of each working session.
> Read this alongside `CLAUDE.md` to get full context before starting work.

## Starting a New Session
Type **"Start Session"** at the beginning of any new Cowork session. Claude will read `citysync/CLAUDE.md` and `citysync/docs/SESSION.md` and give you a briefing before you begin.

## Maintenance Rule
When major product, contract-integration, or deployment-impacting changes are made, update this `SESSION.md` in the same working session before commit.

---

## Last Updated
2026-03-08 (Session 17)

## Current Branch
`main`

## Session 17 Summary (2026-03-08)

### Completed This Session
- Diagnosed why new `/demo` onchain wiring appeared disconnected after redeploy:
  - root cause was provider mismatch (`/demo` authenticated via Account Kit, while demo reads/writes used app-level `wagmi` config targeting Foundry/local).
- Added `packages/nextjs/app/demo/_config/baseSepoliaClient.ts`:
  - explicit Base Sepolia viem public client using Alchemy RPC when `NEXT_PUBLIC_ALCHEMY_API_KEY` is present.
- Updated `packages/nextjs/app/demo/_context/DemoContext.tsx`:
  - migrated account source from `wagmi` to `@account-kit/react` (`useAccount({ type: "ModularAccountV2" })`).
  - replaced `useReadContracts` with direct Base Sepolia reads via `baseSepoliaPublicClient.readContract` polling every 6s.
  - replaced `wagmi` `writeContractAsync` with Account Kit user-op writes:
    - `useSmartAccountClient`
    - `useSendUserOperation`
    - `encodeFunctionData` + `sendUserOperationAsync` helper
  - kept existing reducer/UI flow so demo interactions remain immediate while writes are sent onchain.
- Updated `packages/nextjs/app/demo/_components/OnchainActivityPanel.tsx`:
  - migrated from `wagmi` account/public client hooks to Account Kit account + explicit Base Sepolia public client.
  - now polls latest block and fetches role-filtered logs directly from Base Sepolia.
- Updated role pages to source wallet address from Account Kit instead of `wagmi`:
  - `packages/nextjs/app/demo/participant/page.tsx`
  - `packages/nextjs/app/demo/issuer/page.tsx`
  - `packages/nextjs/app/demo/redeemer/page.tsx`
- Validation:
  - `yarn next:lint --fix --file ...` passes (only existing non-blocking `<img>` warnings remain).
  - `yarn next:check-types` passes.
- Redeemer Offerings flow now writes onchain from the UI:
  - `redeemer/page.tsx` committed and MCE offering handlers now call `redeemerAddOffer(...)` with mapped `RedemptionOffer` payloads.
  - Added explicit `Last Offer Write` status block in Offerings tab with `pending | confirmed | failed` state and Base Sepolia explorer link when hash is present.
  - This closes the ambiguity where offerings appeared created in UI without an explicit onchain success/failure signal.
- Follow-up reliability fixes after live verification:
  - Fixed Redeemer right-side onchain panel `OfferCreated` log filter to match deployed event signature (added missing `description` field in the event shape).
  - Prevented repeated role-setting loops on Issuer/Redeemer pages by making role mount-effect run once.
  - Added safe error handling to auto-register writes in `setRole(...)` to avoid unhandled promise rejections.
- Task issuance wiring pass:
  - `issuerCreateTask(...)` now returns onchain write status and resolves the real `opportunityId` from `OpportunityCreated` logs when available.
  - Issuer UI now tracks `Last Task Write` state (`pending | confirmed | failed`) with explorer link.
  - Issuing tasks from catalog now uses returned onchain task ID (`task-<opportunityId>`) when available so downstream claim/verify mapping aligns with contract IDs.
  - Added preflight role check for task issuance: frontend now checks `OpportunityManager.hasRole(CERTIFIED_ISSUER_ROLE, issuerAddress)` before write and surfaces a clear admin action message instead of opaque user-op revert.
- Demo contract architecture update for smooth self-serve issuer UX:
  - Added `contracts/demo/opportunity/DemoOpportunityManager.sol`, a demo-specific manager that keeps existing opportunity lifecycle/events but gates `createOpportunity` by `IssuerRegistry.isActiveIssuer(msg.sender)` instead of manual `CERTIFIED_ISSUER_ROLE` approval flow.
  - Updated `script/DeployDemo.s.sol` to deploy `DemoOpportunityManager` and wire CITY/VOTE minter roles to it.
  - Updated frontend issuer preflight in `DemoContext.tsx` to validate against `IssuerRegistry.isActiveIssuer` instead of `OpportunityManager.hasRole`.
- Deployment alignment:
  - Updated `packages/nextjs/app/demo/_config/baseSepoliaContracts.ts` hardcoded addresses to match the latest Base Sepolia deployment set from `deployments/84532.json`.
- Issuer UX persistence tweak:
  - Issuer Verify `slotInstances` now persist in browser storage keyed by connected wallet, so issued instances remain visible after switching roles and returning to Issuer view.
- Right-side activity panel changed from wallet-scoped to role-scoped network feed:
  - `OnchainActivityPanel` now fetches role-relevant events without address filtering and displays cumulative onchain activity from all users of the selected role.
- Reliability pass for issuer → participant task flow and issuer activity feed:
  - Added persisted task-state hydration in `DemoContext` (`availableTasks`, `issuer.tasks`, `issuer.totalTasksIssued`) so issued tasks survive provider remounts/role switching and continue appearing in Participant Open Tasks.
  - Added issuer activity fallback query in `OnchainActivityPanel` (all logs from OpportunityManager address in range) to ensure recent issuer onchain activity is visible even if strict event decoding/filter shape drifts.
- Follow-up visibility fix:
  - Participant Open Tasks now defensively merges `availableTasks` + `issuer.tasks`, dedupes by task ID, and sorts newest-first (onboarding pinned first) so newly issued tasks are easier to find.
  - Reduced activity query window and narrowed fallback window in `OnchainActivityPanel` to avoid provider log-range failures that could silently produce empty issuer activity feeds.
- Task persistence race fix:
  - Prevented `DemoContext` task-state persistence from writing initial reducer state before local hydration completes; this avoids wiping issued tasks during remount/role switches.
- Issuer Verify UX alignment with shared-state flow:
  - Removed `Move to Claimed` button from Issued instances in Issuer Verify tab; Issued section now only supports removal, as claim progression should be driven by participant-side activity.
- Onchain-only participant task sourcing + activity feed robustness:
  - Participant Explore now fetches tasks directly from onchain `OpportunityManager` (`nextOpportunityId`, `opportunities(id)`, `claimedBy(id)`), parses metadata, and builds Open/My task lists from contract state instead of simulated local task arrays.
  - Right-side activity panel was simplified to role-relevant contract log streams (per contract address) rather than strict event-shape decoding to reduce empty-feed failures when ABI/event-shape drift occurs.
- Follow-up fix for missing Open Tasks and blank activity panel:
  - Fixed onchain task discovery off-by-one in Participant Explore (`opportunityId` loop now includes `0` and only treats `nextOpportunityId == 0` as empty), which restores visibility for first-issued tasks on deployments where IDs start at zero.
  - Hardened role activity feed log queries with wider lookback and per-contract fallback window so temporary RPC/query-range failures no longer zero out the entire right-side panel.
  - Updated Issuer Verify empty-state copy to remove simulation wording and reflect chain-driven claim flow.
- Issuer Verify migrated to chain-derived state:
  - Verify tab no longer depends on local `slotInstances` simulation for lifecycle transitions.
  - Issued / Claimed / Completed sections are now built from live `OpportunityManager` reads for the connected issuer:
    - Issued: issuer opportunities with zero-address `claimedBy`
    - Claimed: `claimedBy` set, no completion submission yet
    - Completed: completion submitted onchain and awaiting issuer verification
  - Verify action now calls onchain `verifyCompletion` directly for the claimant/opportunity pair from this live snapshot.
- Issuer Tasks tab simulation removal:
  - Removed local `slotInstances` state, localStorage persistence, and reissue-slot simulation handlers from Issuer app state.
  - Tasks tab now builds Active Tasks and Pending Verifications from live `OpportunityManager` reads for the connected issuer.
  - Active Tasks now show onchain completion cap (`maxCompletions`) and verified counts; slot-based simulated counters/actions were removed.
- Issuer Pending tab and activity feed follow-up:
  - Removed completion verification cards/actions from Issuer Tasks → Pending section; Pending now only represents simulated proposal-approval flow.
  - Verification/mint actions are now isolated to Issuer Verify → Completed section (onchain completion submitted, awaiting issuer verification).
  - Hardened right-panel onchain activity retrieval to scan recent blocks in backward chunks per role contract, improving reliability when RPC rejects large-range log queries.
- Issuer Task Catalog workflow refactor:
  - Removed simulated task catalog dependency from Issuer role (`MOCK_TASKS`-backed catalog options no longer appear in issuance flow).
  - After proposal approval, tasks now live in Issuer Task Catalog only; My Tasks no longer shows inline “Approved Catalog” issue cards.
  - Renamed CTA to `Issue Task from Catalog`.
  - Catalog modal now lists only approved tasks and routes issuance through the slot-count popup, then writes onchain and updates Active Tasks from chain state.
- Issuer activity panel decoding and labeling:
  - Added issuer registry profile read ABI support (`getAllIssuers`, `getProfile`) to map wallet addresses to issuer org names in UI activity entries.
  - Issuer right panel now labels entries as `Issuer Onchain Activity (Global)`.
  - Activity rows now render as `Issuer Org Name · functionName` with explicit `View Tx` explorer links.
  - Added recent-block transaction scan fallback for issuer contracts when log-based queries return sparse/empty results.
- Stability fixes for activity and active-task flicker:
  - Issuer activity panel now uses direct recent-block transaction scanning (issuer contracts only) as the primary path, instead of relying on potentially flaky large-range log queries.
  - Issuer activity panel preserves last successful snapshot when a poll cycle returns empty/fails, preventing visible disappear/reappear behavior.
  - Issuer Active Tasks sync now keeps last good onchain task snapshot on transient read errors instead of clearing the list to empty.
- Issuer issuance semantics update (per-slot onchain create):
  - Issuing a task with `N` slots now performs `N` onchain `createOpportunity` writes (each with `maxCompletions = 1`) instead of a single write with `maxCompletions = N`.
  - Issuer UI status now reports full success, partial success, or failure across the multi-write batch.
  - Removed `Max completions` wording from Issuer Active Tasks cards to reduce confusion.
- Issuer task/write panel visibility and activity-feed reliability follow-up:
  - `Last Task Write` status box is now shown only in Tasks → My Tasks (removed from Pending view).
  - Issuer activity feed now uses chunked contract log reads from IssuerRegistry + OpportunityManager, then decodes event names to function labels, rather than relying on transaction-shape assumptions.
  - Activity and Active Tasks panels both preserve last good snapshot on transient read failures to avoid disappear/reappear flicker.
- Issuer activity listener simplification:
  - Replaced issuer feed with incremental block-cursor event scanning focused on `OpportunityManager` task lifecycle events.
  - Feed now appends newly observed `OpportunityCreated` and `CompletionVerified` events, maps issuer org names where available, and keeps an in-memory deduped rolling window.
  - This removes dependence on expensive full-history rescans and improves consistency with Account Abstraction transaction paths.
- Issuer persistence follow-up:
  - Added local persistence for Issuer Task Catalog templates (`approvedCatalogTasks`) keyed by issuer wallet so approved tasks remain available after role switches/sign-out/sign-in.
  - Added local persistence for Issuer activity feed snapshot + cursor so recent activity remains visible across role switches/re-auth while continuing to append new onchain events.
- Activity persistence bug fix:
  - Fixed issuer activity cache serialization by converting `bigint` fields (`blockNumber`, `timestamp`) to strings for localStorage and restoring them to `bigint` on hydration.
  - This resolves silent localStorage write failures that prevented activity panel persistence.
- Issuer Verify write-status UX:
  - Added a dedicated `Last Verify & Mint Write` status box in Issuer Verify → Completed, matching the Task Issuance status format.
  - Updated `issuerVerifyCompletion` context action to return write status `{ ok, hash, error }` so the verify UI can render confirmed/failed state and explorer link.

### Current State
- `/demo` onchain reads/writes/activity now resolve through the same Account Kit + Base Sepolia context.
- This removes the previous silent failure mode where authenticated demo users were not using the same client/network for contract actions.

### Next Step
1. Add explicit toast/error surfacing for user-op write failures currently swallowed with `.catch(() => undefined)` so failed writes are visible in UI.
2. After next deploy, verify each role by executing one action and confirming corresponding tx appears in both wallet activity and right-side onchain panel.

## Session 16 Summary (2026-03-08)

### Completed This Session
- Added first live `/demo` → Base Sepolia shared-state bridge.
- Created `packages/nextjs/app/demo/_config/baseSepoliaContracts.ts` with Base Sepolia addresses + ABIs for demo sync reads.
- Updated `packages/nextjs/app/demo/_context/DemoContext.tsx`:
  - Added `wagmi` `useReadContracts` polling for:
    - `CityToken.balanceOf(address)`
    - `VoteToken.balanceOf(address)`
    - `MCECredit.balanceOf(address)` (minimal ABI)
    - `OpportunityManager.hasRole(CERTIFIED_ISSUER_ROLE, address)`
    - `RedeemerRegistry.canRedeem(address)`
  - Added `SYNC_ONCHAIN_STATE` reducer action to hydrate:
    - `participant.cityBalance`
    - `participant.voteBalance`
    - `participant.mceBalance`
    - `issuer.registered`
    - `redeemer.registered`
- Added hybrid write handlers in `DemoContext` (preserve existing reducer UX while attempting contract writes):
  - `setRole("issuer" | "redeemer")` now attempts self-registration on demo registries.
  - `claimTask` / `unclaimTask` now attempt `OpportunityManager.claimOpportunity` / `unclaimOpportunity` for mapped task IDs.
  - `startVerify` now attempts `OpportunityManager.submitCompletion` with generated proof hash at timer completion.
  - `issuerCreateTask` now attempts `OpportunityManager.createOpportunity` with JSON metadata + CITY reward.
  - `issuerVerifyCompletion` now attempts `OpportunityManager.verifyCompletion` for mapped task IDs.
  - `redeemerToggleMCE` now attempts `DemoRedeemerRegistry.setMCEOptIn`.
  - `redeemerAddOffer` / `redeemerRemoveOffer` now attempt `DemoRedeemerRegistry.createOffer` / `removeOffer`.
- Added participant redemption route mapping support:
  - `packages/nextjs/app/demo/_config/baseSepoliaContracts.ts` now includes `Redemption` contract ABI + `DEMO_OFFER_ROUTES` parser from `NEXT_PUBLIC_DEMO_OFFER_ROUTES`.
  - `redeemOffer` in `DemoContext` now attempts onchain `purchaseOffer` for mapped offers:
    - City credits path → `Redemption.purchaseOffer`
    - MCE credits path → `MCERedemption.purchaseOffer`
  - Unmapped offers continue reducer-local fallback to keep demo UX intact.
- Replaced right-side role stat panels with live Base Sepolia transaction activity feeds + explorer links:
  - new `app/demo/_components/OnchainActivityPanel.tsx`
  - participant/issuer/redeemer panels now show recent role-relevant txs with tx hash, block number, and timestamp
- Removed hard dependency on manual `NEXT_PUBLIC_DEMO_OFFER_ROUTES` for ongoing redeemer onboarding:
  - `DemoContext` now discovers redeemers and offers directly from `DemoRedeemerRegistry` (`getAllRedeemers`, `getProfile`, `nextOfferId`, `getOffer`)
  - discovered onchain offers are merged into demo offer list and route automatically to:
    - `Redemption.purchaseOffer` for CITY offers
    - `MCERedemption.purchaseOffer` for MCE-only offers
  - `NEXT_PUBLIC_DEMO_OFFER_ROUTES` remains optional fallback for legacy static mock offer IDs
- Updated role shells to surface connected wallet address in app chrome instead of only fake placeholder addresses.
- Type-check confirmed passing: `yarn workspace @se-2/nextjs check-types`

### Current State
- `/demo` now uses chain-backed balances and role registration flags across all role views.
- `/demo` now performs best-effort contract writes for core role/task/offer actions while preserving current reducer flows for UX continuity.
- Onchain offer discovery/routing no longer requires manual redeemer wallet entry in Vercel for newly created offers.
- Remaining parity gaps are mainly semantic/UI-model differences (e.g., slot-instance lifecycle versus single opportunity IDs).

### Next Step
- Wire `/demo` write actions to contracts incrementally:
  1. task claim/unclaim + completion submit/verify
  2. redeemer offer create/remove + MCE opt-in
  3. redemption/purchase flows and history from onchain events

## Recent Commits (needs push)
- `Round-3: VerifyTab per-slot instances, venue cleanup, logo centering` (075f599) ← Session 15 — **needs push**
- `fix: remove unused randomAddress variable causing build failure` (3e5a1ba) ← Session 15 — **needs push**
- `Round-2 edits: issuer task bug fix + redeemer offering updates` (6e34ca7) ← Session 15 — **needs push**
- `Redesign landing page with new institutional narrative` (df36cce) ← Session 15 — **needs push**
- `Redeemer role Round-1 overhaul` (be89de1) ← Session 15 — **needs push**
- `fix: remove unused mces var, MCECard, MetricCard to clear Vercel ESLint errors` (28d9cfb) ← Session 14 — **needs push**
- `Round-6 issuer role: Verify tab, MCE tab revamp, approved catalog flow` (3ac0f4c) ← Session 14 — **needs push**
- `fix: add mode popup to social auth config` (0287b6b) ← Session 8 ✅ BUILD PASSING

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

### Demo Frontend (`packages/nextjs/app/demo/`) — NEW Session 5

Full interactive demo built with React, Tailwind, and hybrid state. Three roles, each a standalone mobile-first app with 5 tabs. Shared `DemoContext` (useReducer) still drives most UI workflows, and now syncs key state from Base Sepolia (CITY/VOTE/MCE balances + issuer/redeemer registration flags) so role views share chain-backed state.

**Files:**
- `_data/mockData.ts` — **UPDATED Session 13** (originally Session 10). Now 15 tasks: added `task-11` through `task-15` (Neighborhood Mural Design Input, Library Book Sorting & Cataloging, Youth Sports Day Volunteer, Transit Stop Accessibility Audit, Urban Air Quality Monitoring). Task type now includes `taskDate`, `successCriteria`, `creditRatePerHr`, `credentials` fields. Originally: Onboarding category with 3 tasks, 5 Epoch 1 MCE proposals (all Voting), 6 Epoch 2 proposals, 7 mock org Posts, 7 redemption offers, 3 issuer profiles. `Epoch2Proposal` and `Post` types.
- `_context/DemoContext.tsx` — **UPDATED Session 13** (originally Session 10). `VERIFY_DURATION` constant changed from 12→7. ParticipantState adds: `citizenName`, `mceVoteAllocations`, `likedPostIds`, `likedEpoch2Ids`. New actions: `SET_CITIZEN_NAME`, `UNCLAIM_TASK`, `ALLOCATE_MCE_VOTE`, `LIKE_POST`, `LIKE_EPOCH2`. `ISSUER_CREATE_TASK` wraps `Task` into `IssuerTask` (adds `pendingCompletions: []`, `verifiedCount: 0`). `issuerCreateTask` adds task to both `issuer.tasks` AND `availableTasks` (participant-visible). Budget tracking via `creditsCommitted = issuer.tasks.reduce((sum, t) => sum + t.credits, 0)`.
- `_context/DemoContext.tsx` — **UPDATED Session 16.** Added `wagmi` `useReadContracts` sync loop for onchain state hydration from Base Sepolia. New reducer action `SYNC_ONCHAIN_STATE` updates: `participant.cityBalance`, `participant.voteBalance`, `participant.mceBalance`, `issuer.registered`, `redeemer.registered` from contract reads. Reads currently target `CityToken.balanceOf`, `VoteToken.balanceOf`, `MCECredit.balanceOf` (minimal ABI), `OpportunityManager.hasRole(CERTIFIED_ISSUER_ROLE, address)`, and `RedeemerRegistry.canRedeem(address)`.
- `_config/baseSepoliaContracts.ts` — **NEW Session 16.** Centralized Base Sepolia addresses and ABIs for demo sync wiring: `CityToken`, `VoteToken`, `MCECredit`, `OpportunityManager`, `RedeemerRegistry`.
- `_components/AppShell.tsx` — Full-screen fixed overlay (hides Scaffold-ETH header). Phone-width container (max-width 480px), header with wallet button, scrollable content, BottomNav.
- `_components/BottomNav.tsx` — 5-tab bottom navigation; active tab highlighted in role accent color.
- `_components/WalletModal.tsx` — Bottom sheet showing CITY/VOTE/MCE balances, wallet address, role badge.
- `_components/VerifyingOverlay.tsx` — 12-second oracle verification animation. Circular progress ring, step-by-step status messages ("Submitting proof to oracle…", "Minting CITY credits…"), animated progress dots.
- `layout.tsx` — Wraps all /demo routes in `<DemoProvider>`.
- `page.tsx` — Role chooser. Full-screen fixed overlay (z-50, suppresses Scaffold-ETH header/footer). CITY//SYNC SVG logo (matches website), 3 role cards (Civic Participant, Issuer Organization, Redeemer Organization) with full content rewrites, 6-card Key Concepts section (Issuance Caps, Balance, Rate Guidance, MCEs, Task Catalog, Role Governance).
- `participant/page.tsx` — **REBUILT Session 10.** Profile (editable citizen name, CITY/VOTE/MCE balance cards, tasks completed/credits earned stats, active vote allocations with link to Vote tab), Explore (Open Tasks / My Tasks toggle; category filter including Onboarding; onboarding tasks locked for non-new members; Unclaim + Execute buttons in My Tasks; Execute triggers 12s countdown overlay), MyCity (simulated org post feed, Recent/Top toggle, like/boost per post), Vote (Epoch 1: 5 MCE proposals with allocatable VOTE tokens via +/− steppers, progress bar; Epoch 2: browse upcoming proposals, like to signal interest), Redeem (CITY/MCE filter pills, confirm modal with QR note, past redemptions history).
- `issuer/page.tsx` — **UPDATED Session 15** (previously Session 13). Profile tab: org logo/photo upload; Epoch 1 Allocation progress bar. Tasks tab: two CTA buttons (Add from Catalog / Propose New Task); My Tasks section now shows `X/N slots active` counter per task; "Issue Z unissued tasks" button appears when slots have been removed. Verify tab: **fully overhauled** — per-slot instance model (`SlotInstance` type). Issuing N slots creates N individual instance cards. Issued section: each card has "Remove Task" (removes slot) + "Move to Claimed" buttons. Claimed section: "No Show" (removes slot) + "Move to Completed" buttons. Completed section: "Verify & Mint Credits" (mints via context, removes instance). `slotInstances: SlotInstance[]` and handlers (`handleRemoveSlotInstance`, `handleMoveSlotToClaimed`, `handleMoveSlotToCompleted`, `handleReissueSlots`) live in `IssuerApp` state; old `removedTaskIds`/`handleRemoveIssuedTask` removed. Bug fix: `ISSUER_CREATE_TASK` reducer no longer injects random mock `pendingCompletions` — new tasks start clean. `DemoContext.tsx` updated accordingly. Gold `#DD9E33` accent throughout.
- `redeemer/page.tsx` — **UPDATED Session 15** (rebuilt Session 12). Full inline-style rewrite. Profile: editable org name, logo upload, Venue Information card (Address, Phone Number, Website — all editable via pencil icon, inline save/cancel flow; Status + Network rows removed). Offerings tab (renamed from Redeem): two-toggle Committed / MCE; `AddOfferingSheet` form-based (name, CITYx cost, stipulations); Committed type: button "Lock Committed Offering" → epoch-lock confirmation popup ("This Offering will remain Valid until the end of the current Epoch. Are you sure?"); MCE type: multi-select checkboxes for up to 5 MCE proposals (single offering linked to multiple MCEs), duration options removed (locked until MCE ends); `MCECustomOffering` type uses `mceIds[]`/`mceNames[]` instead of `mceId`/`mceName`/`duration`. MyCity, Dashboard, MCE tabs unchanged. `CustomOffering` and `MCECustomOffering` types local (not in context). Teal `#34eeb6` accent throughout.

**Design system:** All inline Tailwind + hardcoded brand hex values. Full-screen fixed overlay at z-50. Charcoal `#15151E` background, `#1E1E2C` card surfaces. Role accent colors consistent throughout each app. Safe-area-inset support for iPhone notch.

**Link:** `/citysync` hub page now has a "Try the Interactive Demo" card pointing to `/demo`.

### Vercel Build Fixes — Sessions 6 & 7

Multiple rounds of Vercel build failures diagnosed and resolved across two sessions.

**Round 1 — Prettier config (Session 6, `26c93bc`):**
- Root cause: `.prettierrc.js` with `require.resolve()` failed silently on Vercel → fell back to 80-char printWidth
- Fix: replaced with plain JSON `.prettierrc`. Added `varsIgnorePattern: "^_"` to ESLint. Removed 6 dead-code unused vars.

**Round 2 — Suspense boundary (Session 6, `1a12257`):**
- Root cause: `useSearchParams()` in `/citysync/redeem/page.tsx` not wrapped in `<Suspense>`
- Fix: extracted `RedeemContent` component, wrapped with `<Suspense>`

**Round 3 — viem version (Session 7, `9e4a513`):**
- Root cause: `@account-kit/infra@4.84.1` peer dep requires `viem ^2.45.0`; project pinned `viem: 2.39.0`
- Fix: bumped `packages/nextjs/package.json` to `"viem": "^2.45.0"`, added root `resolutions: { "viem": "^2.45.0" }`

**Round 4 — Account Kit API changes (Session 7, `813574a`):**
- Root cause 1: `cookieToInitialState` moved from `@account-kit/react` → `@account-kit/core` in v4.84.1
- Root cause 2: `AlchemyAccountProvider` now requires explicit `queryClient` prop (not just surrounding `QueryClientProvider`)
- Fix: updated imports in `demo/layout.tsx`, added `queryClient={demoQueryClient}` in `DemoProviders.tsx`

**Round 5 — Social auth type (Sessions 7, `5a552cb` + `007c4a1`):**
- Root cause 1: auth type `"google"` no longer valid — must use `"social"` with `authProviderId`
- Root cause 2: `{ type: "social" }` alone fails TypeScript — requires `authProviderId: "google"`
- Fix: `{ type: "social" as const, authProviderId: "google" as const }`

**Round 6 — Social auth `mode` required (Session 8, `0287b6b`):**
- Root cause: Account Kit v4.84.1 made `mode` a required field on social auth entries — `{ type: "social", authProviderId: "google" }` fails TypeScript without it
- Fix: added `mode: "popup" as const` to the social auth object (consistent with `enablePopupOauth: true` already in config)

**Status:** ✅ Build confirmed passing after Session 8 fix. Vercel deployment live.

### Google OAuth Setup — Session 8

Google sign-in required setting up a Google Cloud Console OAuth app and wiring credentials into Alchemy. Steps for future reference:

1. Google Cloud Console → new project → APIs & Services → OAuth consent screen → External → fill in app name + emails → Publish App (not Testing)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID → Web application
3. Authorized JavaScript origins: `https://city-sync.org`, `http://localhost:3000`
4. Authorized redirect URIs: `https://signer.alchemy.com/callback`, `https://auth.alchemy.com/callback`
5. Copy Client ID and Client Secret → paste into Alchemy → Smart Wallets → config → Social Login → Google
6. Alchemy whitelisted origins: `https://city-sync.org`, `https://www.city-sync.org`, `https://demo.city-sync.org`, `http://localhost:3000`

**Key gotcha:** The correct Alchemy redirect URI is `https://signer.alchemy.com/callback`, not `https://auth.alchemy.com/callback`. Using the wrong one causes `redirect_uri_mismatch` from Google.

**Status:** ✅ Google sign-in working. Email OTP working. Passkey available.

---

### Account Kit Integration — Session 6–7

Alchemy Account Kit v4 integrated for embedded wallets + gasless UX on the demo.

**Files created:**
- `app/demo/_config/accountKit.ts` — `createConfig` with Base Sepolia, Alchemy transport, Gas Manager Policy, email + passkey + social(Google) auth sections, SSR cookie storage
- `app/demo/_components/DemoProviders.tsx` — client component wrapping demo in separate `QueryClient` + `AlchemyAccountProvider` + `DemoProvider`
- `app/demo/_components/LoginScreen.tsx` — CitySync-branded login screen, opens Account Kit auth modal on button tap

**Files updated:**
- `app/demo/layout.tsx` — server component reading cookie for SSR initial state via `cookieToInitialState` (from `@account-kit/core`)
- `app/demo/page.tsx` — auth gate: shows `<LoginScreen />` if `!isConnected`, role chooser otherwise

**Env vars (set in Vercel + local `.env.local`):**
- `NEXT_PUBLIC_ALCHEMY_API_KEY` = the Alchemy API key (domain-restricted, safe for client)
- `NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID` = Gas Manager policy ID

**Key architectural notes:**
- Separate `QueryClient` scoped to demo (`demoQueryClient`) — avoids conflicts with Scaffold-ETH's QueryClient
- Same `demoQueryClient` passed to both `QueryClientProvider` and `AlchemyAccountProvider` (required by v4.84.1)
- `cookieToInitialState` is in `@account-kit/core`, not `@account-kit/react`
- `NEXT_PUBLIC_` env vars are client-visible by design — Alchemy keys are domain-restricted

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
- **Demo onchain integration (writes + shared state parity)** — in progress (Session 16). Read-side sync for balances/role status is now live in `/demo`; next pass is wiring task claim/submit/verify, offer create/remove, and redemption actions to contract writes.
- **~~Civic Participant demo rebuild~~** — ✅ Done (Session 10).
- **~~Issuer Organization demo rebuild~~** — ✅ Done (Session 11).
- **~~Redeemer Organization demo rebuild~~** — ✅ Done (Session 12).
- **~~Demo round-3: Participant MyCity/Vote/Redeem overhaul~~** — ✅ Done (Session 13, commit `1be51e0`).
- **~~Demo round-4: task limits, timing, sort, phone overlay, 5 tasks~~** — ✅ Done (Session 13, commit `fa76efb`).
- **~~Issuer role edits: logo, Epoch 1 allocation, ProposeTaskSheet, budget cap~~** — ✅ Done (Session 13, commit `9dfcb96`).
- **~~Issuer Round-6: Verify tab, MCE tab revamp, approved catalog, ProposeTaskSheet fixes~~** — ✅ Done (Session 14, commit `3ac0f4c`).
- **~~Redeemer role Round-1 overhaul~~** — ✅ Done (Session 15, commit `be89de1`). Offerings tab, AddOfferingSheet, MCE multi-select, Profile Venue Info.
- **~~Landing page redesign~~** — ✅ Done (Session 15, commit `df36cce`). New institutional narrative, hero centered logo (075f599).
- **~~Issuer/Redeemer Round-2 edits~~** — ✅ Done (Session 15, commit `6e34ca7`). Task pending bug fixed, offering button/confirmation, MCE checkboxes, venue fields.
- **~~Issuer Round-3: VerifyTab per-slot instances~~** — ✅ Done (Session 15, commit `075f599`). Full slot-lifecycle flow across Issued → Claimed → Completed.
- **~~Verify Vercel build passes~~** — ✅ Done. Build passing as of Session 8 (`0287b6b`).
- **git push** — 8 commits unpushed. Run `git push` from Mac.
- **Verify Vercel build passes** — push triggers new build; watch for prettier/ESLint errors.
- **Rotate Alchemy API key** — the key was shared in chat during setup. Go to Alchemy dashboard → Apps → CitySync → Edit → Regenerate key. Update `NEXT_PUBLIC_ALCHEMY_API_KEY` in Vercel env vars and local `.env.local`.
- **Issuer end-to-end test** — Test flow: Propose task → Approve → Issue Task popup (set slots) → Participant Explore tab sees the task → Verify VOTE = CITYx matches.
- **Set up `demo.city-sync.org` subdomain** — add CNAME record in GoDaddy: `demo` → `cname.vercel-dns.com`, add domain in Vercel project settings.
- **Run `forge test` on Mac** — verify demo contracts compile and all tests pass (`cd packages/foundry && forge test`)
- **Broadcast deployment to Base Sepolia** — contracts already deployed (addresses in `packages/foundry/deployments/84532.json`). Commit those deployment files: `git add packages/foundry/deployments/ packages/foundry/broadcast/ && git commit -m "chore: add Base Sepolia deployment artifacts"`
- **Wire demo frontend to live contracts** — replace `mockData.ts` constants with real contract reads/writes. Swap DemoContext's reducer actions for wagmi hooks + contract calls. EIP712 oracle backend (simple Node.js signer service) needed for task verification flow.
- **Task Catalog backend** — simple form + moderation queue for task proposals; approved tasks appear as dropdown options for Issuers in demo.
- **Landing page refinements** — `landing/index.html` fully redesigned (Session 15, `df36cce`). Hero logo centered (`075f599`). Still needed: (1) replace "DOWNLOAD WHITEPAPER" `#` placeholder with real link; (2) update Paragraph.com CTA; (3) copy web assets (favicon.svg, og-image.svg) from `docs/brand/web/` into `landing/` folder.
- **Copy brand web assets to landing/** — copy `docs/brand/web/favicon.svg`, `favicon.ico`, `apple-touch-icon.svg`, `og-image.svg` into `landing/` folder so they're served by Vercel.
- **dPAN dApp deployment** — Next.js Vercel project already created; point to `app.city-sync.org` subdomain once build is confirmed green.
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
| city-sync.org DNS via GoDaddy | A record → 76.76.21.21; CNAME www → cname.vercel-dns.com; SSL auto-provisioned by Vercel. GoDaddy "WebsiteBuilder Site" parking record must be deleted — it intercepts traffic before A record. |
| Demo and pilot smart contracts are completely separate codebases | Cleaner separation; no shared inheritance or dual-mode flags |
| Base Sepolia chosen over Arbitrum Sepolia for testnet | Better Paymaster tooling (Alchemy Account Kit), Superchain ecosystem alignment (Gitcoin, Optimism Retro Funding), more reliable faucets |
| Demo MCE timeline stays at 14 days voting / 2 days planning | Demo is a living city simulation, not a single-session toy — users return to vote and watch events progress |
| Task Catalog is backend-managed, not on-chain | Faster iteration, no gas for catalog changes, Nate reviews proposals before they appear as Issuer dropdown options |
| Pilot verification: Issuer wallet calls verifyCompletion() directly | Simple and decentralized; representatives (delegated via isVerifierForIssuer) can also verify on the org's behalf |
| Pilot attestation: quality score (1–5) + IPFS CID stored on verifyCompletion() | Builds participant reputation over time; text stored off-chain via IPFS to save gas |
| MCECredit is a separate soul-bound token from CivicCredit | MCE participation deserves distinct recognition; enables a wider/different redemption universe |
| Demo oracle verification via EIP712 signature after frontend timer | 10–15s "Verifying…" spinner → backend oracle signs → verifyCompletionWithSig() mints credits. No Issuer action needed in demo. |
| Mid-session SESSION.md commits after every major milestone | Guard against usage limit cutoffs losing session state |
| Demo frontend uses mocked data first, not live contracts | Faster to build and preview; wire to real contracts after Base Sepolia deployment |
| VerifyTab uses per-slot `SlotInstance` local state, not context IssuerTask | Each issued slot needs independent lifecycle (Issued → Claimed → Completed → Minted); context IssuerTask still tracks verifiedCount |
| `ISSUER_CREATE_TASK` reducer no longer injects mock `pendingCompletions` | Newly issued tasks start clean; initial mock tasks in state still carry pre-set mock completions from `INITIAL_STATE` |
| MCE offering uses multi-select checkboxes, not single-select radio | Redeemers can signal support for multiple MCE proposals with one offering, providing incentive visibility to voters |
| Epoch lock confirmation popup on "Lock Committed Offering" | Extra friction prevents accidental irreversible epoch locks in the demo |
| Venue Information (Redeemer) is editable local state, not dispatched to context | Address/phone/website are venue-specific presentation data, not cross-role shared state |
| Full-screen fixed overlay for demo (z-50, covers Scaffold-ETH header) | Cleanest way to build a custom mobile UI without ejecting Scaffold-ETH's layout |
| Demo state managed by a single shared DemoContext (useReducer) | Cross-role interactions (Participant spends credits at Redeemer offers, etc.) require shared global state |
| QR codes rendered as deterministic SVG pixel grids (no external library) | Avoids bundle bloat; QR content is a `citysync://redeem?offer=...` URI suitable for real app scanning |
| Verification animation changed from 12s → 7s countdown | Faster demo flow; still long enough to feel meaningful but less dead time for demo viewers |
| Epoch cap budget = `issuer.tasks.reduce((sum, t) => sum + t.credits, 0)` | Counts credits-per-task (not × slots) for simplicity; keeps budget demo intuitive without overly complex math |
| ProposeTaskSheet credits = `creditRate × parsedHours(estimatedTime)` | Auto-computes from the two most natural inputs; falls back to 1h if no hour count can be parsed |
| Approved proposed tasks use same `issuerCreateTask` path as catalog tasks | Reuses existing reducer action so approved tasks flow to `availableTasks` (participant-visible) without extra plumbing |
| `.prettierrc.js` replaced with plain JSON `.prettierrc` | `require.resolve()` in `.prettierrc.js` silently fails in Vercel's build environment, causing Prettier to fall back to 80-char printWidth and generating hundreds of lint warnings |
| `varsIgnorePattern: "^_"` added to ESLint no-unused-vars rule | Allows intentional stub variables (dead code kept for near-future wiring) to be prefixed with `_` without triggering build errors |
| Base Sepolia demo contracts are already deployed | Addresses committed in `deployments/84532.json`; deployment files just need to be committed to git |
| Separate `QueryClient` for Account Kit, passed explicitly as prop | Account Kit v4.84.1 requires `queryClient` prop on `AlchemyAccountProvider`; using a separate one avoids conflicts with Scaffold-ETH's QueryClient |
| `cookieToInitialState` imported from `@account-kit/core`, not `@account-kit/react` | Moved packages in Account Kit v4.84.1 — core utilities live in the core package |
| Social auth type requires `authProviderId: "google"` | Account Kit v4.84.1 requires explicit provider ID with `type: "social"`; bare `{ type: "social" }` fails TypeScript |
| viem pinned at `^2.45.0` via both package.json and root resolutions | Account Kit v4.84.1 peer dep requires `^2.45.0`; root `resolutions` field forces all transitive deps to use a compatible version |
| Social auth requires `mode: "popup"` | Account Kit v4.84.1 made `mode` a required field on social auth entries; `"popup"` matches `enablePopupOauth: true` in the same config |

---

## Notes on Reading Files in This Environment

- `.docx` files: use `pandoc` to convert to text first: `pandoc -t plain "file.docx"`
- `.pdf` files: use the pdf skill or `pdftotext`
- Large files may need to be read in chunks
- Node scripts: `NODE_PATH=/usr/local/lib/node_modules_global/lib/node_modules node <script.js>`
- Images uploaded inline in Cowork chat are NOT saved to uploads folder — only file attachments are

---

## 2026-03-09 — Redeemer Catalog + Activity Persistence

- Redeemer right panel heading renamed to **Redeemer Onchain Activity (Global)**.
- Added local persistence/hydration for redeemer onchain activity feed:
  - storage key: `citysync:demo:redeemer:activity:v1`
  - first-write guard to avoid overwriting hydrated entries on initial mount.
- Redeemer Offerings flow split into **catalog** vs **active issued offerings**:
  - New buttons in both sections:
    - `+ Issue Offering From Catalog`
    - `+ Add Offering to Catalog` (renamed from `+ Add New Offering`)
  - Section labels updated to:
    - `Active Committed Offerings`
    - `Active MCE Offerings`
- Added separate, non-shared persisted catalogs:
  - Committed catalog key: `citysync:demo:redeemer:committed-catalog:v1`
  - MCE catalog key: `citysync:demo:redeemer:mce-catalog:v1`
- Added bottom-sheet picker to issue from the relevant catalog:
  - selecting a template issues an onchain write and creates an active offering instance.

## 2026-03-09 — Redeemer Catalog UX + Commit Flow + Activity Feed Stability

- `Add Offering` sheet is now strictly catalog-focused:
  - title updated to `Add Offering to your Catalog`
  - submit button updated to `Add To Catalog`
  - removed lock/epoch warning copy from catalog add/edit flow
- `Issue Offering From Catalog` sheet now supports:
  - `Modify Offering` (opens prefilled editor and updates catalog in place)
  - `Commit Offering` (replaces prior `Issue Onchain` label)
  - commit confirmation popup with lock/commitment warning before onchain write
- Added catalog edit wiring for both committed and MCE catalogs with persistence retained.
- Redeemer activity panel engine upgraded from generic backward polling to incremental cursor-based ingestion:
  - tracks `DemoRedeemerRegistry`, `Redemption`, and `MCERedemption` logs by new blocks
  - decodes function call names from tx input where possible
  - resolves actor labels via `DemoRedeemerRegistry` profiles when available
  - persists items + cursor under `citysync:demo:redeemer:activity:v1`

## 2026-03-09 — MCE Offering Auto Opt-In

- Updated `redeemerAddOffer` in `DemoContext` to auto-call `setMCEOptIn(true)` before `createOffer` when committing an MCE offering (`mceOnly=true`).
- Added reducer action `REDEEMER_SET_MCE_OPT_IN` to keep local redeemer state aligned after automatic opt-in.
- This removes the requirement for a separate UX toggle; creating an MCE offering now performs opt-in implicitly.

## 2026-03-09 — Redeemer Active Offerings Persistence

- Added persistence/hydration for active redeemer offerings lists in `redeemer/page.tsx`:
  - `citysync:demo:redeemer:active-committed:v1`
  - `citysync:demo:redeemer:active-mce:v1`
- Active Committed Offerings and Active MCE Offerings now persist across tab/role switches and refreshes.
