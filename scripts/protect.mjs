import { readdir, readFile, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, relative, dirname, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { assetExtensions } from './policy.mjs';

if(existsSync('.env')) process.loadEnvFile?.('.env');
if (process.env.RELEASE_MODE !== 'private' || !process.env.CONTENT_DIR) throw new Error('Use npm run build with a private CONTENT_DIR to produce a release.');
const password = process.env.STATICRYPT_PASSWORD;
if (!password || password.length < 14) throw new Error('STATICRYPT_PASSWORD must contain at least 14 characters. No unencrypted release will be produced.');
const source = resolve('build/plain'), destination = resolve('dist');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
let htmlCount = 0;
async function protectDirectory(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = resolve(dir, entry.name);
    if (entry.isDirectory()) { await protectDirectory(file); continue; }
    const path = relative(source, file), target = resolve(destination, path);
    await mkdir(dirname(target), { recursive: true });
    if (extname(file) === '.html') {
      const result = spawnSync(process.execPath, [
        'node_modules/staticrypt/cli/index.js', file,
        '-d', dirname(target),
        '-t', 'scripts/password-template.html',
        '--remember', '7',
      ], { env: { ...process.env, STATICRYPT_PASSWORD: password }, encoding: 'utf8' });
      if(result.status !== 0) throw new Error('Page encryption failed. No release will be published.');
      const encrypted = await readFile(target, 'utf8');
      if (!encrypted.includes('staticryptEncryptedMsgUniqueVariableName')) throw new Error(`Missing encrypted payload: ${path}`);
      htmlCount++;
    } else if (assetExtensions.has(extname(file))) { await copyFile(file, target); }
    else if (entry.name === 'robots.txt') { await copyFile(file, target); }
    else throw new Error(`Refusing to publish unencrypted asset: ${path}. Review content before adding any new asset type.`);
  }
}
await protectDirectory(source);
await writeFile(resolve(destination, '.nojekyll'), '');
console.log(`Encrypted ${htmlCount} pages. dist/ contains only password-protected pages and approved static assets.`);
