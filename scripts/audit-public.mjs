import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { noteIds } from './policy.mjs';

const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const publication = args.includes('--publication');
const refs = git('rev-list', '--all', '--objects').trim().split('\n').filter(Boolean);
assert(refs.length, 'No Git history to audit.');
const forbiddenFragments = [];
if (option('--private-dir')) {
  const dir = resolve(option('--private-dir'));
  const contentFiles = folder => readdirSync(folder, { withFileTypes: true }).flatMap(e => e.isDirectory() ? contentFiles(resolve(folder, e.name)) : e.name.endsWith('.md') ? [resolve(folder, e.name)] : []);
  for (const file of contentFiles(dir)) {
    const raw = readFileSync(file, 'utf8');
    const metadata = parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '');
    // The legacy topic labels were intentionally public before content separation.
    // New chapter titles, descriptions and outcomes remain private.
    const id = file.slice(dir.length + 1).replaceAll('\\', '/').replace(/\.md$/, '');
    for (const value of [noteIds.includes(id) ? undefined : metadata?.title, metadata?.description, ...(metadata?.outcomes || [])]) if (typeof value === 'string' && value.length >= 16) forbiddenFragments.push(value);
    const text = raw.replace(/^---[\s\S]*?---\s*/, '');
    for (const line of text.split('\n')) {
      const fragment = line.trim().replace(/^[-#*>\d.\s]+/, '');
      if (fragment.length >= 24) forbiddenFragments.push(fragment);
    }
  }
}
const secretValues = [];
if (option('--secret-dir')) {
  const dir = resolve(option('--secret-dir'));
  for (const name of readdirSync(dir).filter(n => n.startsWith('site-password') || n.startsWith('pages_deploy_key') && !n.endsWith('.pub'))) {
    const value = readFileSync(resolve(dir, name), 'utf8').trim();
    if (value.length) secretValues.push(value);
  }
}
function inspectText(text, path) {
  assert(!/-----BEGIN (?:OPENSSH|RSA|EC|DSA|ENCRYPTED)? ?PRIVATE KEY-----/.test(text), 'Private key in public history.');
  assert(!/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/.test(text), 'GitHub credential in public history.');
  assert(!/STATICRYPT_PASSWORD\s*=\s*[A-Za-z0-9_\-]{14,}/.test(text), 'Literal password assignment in public history.');
  for (const value of secretValues) assert(!text.includes(value), 'Known secret in public history.');
  for (const fragment of forbiddenFragments) assert(!text.includes(fragment), 'Private note text in public history.');
  if (publication && path.endsWith('.html')) assert(text.includes('staticryptEncryptedMsgUniqueVariableName'), 'Plaintext HTML in publication history.');
}
let blobs = 0;
for (const item of refs) {
  const sha = item.slice(0, 40), path = item.slice(41);
  if (git('cat-file', '-t', sha).trim() !== 'blob') continue;
  blobs++;
  assert(!/(^|\/)(\.private|qa|node_modules|build|dist)(\/|$)/.test(path), 'Private or generated directory in public history.');
  assert(!/(^|\/)\.env(?:$|\.(?!example$))/.test(path), 'Environment file in public history.');
  assert(!['.pptx', '.pdf', '.docx', '.pem', '.key'].includes(extname(path)), 'Internal attachment or key file in public history.');
  if (publication) {
    assert(['.html', '.css', '.js', '.svg', '.woff', '.woff2'].includes(extname(path)) || ['.nojekyll', 'robots.txt'].includes(path), 'Unapproved publication file.');
  } else {
    assert(!/(^|\/)(src\/content|content)\/notes\//.test(path), 'Real-content directory in public code history.');
    assert(!['.html', '.woff', '.woff2'].includes(extname(path)) || path === 'scripts/password-template.html', 'Generated or unreviewed binary file in public code history.');
  }
  if (['.woff', '.woff2'].includes(extname(path))) continue;
  const text = git('cat-file', 'blob', sha);
  inspectText(text, path);
}
if (!publication) for (const path of new Set(git('ls-files', '--cached', '--others', '--exclude-standard').trim().split('\n').filter(Boolean))) {
  if (existsSync(path)) inspectText(readFileSync(path, 'utf8'), path);
}
console.log(`Audited ${blobs} blobs across all local branches, tags and history.`);
