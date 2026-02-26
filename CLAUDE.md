# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run dev` — start Vite dev server (http://localhost:5173/pingpong-sf/)
- `npm run build` — TypeScript check + Vite build + copy 404.html for SPA routing
- `npm run preview` — preview production build locally

## Architecture

Ping Postman Pong SF is a static React + TypeScript SPA deployed to GitHub Pages. It's a table tennis leaderboard with ELO ratings.

**Data persistence:** All data lives in `data.json` on the `main` branch. The app reads/writes it via the GitHub Contents API (base64-encoded). Writes create commits on main. The `shaRef` in DataContext tracks the file SHA for optimistic concurrency — a 409 means someone else wrote first. The deploy workflow ignores `data.json` changes (`paths-ignore`) so data writes don't trigger rebuilds.

**ELO system** (`src/elo.ts`): Standard chess ELO with a Margin of Victory multiplier: `ln(|scoreDiff| + 1)` scaled by an autocorrelation factor that amplifies upsets. K-factor is 32, MOV capped at 0.5x–2.5x.

**Score validation:** Winning score must be exactly 11 or 21 (ping pong rules). No negative scores, no ties.

**Routing:** BrowserRouter with `basename="/pingpong-sf"`. The build copies `index.html` to `404.html` so direct URL navigation works on GitHub Pages. Admin page (`/admin`) is intentionally hidden from nav — access via direct URL only.

**Auth:** Admin password is checked client-side against `VITE_ADMIN_PASSWORD`. The GitHub PAT (`VITE_GITHUB_PAT`) is a fine-grained token scoped to this repo with Contents read/write.

## Environment Variables

Set in `.env` locally, in GitHub Actions secrets for production:

- `VITE_ADMIN_PASSWORD` — admin page password
- `VITE_GITHUB_PAT` — fine-grained GitHub PAT (repo: nnandan-postman/pingpong-sf, permission: Contents read/write)

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml` → builds and deploys to GitHub Pages via `actions/deploy-pages`. Repo Settings > Pages > Source must be set to "GitHub Actions".

Live URL: https://nnandan-postman.github.io/pingpong-sf/
