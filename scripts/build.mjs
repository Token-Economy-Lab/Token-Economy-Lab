import { existsSync } from 'node:fs';
import { readdir, readFile, realpath, rm, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { noteIds } from './policy.mjs';
import { releaseDigest } from './release-digest.mjs';
import { readMaterials } from './content-policy.mjs';

const mode = process.argv[2];
if (!['examples', 'private'].includes(mode)) throw new Error('Choose examples or private build mode.');
const root = await realpath('.');
// A failed build must never leave a previous release available to publish.
await rm('dist', { recursive: true, force: true });
await rm('build/release.json', { force: true });
if (mode === 'private' && existsSync('.env')) process.loadEnvFile('.env');
const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };
if (mode === 'examples') {
  env.CONTENT_DIR = resolve('examples/notes');
  delete env.STATICRYPT_PASSWORD;
  env.RELEASE_MODE = 'examples';
} else {
  if (!env.CONTENT_DIR) throw new Error('CONTENT_DIR is required. Formal releases cannot use example notes.');
  const dir = await realpath(resolve(env.CONTENT_DIR));
  if (dir === root || dir.startsWith(root + sep)) throw new Error('Formal content must live outside the public code checkout.');
  if (!env.STATICRYPT_PASSWORD || env.STATICRYPT_PASSWORD.length < 14) throw new Error('A release password of at least 14 characters is required.');
  const files = await readdir(dir);
  for (const id of noteIds) {
    if (!files.includes(`${id}.md`)) throw new Error('A required private note is missing.');
    if ((await readFile(resolve(dir, `${id}.md`), 'utf8')).includes('PUBLIC_EXAMPLE_CONTENT')) throw new Error('Example notes cannot be published as a formal release.');
  }
  env.CONTENT_DIR = dir;
  env.RELEASE_MODE = 'private';
}
// Prevent Astro's persisted content store from mixing examples and real notes.
await rm('.astro', { recursive: true, force: true });
await rm('build', { recursive: true, force: true });
await rm('dist', { recursive: true, force: true });
function run(file, args = []) {
  const result = spawnSync(process.execPath, [file, ...args], { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
const materials = await readMaterials(env.CONTENT_DIR);
if (mode === 'private') for (const entry of materials.entries) if (entry.raw.includes('PUBLIC_EXAMPLE_CONTENT')) throw new Error('Example notes cannot be published as a formal release.');
await mkdir('build', { recursive: true });
await writeFile('build/expected-routes.json', JSON.stringify(materials.routes));
const publishedText = materials.published.map(e => e.raw).join('\n');
const draftFragments = materials.entries.filter(e => !e.data.publish).flatMap(e => [e.data.title, ...e.raw.replace(/^---[\s\S]*?---\s*/, '').split('\n').filter(line => line.trim().length >= 24)]).filter(v => typeof v === 'string' && v.length >= 16 && !publishedText.includes(v));
await writeFile('build/draft-fragments.json', JSON.stringify(draftFragments));
run('node_modules/astro/astro.js', ['build']);
run('scripts/verify.mjs', ['--plain']);
if (mode === 'private') {
  run('scripts/protect.mjs');
  run('scripts/verify.mjs');
  await writeFile('build/release.json', JSON.stringify({ mode: 'private', codeSha: env.CODE_SHA || 'local', files: await releaseDigest() }, null, 2));
}
