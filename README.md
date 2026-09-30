# Token Economy Lab

面向 Agent Token 经济优化的研究与学习网站。本仓库公开主题、组件、动画、内容模板与布局示例；系统性文献调研将在网站迁移完成后推进。

正式站点：[token-economy-lab.github.io](https://token-economy-lab.github.io/)。正式站点使用共享密码解密，仓库中的示例内容可以公开阅读。

## 三个仓库

| 仓库 | 可见性 | 内容 |
| --- | --- | --- |
| [Token-Economy-Lab](https://github.com/Token-Economy-Lab/Token-Economy-Lab) | Public | 本仓库，网站代码及示例 |
| [Token-Economy-Lab.github.io](https://github.com/Token-Economy-Lab/Token-Economy-Lab.github.io) | Public | `gh-pages` 分支，加密 HTML 和批准的静态资源 |
| `token-economy-lab-private` | Private | 正文、私有历史及正式发布工作流 |

## 开发与检查

要求 Node.js 22.12 或以上。

```bash
npm ci
npm run dev
```

本机地址：`http://127.0.0.1:4321/`。默认内容来自 `examples/notes/`。

```bash
npm run audit:public
npm run test:safety
npm run build:examples
```

示例构建检查 14 个路由、内部链接和资源路径。它强制使用公开示例，不加载本机 `.env`，也不生成可发布的 `dist/`。公开 CI 不上传正文或构建产物。

## 私有内容接口

正文使用 Markdown 和以下 frontmatter：

```yaml
title: 页面标题
description: 页面说明
section: topics # 基础笔记使用 foundations
minutes: 5
status: 待核验 # 基础笔记 / 专题框架 / 已核验 / 待核验
updated: '2026-09-30'
```

`CONTENT_DIR` 指定笔记目录。现有七个专题及两篇基础笔记使用 `examples/notes/` 中相同的文件名。

授权维护者可将两个本机仓库并列放置，复制 `.env.example` 为 `.env`，填写私有目录和访问密码，然后运行：

```bash
npm run build
npm run preview
```

正式构建要求正文位于公开代码目录之外、九篇必需笔记齐全、内容没有示例标记、密码至少 14 字符。构建先清理 Astro 内容缓存，再检查页面、加密全部 HTML 并检查公开产物。临时明文 `build/plain/`、加密产物 `dist/`、`.env`、`.private/` 和 QA 文件均不提交。

## 自动发布

公开 PR 与 `main` 更新运行示例构建和 Git 历史审查。`main` 检查通过后，工作流使用 `PRIVATE_PUBLISH_TOKEN` 触发私有 `deploy.yml`，传入完整代码 commit SHA。

该凭据为 fine-grained personal access token：Resource owner 为 `Token-Economy-Lab`，只选择 `token-economy-lab-private`，只授予 **Actions: Read and write**（Metadata read 为 GitHub 必需权限）。将其保存到本仓库 Actions Secret；不要授予正文 Contents 权限或使用账号的通用登录凭据。[工作流触发权限](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)

私有工作流确认指定 SHA 属于公开 `main` 历史且 `Example build and audit` 检查成功，再读取该代码版本和私有正文。私有正文的 `main` 更新也会发布，手动触发可指定 SHA 或使用当前 `main`。如果当前代码尚未通过检查，发布会停止，检查成功后重试即可。

私有仓库保存 `SITE_PASSWORD` 和 `PAGES_DEPLOY_KEY`，专用 SSH key 只允许更新发布仓库。Pages 设置使用发布仓库 `gh-pages` 根目录，站点 `base` 为 `/`。详细操作见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 内容与安全边界

真实 Markdown、原始 PPT、内部附件、密码和私钥必须留在私有仓库或本机忽略目录。公开代码必须使用全新 Git 历史，不能通过删除文件后公开原私有仓库的方式迁移。

页面使用 StatiCrypt 加密。默认解锁只保存在当前标签页，可选择记住 7 天，锁定按钮清除本设备凭据。得到密码的人可保存或转发已解锁内容；该机制没有独立用户身份或单人撤权。发布目录默认拒绝 JSON、Source Map、图片和下载附件，加入新资源类型前应处理其中的私有内容。

技术与设计：[Astro](https://docs.astro.build/en/guides/deploy/github/)、[StatiCrypt](https://github.com/robinmoisson/staticrypt)、[docs/DESIGN.md](docs/DESIGN.md)。
