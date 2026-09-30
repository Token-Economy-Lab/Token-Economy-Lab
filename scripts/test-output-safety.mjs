import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Inspect a copy so the verified local release and preview are never modified.
const root = await mkdtemp(join(tmpdir(), 'token-economy-output-'));
try {
  for (const dir of ['scripts', 'build', 'dist']) await cp(dir, join(root, dir), { recursive: true });
  function run(script, expected) {
    const result = spawnSync(process.execPath, [`scripts/${script}`], { cwd: root, encoding: 'utf8' });
    if (expected) {
      assert.notEqual(result.status, 0, 'Unsafe output was accepted.');
      assert(result.stderr.includes(expected), 'Output was rejected for an unexpected reason.');
    } else assert.equal(result.status, 0, 'Baseline verified release failed.');
  }
  run('verify.mjs');
  run('verify-release.mjs');
  const extra = join(root, 'dist/leaked-notes.json');
  await writeFile(extra, '{"unexpected":"asset"}');
  run('verify.mjs', 'Unapproved public asset');
  await rm(extra);
  const plainPath = join(root, 'build/plain/notes/first-principles/index.html');
  const article = await readFile(plainPath, 'utf8');
  const fragment = (article.match(/<div class="prose">([\s\S]*?)<\/div>/)?.[1] || '').split(/<[^>]*>/).find(s => s.trim().length >= 24)?.trim();
  assert(fragment, 'Expected real note text for the leak test.');
  const gatePath = join(root, 'dist/index.html');
  const gate = await readFile(gatePath, 'utf8');
  await writeFile(gatePath, gate + fragment);
  run('verify.mjs', 'Unencrypted note content');
  run('verify-release.mjs', 'Release files changed');
  await writeFile(gatePath, gate);
  const metadata = JSON.parse(await readFile(join(root, 'build/metadata-fragments.json'), 'utf8'));
  assert(metadata.length, 'Expected material metadata for the leak test.');
  await writeFile(gatePath, gate + metadata[0]);
  run('verify.mjs', 'Unencrypted material metadata');
  await writeFile(gatePath, gate);
  const draftFragments = JSON.parse(await readFile(join(root, 'build/draft-fragments.json'), 'utf8'));
  if (draftFragments.length) {
    await writeFile(gatePath, gate + draftFragments[0]);
    run('verify.mjs', 'Unpublished draft');
    await writeFile(gatePath, gate);
  }
  const missing = join(root, 'dist/topics/cache/index.html');
  const encrypted = await readFile(missing);
  await rm(missing);
  run('verify.mjs', 'Every route must be encrypted');
  await writeFile(missing, encrypted);
  await writeFile(plainPath, article.replace('href="/learn/"', 'href="/missing-route/"'));
  run('verify.mjs', 'Broken local link');
  console.log('PASS: unapproved assets, leaked text/metadata, modified release files, missing encrypted pages and broken internal links prevent publication.');
} finally { await rm(root, { recursive: true, force: true }); }
