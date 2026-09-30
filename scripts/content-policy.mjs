import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { noteIds, routes as baseRoutes } from './policy.mjs';
export const kinds = ['guide', 'topic', 'tutorial', 'paper', 'system', 'case', 'analysis'];
export const levels = ['入门', '进阶', '研究'];
export const materialPath = id => `/materials/${id}/`;
export async function readMaterials(dir) {
  const entries = [];
  async function walk(folder) {
    for (const file of await readdir(folder, { withFileTypes: true })) {
      assert(!file.isSymbolicLink(), 'Content symlinks are not allowed.');
      const path = resolve(folder, file.name);
      if (file.isDirectory()) { await walk(path); continue; }
      if (!file.name.endsWith('.md')) continue;
      const raw = await readFile(path, 'utf8');
      const id = relative(dir, path).replaceAll('\\', '/').replace(/\.md$/, '');
      assert(/^[a-z0-9][a-z0-9/-]*$/.test(id), 'Invalid material identifier.');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      assert(match, 'Markdown frontmatter is required.');
      const data = parse(match[1]);
      assert(data && typeof data === 'object', 'Invalid frontmatter.');
      assert(data.publish === undefined || typeof data.publish === 'boolean', 'publish must be a boolean.');
      // Only the nine existing URLs retain their pre-migration publication state.
      // Newly added material always requires an explicit publication flag.
      const legacy = noteIds.includes(id);
      const publish = data.publish ?? legacy;
      if (legacy) {
        data.kind ??= noteIds.slice(0, 7).includes(id) ? 'topic' : 'guide';
        data.level ??= '入门';
        data.topics ??= noteIds.slice(0, 7).includes(id) ? [id] : [];
        data.prerequisites ??= [];
      }
      if (publish) {
        for (const field of ['title', 'description', 'section', 'updated']) assert(typeof data[field] === 'string' && data[field], 'Required material metadata is missing.');
        assert(Number.isFinite(data.minutes) && data.minutes > 0, 'Invalid reading time.');
        assert(['基础笔记', '专题框架', '已核验', '待核验'].includes(data.status), 'Invalid verification status.');
        assert(kinds.includes(data.kind), 'Invalid material kind.');
        assert(levels.includes(data.level), 'Invalid reading level.');
        assert(Array.isArray(data.topics) && data.topics.every(t => noteIds.slice(0, 7).includes(t)), 'Invalid material topics.');
        assert(Array.isArray(data.prerequisites) && data.prerequisites.every(p => typeof p === 'string'), 'Invalid prerequisite list.');
      }
      entries.push({ id, data: { ...data, publish }, raw, path });
    }
  }
  await walk(dir);
  const published = entries.filter(e => e.data.publish);
  const identifiers = new Set(published.map(e => e.id));
  for (const entry of published) for (const id of entry.data.prerequisites) assert(identifiers.has(id), 'Prerequisite must reference a published material.');
  const visiting = new Set(), visited = new Set();
  const byId = new Map(published.map(e => [e.id, e]));
  function visit(id) {
    assert(!visiting.has(id), 'Circular prerequisite chain.');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prerequisite of byId.get(id).data.prerequisites) visit(prerequisite);
    visiting.delete(id); visited.add(id);
  }
  for (const id of identifiers) visit(id);
  for (const id of noteIds) assert(identifiers.has(id), 'A required legacy note must remain published.');
  const links = new Map(noteIds.map(id => [id, noteIds.slice(0, 7).includes(id) ? `/topics/${id}/` : `/notes/${id}/`]));
  for (const entry of published) if (!links.has(entry.id)) links.set(entry.id, materialPath(entry.id));
  return { entries, published, routes: [...baseRoutes, '/systems/', ...published.filter(e => !noteIds.includes(e.id)).map(e => materialPath(e.id))].sort(), links };
}
