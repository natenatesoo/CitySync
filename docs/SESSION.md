# CitySync — Session State

> Updated at the end of each working session.
> Read this alongside `CLAUDE.md` to get full context before starting work.

---

## Last Updated
2026-03-05

## Current Branch
`main`

## Recent Commits (unpushed or recently pushed)
All commits pushed to `origin/main` as of this session:
- `Add docs folder: reference knowledge base and official documents`
- `Fix pre-commit hook to work in network-restricted environments`

---

## What Has Been Built

### Knowledge Base (`docs/references/`)
All 14 written essays saved as markdown files (01–14), plus two video presentation transcripts (15–16). Each file includes the full source text and a Key Concepts section. Master index at `docs/references/articles.md`.

### Official Documents (`docs/official/`)
- Original Project Brief and Problem Definition docs saved (originals, unmodified)
- Improved Project Brief created (`City_Sync Project Brief (Improved).docx`) — key change: removed founding-essay financial complexity ($BUDG, three-phase evolution), simplified to civic credit model
- Artizen pitch deck saved (`City_Sync_Artizen PitchDeck.pdf`)
- Problem Definition doc has NOT yet been improved (was deferred — had trouble reading the original)

### Git & Dev Environment
- Yarn wrapper installed at `/sessions/gracious-vigilant-thompson/.local/bin/yarn`
- Pre-commit hook (Husky) fixed to find yarn and skip Next.js lint when Linux ARM64 SWC binary is unavailable
- `git push` workflow established: Claude commits here, Nate pushes from Mac terminal
- Reminder cron job set up on Nate's Mac: every 2 days at 2pm, notifies if there are unpushed commits

---

## Pending / Next Steps

### High Priority
- **Improve the Problem Definition & Impact Factors doc** — original is at `docs/official/City_Sync Problem Definition & Impact Factors.docx`. It was uploaded but never successfully read or improved. Read it with pandoc first, then create an improved version using docx-js.

### Medium Priority
- **Second pitch deck** — Nate mentioned there will be many more decks. Consider establishing a consistent visual template.
- **Implementation plan** — A comprehensive implementation plan was created in a previous session (as a .docx). Confirm it is saved in `docs/official/` and review whether it needs updating to reflect the simplified civic credit model.

### Ongoing
- Keep `docs/SESSION.md` updated at the end of each working session
- Commit new work and remind Nate to push when ready

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use "civic credit" as primary term, `$CITY` as technical placeholder only | `$CITY` reads as a cryptocurrency to non-technical audiences |
| Remove three-phase currency evolution from all documents | Founding essay (14) explored ideas that have since been simplified; don't let that complexity leak into current docs |
| No `$BUDG`, no `$cityUSDC`, no intermediate currencies | System is intentionally simple: contribution in, access out |
| Essay 14 is foundational but divergent — reference carefully | It introduced dPANs and the project, but contains speculative financial architecture not in current scope |
| Git commits in sandbox, push from Mac | GitHub egress blocked in Cowork sandbox |
| Skip Next.js lint in Linux ARM64 environment | SWC binary can't be downloaded; real lint enforced on Mac |

---

## Notes on Reading Files in This Environment

- `.docx` files: use `pandoc` to convert to text first: `pandoc -t plain "file.docx"`
- `.pdf` files: use the pdf skill or `pdftotext`
- Large files may need to be read in chunks
- Node scripts need: `NODE_PATH=/usr/local/lib/node_modules_global/lib/node_modules`
