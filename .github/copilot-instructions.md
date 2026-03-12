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

### 新建技能规范

1. 在 `skills/` 下创建以技能名命名的子目录（小写，连字符分隔）。
2. 复制 `skills/template/SKILL.md`，填写 `name`、`description` 及正文。
3. 在 `skills/README.md` 的技能索引表中注册。
4. 通过 Pull Request 提交，commit message 使用简体中文。

详细编写规范请参阅 [`.github/skills/skill-authoring-guide/SKILL.md`](skills/skill-authoring-guide/SKILL.md)。

## 提交规范

- 提交信息（commit message）使用简体中文。
- 每次提交只包含同一类型的变更。
- 禁止直接向 `main` 分支推送，须通过 Pull Request 进行合并。
