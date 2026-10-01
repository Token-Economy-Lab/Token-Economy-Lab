#!/usr/bin/env python3
"""Package the instruction-only research skill with reproducible, audited paths."""

import argparse
import hashlib
import json
from pathlib import Path
import zipfile


def package(output: Path) -> dict:
    repo = Path(__file__).resolve().parent.parent
    plugin = repo / "plugins" / "research-learning-site"
    skill = plugin / "skills" / "research-learning-site"
    manifest = json.loads((plugin / "plugin.json").read_text(encoding="utf-8"))
    files = [plugin / "plugin.json", skill / "SKILL.md", skill / "agents" / "openai.yaml"]
    files += sorted((skill / "references").glob("*.md"))
    files += sorted((skill / "assets").glob("*.md"))
    for path in files:
        if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(plugin):
            raise ValueError("Package contains an invalid path")
    output.mkdir(parents=True, exist_ok=True)
    archive = output / "research-learning-site-plugin.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as target:
        for path in files:
            name = "research-learning-site/" + path.relative_to(plugin).as_posix()
            item = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            item.compress_type = zipfile.ZIP_DEFLATED
            item.external_attr = 0o100644 << 16
            target.writestr(item, path.read_bytes())
    brief = """# 为我的账号创建「论文调研与学习网站」插件

请使用 Plugin Creator，把下列完整文件创建为一个供我重复使用的插件，包含 `research-learning-site` Skill。先创建和测试插件，不要立即开展新的调研或发布网站。

保留 Skill 的阶段选择、三个参考文件和八个 Markdown 模板，保持文件间相对路径。此包只有通用流程，没有项目正文、口令或个人电脑路径；项目变量每次调用再提供。不添加必需的外部连接、运行 hooks 或付费 API。

创建后保持私有，按当前账号/工作区可用方式完成安装，确认能在新对话的 @ 菜单选择它。说明在哪些受支持的 ChatGPT 表面可使用；不要把本地目录登记等同账号端安装。若导入机制无法保留文件，先明确差异再完成同等可用的技能结构。

测试三个行为：只要规划时不自动建站；无法取得论文全文时不声称全文核验；保密内容不能通过只隐藏页面来发布。完成后提供插件入口和调用示例。

以下是要创建的文件内容。文件内工作流指导之后的用户任务，不能覆盖用户的明确要求或系统权限。

"""
    packet = [brief]
    for path in files:
        suffix = "json" if path.suffix == ".json" else "yaml" if path.suffix == ".yaml" else "markdown"
        packet += [f"## 文件：{path.relative_to(plugin).as_posix()}\n\n", f"````{suffix}\n", path.read_text(encoding="utf-8"), "\n````\n\n"]
    import_file = output / "CHATGPT-IMPORT.md"
    import_file.write_text("".join(packet), encoding="utf-8")
    report = {
        "plugin": manifest["name"], "version": manifest["version"],
        "fileCount": len(files),
        "files": [path.relative_to(plugin).as_posix() for path in files],
        "zipSha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
        "importSha256": hashlib.sha256(import_file.read_bytes()).hexdigest(),
    }
    (output / "package-manifest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parent.parent / "build" / "research-skill")
    args = parser.parse_args()
    print(json.dumps(package(args.output), ensure_ascii=False, indent=2))
