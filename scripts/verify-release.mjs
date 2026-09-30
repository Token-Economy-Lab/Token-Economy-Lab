import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { releaseDigest } from './release-digest.mjs';

const release = JSON.parse(await readFile('build/release.json', 'utf8'));
assert.equal(release.mode, 'private', 'A verified private build is required.');
if (process.env.CODE_SHA) assert.equal(release.codeSha, process.env.CODE_SHA, 'Release code version changed.');
assert.deepEqual(await releaseDigest(), release.files, 'Release files changed after verification.');
console.log('Verified the release is unchanged since private build checks passed.');
