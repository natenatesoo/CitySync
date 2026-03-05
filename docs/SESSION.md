# CitySync — Session State

> Updated at the end of each working session.
> Read this alongside `CLAUDE.md` to get full context before starting work.

---

## Last Updated
2026-03-05

## Current Branch
`main`

## Recent Commits (pushed to origin/main)
- `Add docs folder: reference knowledge base and official documents`
- `Fix pre-commit hook to work in network-restricted environments`
- `Add session memory: CLAUDE.md project context and docs/SESSION.md`
- `Add end-of-session reminder to CLAUDE.md`
- `Update SESSION.md with this session's work and next steps`
- `Add landing/ — standalone Vercel landing page for City/Sync`

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
- CitySync logo: navy background, "CITY" in white, "SYNC" in gold, double diagonal slash divider. Logo exists as PNG on Nate's Mac but cannot be uploaded as a file via Cowork (comes through inline only). **For landing page:** Nate should place logo PNG directly into `packages/nextjs/public/` on his Mac; commit from there.
- Brand colors: Navy ~#0D1245, Gold ~#B8860B, White #FFFFFF

### Git & Dev Environment
- Yarn wrapper at `/sessions/gracious-vigilant-thompson/.local/bin/yarn`
- Pre-commit hook fixed: finds yarn, skips Next.js lint when Linux ARM64 SWC binary unavailable
- `git push` workflow: Claude commits here, Nate pushes from Mac terminal
- Cron job on Nate's Mac: every 2 days at 2pm, notifies if unpushed commits exist (`~/citysync-push-reminder.sh`)
- SSH key generated in sandbox but GitHub egress blocked — SSH not usable from sandbox

### Session Memory
- `CLAUDE.md` — auto-read project context (appended to existing Scaffold-ETH AGENTS.md reference)
- `docs/SESSION.md` — this file; updated end of each session

---

## Pending / Next Steps

### High Priority
- **Landing page refinements** — `landing/index.html` is live at `city-sync.org` (deployed to Vercel, DNS configured via GoDaddy). Outstanding items: (1) replace "DOWNLOAD WHITEPAPER" `#` placeholder with real link once whitepaper is hosted; (2) update the Paragraph.com CTA with the preferred primary call-to-action; (3) add the real logo PNG — Nate should place it in `landing/` folder on his Mac and reference it in the HTML.
- **dPAN dApp deployment** — second Vercel project from same repo; set Root Directory to `packages/nextjs`; point to `app.city-sync.org` or similar subdomain.
- **Improve the Problem Definition & Impact Factors doc** — original at `docs/official/City_Sync Problem Definition & Impact Factors.docx`. Read with pandoc, create improved version using docx-js.
- **Nate to review and edit the Whitepaper** — he will make modifications; re-generate with updated build script if structural changes needed.

### Medium Priority
- **Move build-whitepaper.js into repo** — currently at `/sessions/gracious-vigilant-thompson/build-whitepaper.js`; copy to `docs/official/` for version control
- **Second pitch deck** — Nate mentioned more decks to come; consider a consistent visual template using brand colors
- **Implementation plan** — created in a previous session; confirm it is saved in `docs/official/` and up to date with simplified civic credit model

### Ongoing
- Update `SESSION.md` and commit at end of each session
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
