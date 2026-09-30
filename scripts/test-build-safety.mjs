import { mkdtemp, mkdir, writeFile, cp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Run in a temporary code directory to avoid reading a maintainer's local .env.
const root = await mkdtemp(join(tmpdir(), 'token-economy-safety-'));
try {
  const code = join(root, 'code'), notes = join(root, 'notes');
  await mkdir(code);
  await cp('scripts', join(code, 'scripts'), { recursive: true });
  await cp('examples', join(code, 'examples'), { recursive: true });
  await mkdir(notes);
  const env = { ...process.env };
  delete env.CONTENT_DIR;
  delete env.STATICRYPT_PASSWORD;
  async function rejects(extra, expected) {
    await mkdir(join(code, 'dist'), { recursive: true });
    await writeFile(join(code, 'dist/stale.html'), 'previous release');
    const result = spawnSync(process.execPath, ['scripts/build.mjs', 'private'], { cwd: code, env: { ...env, ...extra }, encoding: 'utf8' });
    assert.notEqual(result.status, 0, 'Unsafe formal build was accepted.');
    assert(result.stderr.includes(expected), 'Formal build did not fail for the expected reason.');
    await assert.rejects(stat(join(code, 'dist')), 'Failed build left stale publication files.');
  }
  await rejects({}, 'CONTENT_DIR is required');
  await rejects({ CONTENT_DIR: join(code, 'examples/notes'), STATICRYPT_PASSWORD: 'example-only-test-password' }, 'outside the public code checkout');
  await rejects({ CONTENT_DIR: notes }, 'release password');
  await rejects({ CONTENT_DIR: notes, STATICRYPT_PASSWORD: 't'.repeat(13) }, 'release password');
  await rejects({ CONTENT_DIR: notes, STATICRYPT_PASSWORD: 'example-only-test-password' }, 'required private note is missing');
  await cp('examples/notes', notes, { recursive: true });
  await rejects({ CONTENT_DIR: notes, STATICRYPT_PASSWORD: 'example-only-test-password' }, 'Example notes cannot be published');
  console.log('PASS: missing content, internal content, missing password, incomplete notes and copied examples are rejected; stale releases are removed.');
} finally { await rm(root, { recursive: true, force: true }); }
