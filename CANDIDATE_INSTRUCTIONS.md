# Gameplay take-home — read this first

You’re getting a **small standalone project** (not the full Variant app). Build a ~**60 second** playable moment in **Phaser 4.0.0-rc.6** using the **Spine man** character already in `public/spine/man/`.

---

## 1. Prerequisites

- **Node.js 18+** (LTS fine) — [nodejs.org](https://nodejs.org/)
- A terminal and a code editor
- **Git** (optional but recommended if you submit a repo link)

---

## 2. Run the starter (verify it works)

In the project root (the folder that contains `package.json`):

```bash
npm install
npm start
```

Open **http://localhost:5175** (or the URL Vite prints). You should see the **man** rig **walking**; **Space** plays **Jump**.

- **Canvas:** **9:16 portrait** (**720×1280**), same aspect as our mobile games.
- The project ships with a complete **`public/spine/man/`** bundle. If anything fails to load, confirm that folder is intact (unzip again if needed).

---

## 3. Your task

Read the full brief in **[ASSIGNMENT.md](./ASSIGNMENT.md)**.

**Summary:** Extend the starter into a **micro-game** or interactive scene: one solid **gameplay loop**, ~**one minute** of engagement, **creative** beats polished. Center the experience on the **Spine man** and use **animations** (`public/spine/man/animations.json` and **ANIMATIONS.md** list names).

---

## 4. Helpful commands

| Command | When |
|--------|------|
| `npm start` | Dev server + hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |

More detail (optional): [SETUP.md](./SETUP.md)

---

## 5. What to submit

Send **one** of:

- **GitHub (or similar) repo link** — must be readable without our VPN; include a **README** with your short dev log (below), **or**
- **ZIP file** of the project **without** `node_modules` (we will run `npm install` ourselves).

**Include a short “dev log”** (README section or `DEVLOG.md`):

1. **What you built** and why  
2. **One technical challenge** you hit with Phaser or Spine  
3. **What you’d add** with another ~48 hours  

**Deadline & where to send:** use the email you received (e.g. grace@tryvariant.com) unless told otherwise.

---

## 6. Licenses

- **Spine** npm packages: [Esoteric Spine Runtimes license](https://github.com/EsotericSoftware/spine-runtimes/blob/master/LICENSE).  
- **Character assets** in `public/spine/man/`: use **only for this exercise**; do not redistribute for other products.

---

## 7. Questions?

Reply to the recruiting email you got with this assignment. Good luck — we’re excited to see what you make.
