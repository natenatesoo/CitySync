# CLAUDE.md

@AGENTS.md

This repository keeps agent guidance in `AGENTS.md` to avoid duplication. Please refer to `AGENTS.md` for the full instructions.

---

# CitySync Project Context

> Read this section at the start of every session before doing anything else.
> For current working state and next steps, also read `docs/SESSION.md`.

## What Is CitySync?

CitySync is programmable civic coordination infrastructure — not a company, not a crypto project. It is a transitory framework for decentralized governance that builds the on-chain plumbing for a civic economy running parallel to the market economy.

Built by Nate (nathansuits / suits.nathan@gmail.com), GitHub: `natenatesoo/CitySync`.

## Core Concept: The Bifurcated Economy

The economy has two circuits:
- **Market circuit** — priced goods and services, driven by profit
- **Civic circuit** — contribution-based, driven by community value

CitySync builds infrastructure for the civic circuit. It does not replace the market; it creates a parallel lane for civic participation.

## How the System Works

**The fundamental loop:**
> Contribute civic labor → earn civic credits → redeem credits for access to public goods and club goods

### The Two On-Chain Assets

1. **Civic Credits** (placeholder name: `$CITY`)
   - Earned by completing verified civic tasks
   - Non-transferable between participants
   - Burned on redemption (not circulating currency)
   - Each city's credits carry a local name; `$CITY` is a generic technical placeholder only
   - **Important:** Use "civic credit" as the primary term with non-technical audiences — `$CITY` reads as a cryptocurrency and gives the wrong impression

2. **`$VOTE`**
   - Issued 1:1 alongside civic credits
   - Non-transferable
   - Used for dPAN management, public proposals, and participatory budgeting

### What Does NOT Exist in This System
- No `$BUDG` token, no `$cityUSDC`, no intermediate currencies
- No three-phase currency evolution (budget-backed → service-backed → autonomous)
- No speculative mechanisms or complex financial layers

## The Three Pilot Roles
1. **Issuers** — Define and verify civic tasks (municipal agencies, nonprofits, universities)
2. **Civic Participants** — Complete tasks, earn credits
3. **Redeemers** — Accept credits in exchange for access to goods and services

## dPANs (Decentralized Public Administration Networks)
Modular, community-governed applications mirroring government functions. The long-term vision; the pilot is the first step. Two archetypes: functional networks (mirror specific government services) and structural networks (reorganize relationships between public sector orgs).

## Five Anti-Coercion Principles
1. Voluntary participation
2. No employment substitution
3. Survival not dependent on credits
4. Universal access
5. No second-class citizenship through redemption

## Government ROI Equation
`Net benefit = administrative savings − $CITY redemptions` (always positive — cities control redemption pricing)

## Key Framing
- Separation of government from administration (not politics from administration)
- CitySync is an R&D framework, not a product launch
- Open-source + marketplace + city-by-city scaling strategy

## Docs Structure
```
docs/
├── SESSION.md             ← Current working state & next steps (read this too)
├── official/              ← Core project documents
│   ├── City_Sync Project Brief.docx           (original)
│   ├── City_Sync Project Brief (Improved).docx (simplified, no founding-essay complexity)
│   ├── City_Sync Problem Definition & Impact Factors.docx (original, not yet improved)
│   ├── City_Sync_Artizen PitchDeck.pdf
│   └── build-brief.js     (docx-js build script)
└── references/            ← Knowledge base: all essays + presentation transcripts
    ├── articles.md        (master index)
    ├── 01–13-*.md         (essays, written after the founding essay)
    ├── 14-local-chains.md (founding essay — written FIRST, most exploratory)
    ├── 15-dpan-presentation.md   (earliest public presentation, Fathom transcript)
    └── 16-citysync-youtube-presentation.md (most polished public talk, YouTube transcript)
```

**Note on essay order:** Essays are numbered in save order, not write order. Essay 14 was written first.

## Environment Notes
- **Node scripts:** `NODE_PATH=/usr/local/lib/node_modules_global/lib/node_modules node <script.js>`
- **Yarn:** Bundled at `.yarn/releases/yarn-3.2.3.cjs`; wrapper at `/sessions/gracious-vigilant-thompson/.local/bin/yarn`; always set `export PATH="/sessions/gracious-vigilant-thompson/.local/bin:$PATH"`
- **Git:** Commits happen here; `git push` must be run by Nate from his Mac terminal (GitHub blocked in sandbox)
- **docx files:** Use docx-js; validate with `python scripts/office/validate.py` from the docx skill directory
