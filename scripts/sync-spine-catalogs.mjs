/**
 * Fetches shared skeleton.json from Variant CDN and writes animations.json + ANIMATIONS.md per type.
 * Safe to run anywhere with network; does not download textures.
 */
import fs from 'fs';
import https from 'https';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const JSON_BASE =
  (process.env.VARIANT_SPINE_JSON_BASE || 'https://cdn-dev.variantbeta.ai/shared/skeletons').replace(
    /\/$/,
    ''
  );

const TYPES = ['man'];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`${url} HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      })
      .on('error', reject);
  });
}

function writeCatalog(characterType) {
  const url = `${JSON_BASE}/${characterType}/skeleton.json`;
  return fetchText(url).then((raw) => {
    const t = raw.trim();
    if (!t.startsWith('{')) {
      throw new Error(`${characterType}: expected JSON from ${url}, got: ${t.slice(0, 60)}...`);
    }
    const data = JSON.parse(raw);
    const animations = Object.keys(data.animations || {}).sort();
    const dir = join(ROOT, 'public', 'spine', characterType);
    fs.mkdirSync(dir, { recursive: true });

    const catalog = {
      characterType,
      skeletonJsonUrl: url,
      animationCount: animations.length,
      animations
    };
    fs.writeFileSync(join(dir, 'animations.json'), `${JSON.stringify(catalog, null, 2)}\n`);

    const md = `# ${characterType} — Spine animations

Skeleton JSON source: \`${url}\`

Total: **${animations.length}** (machine list: \`animations.json\`).

${animations.map((n) => `- \`${n}\``).join('\n')}
`;
    fs.writeFileSync(join(dir, 'ANIMATIONS.md'), md);
    console.log(`OK ${characterType}: ${animations.length} animations`);
  });
}

for (const t of TYPES) {
  await writeCatalog(t);
}
