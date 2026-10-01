# 论文调研与学习网站 Skill

名称：`research-learning-site`。它将研究方向规划、原始证据与精读、Markdown 教材、学习路径、网页设计及验证连接为一项可重复工作。既能处理完整建设，也能只执行用户指定阶段。

Skill 的主文件位于 [SKILL.md](../plugins/research-learning-site/skills/research-learning-site/SKILL.md)。三个按需参考和八个素材模板随包保存；指令不带私人材料、固定研究日期、个人路径、密码或仓库写入凭据。网站原始模板可以作为可选起点，新项目自行选择身份、框架和托管。

## 在 ChatGPT 账号里复用

跨网页、桌面和手机的账号使用采用插件，而不是仅复制本地 Skill 目录。当前官方支持与账号/工作区权限有关，参见 [Build skills](https://learn.chatgpt.com/docs/build-skills) 和 [Build plugins](https://learn.chatgpt.com/docs/build-plugins)。本 GitHub 代码不等于已经在用户账号创建或安装插件。

1. 在本仓库运行 `python3 scripts/package-research-skill.py`，生成 `build/research-skill/CHATGPT-IMPORT.md` 和便携 ZIP。
2. 在能够找到 Plugin Creator 的 ChatGPT 对话中选择 `@Plugin Creator`，附加 `CHATGPT-IMPORT.md`。文件开头已经包含创建、保留资源和测试的要求。
3. 按 Plugin Creator 的当前流程完成私有创建和安装，检查新对话的 `@` 菜单可见，再换设备验证。不要因当前电脑有文件便声称账号端已经安装。
4. 之后选择 `@论文调研与学习网站`（以实际创建显示名为准），提供研究方向、读者、范围与本轮阶段。

插件的指令可以跨受支持的表面使用；文件、浏览、终端、代码仓库和发布权限仍取决于当前环境。无需终端时可以先交付 Markdown 学习素材，不能宣称构建或发布已经执行。私人工作区插件与公开目录发布不同，后者还需平台审核。

## 在另一台电脑的 Codex 使用

使用当前环境的 `$skill-installer`，要求安装：

```text
安装 https://github.com/Token-Economy-Lab/Token-Economy-Lab/tree/main/plugins/research-learning-site/skills/research-learning-site 这个 Skill。
```

已有内置安装脚本时，也可运行（路径以该电脑实际安装为准）：

```bash
python3 <skill-installer目录>/scripts/install-skill-from-github.py --repo Token-Economy-Lab/Token-Economy-Lab --path plugins/research-learning-site/skills/research-learning-site
```

Codex 调用示例：

```text
$research-learning-site
研究方向：Agent 的 Token 与推理成本优化。
读者：刚进入该方向的学生，以及开展方法和系统研究的团队。
请先建立共同基础和专题学习地图，再选核心机制精读，所有素材保存为 Markdown。
本轮仅完成规划与第一章教程，暂不创建或发布网站。
```

已安装的 Skill 通常在下一轮或新会话可见；必要时重启客户端。Codex 的本地安装不代表 ChatGPT 账号插件已经登记。

## 插件包与仓库目录

便携包遵循 [Agent Plugins 包装](https://developers.openai.com/plugins/build/plugins)：根 `plugin.json`、`skills/`，没有运行时 MCP 依赖或 hooks。本仓库 `.agents/plugins/marketplace.json` 提供仓库目录项，可用支持的 Codex 客户端添加来源，再查看和安装。

```bash
codex plugin marketplace add Token-Economy-Lab/Token-Economy-Lab
codex plugin list
codex plugin add research-learning-site@token-economy-lab-workflows
```

具体安装命令以当前 `codex plugin add --help` 或插件界面为准。仓库市场目录是本地/团队分发渠道，不能当作已发布到 ChatGPT 通用公开目录。

## 维护

源 Skill 只在 `plugins/research-learning-site/` 维护；安装副本与导入文件由源包生成。版本变更重新核验、打包，账号插件需按 Plugin Creator 的编辑流程更新。保留正常自动选择，同时可显式调用；Skill 不延续其他项目的发布授权。
