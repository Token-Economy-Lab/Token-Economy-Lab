import { getCollection, type CollectionEntry } from 'astro:content';
const legacyTopics = ['context', 'budget', 'routing', 'cache', 'inference', 'scheduling', 'evaluation'];
export type Material = CollectionEntry<'notes'>;
export const labels: Record<Material['data']['kind'], string> = { guide: '学习指南', topic: '专题综述', tutorial: '深入教程', paper: '论文精读', system: '系统说明', case: '业务案例', analysis: '研究分析' };
export const materialHref = (entry: Material | string) => {
  const id = typeof entry === 'string' ? entry : entry.id;
  return legacyTopics.includes(id) ? `/topics/${id}/` : ['first-principles', 'survey-framework'].includes(id) ? `/notes/${id}/` : `/materials/${id}/`;
};
export const publishedMaterials = async () => (await getCollection('notes', e => e.data.publish ?? [...legacyTopics, 'first-principles', 'survey-framework'].includes(e.id))).map(e => legacyTopics.includes(e.id) ? {...e, data: {...e.data, kind: 'topic' as const, topics: e.data.topics.length ? e.data.topics : [e.id]}} : e).sort((a, b) => a.id.localeCompare(b.id));
