# 独立组织部署

组织为 `Token-Economy-Lab`，根站点发布仓库必须命名为 `Token-Economy-Lab.github.io`。仓库代码不部署到个人主页。

## 初次设置

1. 账号持有人创建免费组织，保持名称准确。创建公开代码仓库、公开发布仓库，将现有私有仓库改名为 `token-economy-lab-private` 并迁入组织，始终保持 private。
2. 公开代码使用审查后的全新 Git 历史；真实笔记只保存在私有仓库 `content/notes/`。
3. 新组织默认禁止 deploy key。经组织所有者确认后，在 Settings → Member privileges → Deploy keys 启用此功能，再为发布仓库新建可写 deploy key，将私钥放入私有仓库 `PAGES_DEPLOY_KEY`。该开关适用于整个组织，具体密钥只绑定发布仓库。[GitHub 说明](https://docs.github.com/en/enterprise-cloud%40latest/organizations/managing-organization-settings/restricting-deploy-keys-in-your-organization)。保留访问密码作为私有仓库 `SITE_PASSWORD`。
4. 为私有仓库创建仅有 Actions 写权限的专用 fine-grained token，并保存为公开代码仓库 `PRIVATE_PUBLISH_TOKEN`。不要把凭据发在聊天或提交到 Git。
5. 推送公开代码 `main`。`Example build and audit` 成功后自动触发私有正式构建；首次可手动触发私有 `deploy.yml`。
6. 首次加密产物到达发布仓库后，在 Settings → Pages 设置 `gh-pages` 分支 `/`，开启 HTTPS。

## 验收

保留原 14 页，并按已发布 Markdown 生成完整页面清单。检查全部页面、前置阅读、内部链接和资源，草稿不得出现在 HTML 或静态文本中。验证错误密码、正确解锁、标签页内导航、记住密码、重新锁定、桌面和 390/320px 手机布局，以及减少动效模式。分别验证公开代码更新和私有正文更新会触发加密发布。

拉取两个公开仓库全部分支和标签，运行代码仓库中的历史检查：

```bash
node scripts/audit-public.mjs --private-dir ../token-economy-lab-private/content/notes --secret-dir ../token-economy-lab-private/.private
```

发布仓库中执行同一脚本的绝对路径并加 `--publication`；脚本检查全部本地 refs 的可达历史，不输出匹配到的秘密。

## 切换与回滚

新站全部验收通过后，再关闭旧发布仓库 `luoyu100/token-economy` 的 Pages，保留其 `gh-pages` 和仓库作为回滚材料。本机访问文件此时才改为新地址；访问密码保持不变。

回滚时重新启用旧仓库 `gh-pages` 的 Pages；旧站的最后一版密文和旧路径已经保留。新组织仓库和私有正文无需删除。

## 后续维护

- 网站代码、样式和导航在公开代码仓库维护，正式内容在私有仓库维护。
- 增加笔记或路由时同步 `scripts/policy.mjs`，保持路由验收范围明确。
- 更新密码后手动重新发布，并同步维护者的本机访问文件。
- 触发 token 到期前重新创建同范围凭据，更新 `PRIVATE_PUBLISH_TOKEN` 后重跑公开工作流。
