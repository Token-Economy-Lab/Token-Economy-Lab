import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import assert from 'node:assert/strict';
import { assetExtensions, routes as baselineRoutes } from './policy.mjs';

const plain = resolve('build/plain'), dist = resolve('dist');
const site = 'https://token-economy-lab.github.io';
async function files(root) {
  const out = [];
  for (const e of await readdir(root, { withFileTypes: true })) {
    assert(!e.isSymbolicLink(), 'Symbolic links are not allowed in output.');
    const p = resolve(root, e.name);
    out.push(...(e.isDirectory() ? await files(p) : [p]));
  }
  return out;
}
const rawFiles = await files(plain), html = rawFiles.filter(p => p.endsWith('.html'));
const routes = JSON.parse(await readFile('build/expected-routes.json', 'utf8'));
for (const route of [...baselineRoutes, '/systems/']) assert(routes.includes(route), 'Legacy route was removed.');
const expected = routes.map(route => route.slice(1) + 'index.html').sort();
assert.deepEqual(html.map(file => relative(plain, file)).sort(), expected, 'Expected all published site routes.');
const privateFragments = [];
const draftFragments = JSON.parse(await readFile('build/draft-fragments.json', 'utf8'));
for (const file of rawFiles.filter(p => ['.html', '.js', '.css', '.svg', '.json', '.txt'].includes(extname(p)))) {
  const data = await readFile(file, 'utf8');
  for (const fragment of draftFragments) assert(!data.includes(fragment), 'Unpublished draft in output.');
}
for (const file of html) {
  const data = await readFile(file, 'utf8');
  for (const fragment of draftFragments) assert(!data.includes(fragment), 'Unpublished draft in output.');
  assert(!data.includes('/token-economy/'), 'Old project base path remains.');
  const pagePath = '/' + relative(plain, file).replace(/index\.html$/, '');
  for (const match of data.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), site + pagePath);
    if (url.origin !== site) continue;
    const target = resolve(plain, '.' + decodeURIComponent(url.pathname));
    assert(target === plain || target.startsWith(plain + '/'), 'Invalid local link.');
    let targetFile = target;
    try {
      if ((await stat(target)).isDirectory()) targetFile = resolve(target, 'index.html');
      await stat(targetFile);
    } catch { throw new Error(`Broken local link in ${relative(plain, file)}.`); }
    if (url.hash && targetFile.endsWith('.html')) {
      const id = decodeURIComponent(url.hash.slice(1));
      const targetHTML = targetFile === file ? data : await readFile(targetFile, 'utf8');
      assert(targetHTML.includes(`id="${id}"`), `Missing anchor in ${relative(plain, file)}.`);
    }
  }
  const prose = data.match(/<div class="prose">([\s\S]*?)<\/div>/)?.[1] || '';
  for (const part of prose.split(/<[^>]*>/)) if (part.trim().length >= 24) privateFragments.push(part.trim());
}
for (const file of rawFiles.filter(p => p.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)) {
    const url = new URL(match[1], site + '/' + relative(plain, file));
    if (url.origin === site) await stat(resolve(plain, '.' + decodeURIComponent(url.pathname)));
  }
}
if (process.argv.includes('--plain')) {
  console.log(`Verified ${html.length} routes, root paths, resources and internal links.`);
} else {
  const output = await files(dist);
  assert.deepEqual(output.filter(p => p.endsWith('.html')).map(p => relative(dist, p)).sort(), expected, 'Every route must be encrypted.');
  for (const file of output) {
    const path = relative(dist, file), ext = extname(file);
    assert(ext === '.html' || assetExtensions.has(ext) || ['robots.txt', '.nojekyll'].includes(path), 'Unapproved public asset.');
    if (['.woff', '.woff2'].includes(ext)) continue;
    const data = await readFile(file, 'utf8');
    for (const fragment of draftFragments) assert(!data.includes(fragment), 'Unpublished draft in public output.');
    assert(!data.includes('STATICRYPT_PASSWORD='), 'Password assignment in output.');
    if (process.env.STATICRYPT_PASSWORD) assert(!data.includes(process.env.STATICRYPT_PASSWORD), 'Password in output.');
    for (const fragment of privateFragments) assert(!data.includes(fragment), 'Unencrypted note content in output.');
    if (ext === '.html') assert(data.includes('staticryptEncryptedMsgUniqueVariableName'), 'Missing encryption marker.');
  }
  for (const file of rawFiles.filter(p => assetExtensions.has(extname(p)))) {
    assert((await readFile(file)).equals(await readFile(resolve(dist, relative(plain, file)))), 'Missing or changed static asset.');
  }
  console.log(`Verified ${html.length} encrypted routes, approved assets and plaintext exclusion.`);
}
