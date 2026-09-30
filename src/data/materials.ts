import { getCollection, type CollectionEntry } from 'astro:content';
const legacyTopics = ['context', 'budget', 'routing', 'cache', 'inference', 'scheduling', 'evaluation'];
export type Material = CollectionEntry<'notes'>;
export const courses = [
 {id:'foundations', title:'共同基础', description:'从一次调用到完整任务账本，建立机制与实验的共同语言。'},
 {id:'context', title:'Agent 与上下文', description:'沿轨迹增长、裁剪、压缩和记忆学习信息保留的取舍。'},
 {id:'budget', title:'思考与行动预算', description:'连接单次思考、多轮工具行动及跨任务的资源分配。'},
 {id:'routing', title:'模型路由', description:'从固定模型基线走到级联、校准与阶段决策。'},
 {id:'cache', title:'KV 与缓存复用', description:'先解释状态与容量，再理解分页、匹配、淘汰和融合。'},
 {id:'inference', title:'推理执行加速', description:'以瓶颈为入口，学习注意力、量化和草稿验证的成本。'},
 {id:'scheduling', title:'调度与资源管理', description:'从排队和批处理进入阶段分离、缓存亲和与服务约束。'},
 {id:'evaluation', title:'效益度量与实验', description:'明确任务验收、成本归因、对照条件和结论的不确定性。'},
] as const;
export const ordered = (entries: Material[]) => [...entries].sort((a,b) => (a.data.order ?? 10000) - (b.data.order ?? 10000) || a.id.localeCompare(b.id));
export const courseChapters = (all: Material[], course: string) => ordered(all.filter(e => e.data.course === course));
export const courseHref = (id: string) => `/courses/${id}/`;
export const labels: Record<Material['data']['kind'], string> = { guide: '学习指南', topic: '专题综述', tutorial: '深入教程', paper: '论文精读', system: '系统说明', case: '业务案例', analysis: '研究分析' };
export const materialHref = (entry: Material | string) => {
  const id = typeof entry === 'string' ? entry : entry.id;
  return legacyTopics.includes(id) ? `/topics/${id}/` : ['first-principles', 'survey-framework'].includes(id) ? `/notes/${id}/` : `/materials/${id}/`;
};
export const publishedMaterials = async () => ordered((await getCollection('notes', e => e.data.publish ?? [...legacyTopics, 'first-principles', 'survey-framework'].includes(e.id))).map(e => legacyTopics.includes(e.id) ? {...e, data: {...e.data, kind: 'topic' as const, topics: e.data.topics.length ? e.data.topics : [e.id]}} : e));
