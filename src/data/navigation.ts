export const topics = [
  { slug: 'context', code: '01', title: 'Agent 与上下文', en: 'Agent & context', desc: '沿着执行轨迹，理解上下文、工具反馈和重复调用的成本。', tags: ['上下文压缩', '记忆', '轨迹裁剪'], group: 'demand' },
  { slug: 'budget', code: '02', title: '推理与 Token 预算', en: 'Reasoning & budgets', desc: '研究推理深度、停止策略，以及任务和阶段之间的预算分配。', tags: ['推理长度', '动态预算', '停止策略'], group: 'demand' },
  { slug: 'routing', code: '03', title: '模型路由', en: 'Model routing', desc: '把任务要求与模型能力关联，比较选择、级联和升级策略。', tags: ['模型选择', '级联', '质量约束'], group: 'demand' },
  { slug: 'cache', code: '04', title: 'KV / Prefix Cache', en: 'Computation reuse', desc: '理解共享前缀、缓存容量与淘汰决策如何影响计算复用。', tags: ['Prefix 复用', '缓存淘汰', 'KV 管理'], group: 'supply' },
  { slug: 'inference', code: '05', title: '推理加速', en: 'Inference acceleration', desc: '梳理生成过程中的计算与访存开销，以及加速技术的适用边界。', tags: ['推测解码', '量化', '执行引擎'], group: 'supply' },
  { slug: 'scheduling', code: '06', title: '调度与资源管理', en: 'Scheduling & resources', desc: '从单次请求扩展到服务系统，研究批处理、排队与资源配置。', tags: ['批处理', '请求调度', '资源伸缩'], group: 'supply' },
  { slug: 'evaluation', code: '07', title: '效益度量与评测', en: 'Evaluation & economics', desc: '统一任务效果、Token 投入、计算成本与 SLA 的评价口径。', tags: ['任务级成本', '质量', '可复现评测'], group: 'evaluation' },
];

export const nav = [
  { title: '研究地图', path: '' },
  { title: '学习路径', path: 'learn/' },
  { title: '技术专题', path: 'topics/' },
  { title: '论文与系统', path: 'library/' },
  { title: '调研报告', path: 'reports/' },
];

export const base = import.meta.env.BASE_URL;
export const href = (path = '') => base + path.replace(/^\//, '');
