# Take-home setup & re-run cheat sheet

**Candidates:** you usually only need **[CANDIDATE_INSTRUCTIONS.md](./CANDIDATE_INSTRUCTIONS.md)**. This file is extra detail for refresh / maintenance.

All commands run from this folder (where `package.json` lives).

## First time (or new machine)

```bash
npm install
npm start
```

Open **http://localhost:5175**. Canvas is **9:16 portrait** (720×1280), same aspect as Variant games. **`public/spine/man/`** is committed with the project; keep it complete.

---

## Re-run / refresh

| Goal | Command |
|------|--------|
| Refresh **animation name lists** (`animations.json` + `ANIMATIONS.md`) from CDN | `npm run sync-spine-catalogs` |
| Replace **everything under `public/spine/man/`** with art from the Variant monorepo | `npm run copy-spine` |

`copy-spine` expects `generative_games_v2/public/assets/spines/man/` (or set `VARIANT_SPINE_SOURCE`). Use that when you have the full repo; candidates do not need it.

---

## Production build

```bash
npm run build
npm run preview
```
