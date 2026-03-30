/**
 * Copies full Spine bundles from a generative_games_v2 checkout:
 *   <repo>/public/assets/spines/man  →  takehome/public/spine/man
 *
 * Then refreshes animations.json + ANIMATIONS.md from the local skeleton.json files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEST_ROOT = path.join(ROOT, 'public', 'spine');

const SRC_ROOT = (
  process.env.VARIANT_SPINE_SOURCE ||
  path.join(ROOT, '..', 'public', 'assets', 'spines')
).replace(/\/$/, '');

const TYPES = ['man', 'woman', 'dog', 'cat'];

function writeCatalogFromFile(characterType, jsonPath) {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  const animations = Object.keys(data.animations || {}).sort();
  const dir = path.join(DEST_ROOT, characterType);
  const catalog = {
    characterType,
    skeletonJson: 'skeleton.json',
    atlas: 'skeleton.atlas',
    animationCount: animations.length,
    animations
  };
  fs.writeFileSync(path.join(dir, 'animations.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  const md = `# ${characterType} — Spine animations

Total: **${animations.length}** (from local \`skeleton.json\`; see \`animations.json\`).

${animations.map((n) => `- \`${n}\``).join('\n')}
`;
  fs.writeFileSync(path.join(dir, 'ANIMATIONS.md'), md);
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(SRC_ROOT)) {
  console.error(`Missing spine source directory:\n  ${SRC_ROOT}\n\nSet VARIANT_SPINE_SOURCE or place assets under:\n  generative_games_v2/public/assets/spines/man`);
  process.exit(1);
}

for (const t of TYPES) {
  const src = path.join(SRC_ROOT, t);
  if (!fs.existsSync(src)) {
    console.warn(`Skip ${t}: no folder ${src}`);
    continue;
  }
  const dest = path.join(DEST_ROOT, t);
  copyRecursive(src, dest);
  const jsonPath = path.join(dest, 'skeleton.json');
  if (fs.existsSync(jsonPath)) {
    writeCatalogFromFile(t, jsonPath);
    console.log(`OK ${t}: copied + refreshed animation lists`);
  } else {
    console.warn(`WARN ${t}: copied but no skeleton.json`);
  }
}

console.log('Done. Run npm start — demo uses /spine/man/.');
