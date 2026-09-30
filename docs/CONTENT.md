# Markdown 内容接口

真实素材存放于私有仓库 `content/notes/`，公开仓库只提供示例和通用模板。内容按 `guides/`、`tutorials/`、`papers/`、`systems/`、`cases/`、`analysis/` 分类。相对路径去掉 `.md` 为条目 ID，可使用小写字母、数字和连字符。

每份材料保留 title、description、section、minutes、status、updated，并增加 kind、level、topics、prerequisites 和 publish。模板位于本仓库 `templates/`，默认 publish:false。

课程章节增加 `course`（foundations 或七个专题 ID）、`order`（同课程内唯一的非负整数）、`outcomes`（具体完成目标）、`studyMinutes`（含练习与核对原文的建议学习耗时）。填写 course 时后三项必需；同课程先修必须在该章之前。`minutes` 单独表示笔记阅读估计，不代表掌握材料所需时间。

教程可用 `sequence` 定义跨专题教学顺序；论文可用 `paperTrack` 分组（cache、agent、reasoning、context、routing、scheduling、evaluation）；可复制练习用 `exercise: true`。全部元信息与正文一起保留在加密 HTML 内，禁止生成公开客户端内容索引。

前置阅读填写条目 ID，不填写 URL，且必须指向已发布条目；自引用和循环依赖会拒绝构建。所属专题可多选 context、budget、routing、cache、inference、scheduling、evaluation。旧九篇文件与链接固定保留。

正文区分来源事实、维护者分析与教学假设。性能数字附原论文位置、基线和条件；全文核验和独立复现分别说明。阅读时间是建议值，可以根据练习与正文调整。

在私有研究分支完成草稿、事实和链接检查后，再设置 publish:true。构建从已发布集合生成页面清单，检查草稿片段未进入 HTML 或文本资源；正式构建继续加密全部 HTML，并审查静态资源与泄漏。

网页从已发布条目生成 `/courses/<course>/`，学习页列出课程章节、先修、完成目标和下一章。正文提供当前课程目录、页内目录、上一章/下一章；手机目录折叠，关联阅读先显示下一篇及最多两篇选读，其余折叠。论文按分组内 order 排列。增加材料或课程无需手动修改固定页面数量。

论文须包含机制图、流程/伪代码、实验条件表、关键结果解读、失败边界与可执行对照。无需 GPU 的练习给可复制数据、标准库代码或手工步骤、预期结果和解答；实际运行教学程序与独立复现论文分别记录。构建同时检查草稿、正文和课程元信息的明文泄漏。
