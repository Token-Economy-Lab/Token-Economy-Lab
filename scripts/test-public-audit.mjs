import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = mkdtempSync(join(tmpdir(), 'research-public-audit-'));
const repository = join(root, 'public'), notes = join(root, 'notes');
const audit = fileURLToPath(new URL('./audit-public.mjs', import.meta.url));
mkdirSync(repository); mkdirSync(notes);
const git = (...args) => execFileSync('git', args, { cwd: repository, stdio: 'pipe' });
const delimiter = '| --- | --- | --- | --- | --- | --- | --- |';
const privateTitle = 'A synthetic confidential chapter title reserved for this audit';
const privateRow = '| Confidential synthetic task result that must remain private | 17 |';
const run = () => spawnSync(process.execPath, [audit, '--private-dir', notes], { cwd: repository, encoding: 'utf8' });
try {
  writeFileSync(join(notes, 'chapter.md'), `---\ntitle: "${privateTitle}"\n---\n${delimiter}\n${privateRow}\n`);
  git('init', '-b', 'main'); git('config', 'user.name', 'Audit fixture'); git('config', 'user.email', 'audit@example.invalid');
  writeFileSync(join(repository, 'layout.md'), `${delimiter}\nPublic template layout.\n`);
  git('add', '.'); git('commit', '-m', 'Public template');
  assert.equal(run().status, 0, 'Generic table layout should not be treated as private content.');

  writeFileSync(join(repository, 'metadata.md'), privateTitle);
  const metadata = run();
  assert.notEqual(metadata.status, 0, 'Untracked private metadata must be rejected.');
  assert(metadata.stderr.includes('Private note text'));
  assert(!metadata.stderr.includes(privateTitle), 'Audit must not print the matched content.');
  rmSync(join(repository, 'metadata.md'));

  writeFileSync(join(repository, 'layout.md'), `${delimiter}\n${privateRow}\n`);
  git('add', '.'); git('commit', '-m', 'Synthetic leaked row');
  writeFileSync(join(repository, 'layout.md'), 'Clean working file.\n');
  git('add', '.'); git('commit', '-m', 'Remove synthetic row');
  const history = run();
  assert.notEqual(history.status, 0, 'Deleting a private row must not make public history pass.');
  assert(history.stderr.includes('Private note text'));
  assert(!history.stderr.includes(privateRow), 'Audit must not expose a historical match.');
  console.log('Public audit passed: template syntax accepted, metadata and historical rows rejected.');
} finally {
  rmSync(root, { recursive: true, force: true });
}
