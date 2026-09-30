import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';

export async function releaseDigest(root = resolve('dist')) {
  const hashes = {};
  async function scan(dir) {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = resolve(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Release cannot contain symbolic links.');
      if (entry.isDirectory()) await scan(file);
      else hashes[relative(root, file)] = createHash('sha256').update(await readFile(file)).digest('hex');
    }
  }
  await scan(root);
  return hashes;
}
