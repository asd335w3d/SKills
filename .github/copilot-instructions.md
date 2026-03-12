# 仓库规则

## 语言

本仓库的所有交互、回复及文档均使用**简体中文（zh-cn）**。

## 允许的文件类型

本仓库**仅允许**以下类型的文件：

| 扩展名 | 类型 |
|--------|------|
| `.md`  | Markdown 文档 |
| `.js`  | JavaScript 源码 |
| `.ts`  | TypeScript 源码 |
| `.pdf` | PDF 文档 |
| `.yaml` / `.yml` | YAML 配置文件 |
| `.json` | JSON 数据文件 |

## 限制规则

- **禁止**创建、提交或修改上述列表之外的任何文件类型。
- 如有需要引入其他类型的文件，须在提交前与仓库管理员确认。
- 所有代码文件须符合对应语言的规范（JS/TS 遵循 ESLint 规范，YAML/JSON 须格式合法）。

## SKills 标准结构

本仓库采用以下标准目录结构管理 GitHub Copilot Agent Skills：

```
SKills/
├── .github/
│   ├── copilot-instructions.md          # Copilot 全局指令（本文件）
│   ├── skills/                          # Copilot Agent Skills 加载目录
│   │   └── <skill-name>/                # 每个技能独占一个目录
│   │       └── SKILL.md                 # 技能主文件（必需）
│   └── workflows/                       # GitHub Actions 工作流
│       └── create-skill.yml             # Agent 工作流：理解需求并创建 Skill
├── skills/                              # 技能集合目录（对外输出）
│   ├── README.md                        # 技能索引与说明
│   ├── template/                        # 标准技能模板
│   │   └── SKILL.md
│   └── <skill-name>/                    # 自定义技能
│       ├── SKILL.md
│       └── scripts/                     # 辅助脚本（可选，仅 .js/.ts）
└── README.md                            # 仓库总览
```

### SKILL.md 必填字段

| 字段 | 说明 |
|------|------|
| `name` | 技能唯一标识：小写英文+数字，单词间用 `-` 连接，与目录名完全一致，长度 2～50 字符 |
| `description` | 技能描述：20～200 字简体中文，须同时包含核心功能和触发场景 |
| `license` | （可选）遵循 SPDX 标准，如 `MIT`、`Apache-2.0`，默认视为 MIT |
| `version` | （可选）语义化版本号，用引号包裹，如 `"1.0.0"` |
| `tags` | （可选）YAML 列表，用于分类索引 |

### SKILL.md 必需章节

每个 `SKILL.md` 正文必须包含以下章节，按顺序排列：

| 章节 | 要求 |
|------|------|
| `说明` | 必需：功能概述 + 适用场景(≥2条) + 前提条件 |
| `流程` | 必需：有序步骤，每步有完成标志，涉及文件/命令给出具体路径和代码块 |
| `示例` | 必需：至少1个完整示例（触发提示词 + 预期输出） |
| `测试方案` | 必需：测试环境 + 测试用例(≥2条，含正常与异常路径) + 通过标准 |
| `评分标准` | 必需：量化评分维度(≥3个) + 权重 + 1～5 分评分等级定义 |
| `维度测评报告` | 必需：测评概要 + 各维度得分表 + 问题与改进建议 |
| `迭代方案` | 必需：当前版本已知局限 + 短期改进计划 + 长期演进方向 |
| `注意事项` | 推荐：已知限制、边界情况、相关技能推荐 |

### 新建技能规范

1. 在 `skills/` 下创建以技能名命名的子目录（小写，连字符分隔）。
2. 复制 `skills/template/SKILL.md`，填写 `name`、`description` 及正文。
3. 完善所有必需章节（说明、流程、示例、测试方案、评分标准、维度测评报告、迭代方案）。
4. 在 `skills/README.md` 的技能索引表中注册。
5. 通过 Pull Request 提交，commit message 使用简体中文。

详细编写规范请参阅 [`.github/skills/skill-authoring-guide/SKILL.md`](skills/skill-authoring-guide/SKILL.md)。

## 提交规范

- 提交信息（commit message）使用简体中文。
- 每次提交只包含同一类型的变更。
- 禁止直接向 `main` 分支推送，须通过 Pull Request 进行合并。
