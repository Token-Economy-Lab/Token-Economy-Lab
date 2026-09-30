# Markdown 内容接口

真实素材存放于私有仓库 `content/notes/`，公开仓库只提供示例和通用模板。内容按 `guides/`、`tutorials/`、`papers/`、`systems/`、`cases/`、`analysis/` 分类。相对路径去掉 `.md` 为条目 ID，可使用小写字母、数字和连字符。

每份材料保留 title、description、section、minutes、status、updated，并增加 kind、level、topics、prerequisites 和 publish。模板位于本仓库 `templates/`，默认 publish:false。

前置阅读填写条目 ID，不填写 URL，且必须指向已发布条目；自引用和循环依赖会拒绝构建。所属专题可多选 context、budget、routing、cache、inference、scheduling、evaluation。旧九篇文件与链接固定保留。

正文区分来源事实、维护者分析与教学假设。性能数字附原论文位置、基线和条件；全文核验和独立复现分别说明。阅读时间是建议值，可以根据练习与正文调整。

在私有研究分支完成草稿、事实和链接检查后，再设置 publish:true。构建从已发布集合生成页面清单，检查草稿片段未进入 HTML 或文本资源；正式构建继续加密全部 HTML，并审查静态资源与泄漏。

网页通过所属专题关联多篇材料，按材料类型构成学习路径、论文入口和业务与系统入口。增加材料无需手动修改固定页面数量。
