# SKills
配置符合GithubCopilot的SKill

## 仓库说明

本仓库用于存放符合 GitHub Copilot 规范的 SKill 配置。

**允许的文件类型**：`.md`、`.js`、`.ts`、`.pdf`、`.yaml`/`.yml`、`.json`

**环境语言**：简体中文（zh-cn）

详细规则请参阅 [`.github/copilot-instructions.md`](.github/copilot-instructions.md)。

---

## 标准目录结构

```
SKills/
├── .github/
│   ├── copilot-instructions.md          # Copilot 全局指令
│   ├── skills/                          # Copilot Agent Skills 加载目录
│   │   └── <skill-name>/
│   │       └── SKILL.md                 # 技能主文件
│   └── workflows/                       # GitHub Actions 工作流
│       └── create-skill.yml             # Agent 工作流：自动创建 Skill
├── skills/                              # 技能集合目录
│   ├── README.md                        # 技能索引
│   ├── template/                        # 标准技能模板
│   │   └── SKILL.md
│   └── <skill-name>/                    # 自定义技能
│       ├── SKILL.md
│       └── scripts/                     # 辅助脚本（可选）
└── README.md                            # 仓库总览（本文件）
```

## 快速开始

### 使用 Agent 工作流（推荐）

进入 **Actions → 创建新 Skill（Copilot Agent）**，填写技能名称和需求描述，Copilot Agent 将自动理解项目结构、生成 Skill 并提交 Pull Request。

### 手动创建

1. 复制 [`skills/template/SKILL.md`](skills/template/SKILL.md) 到 `skills/<技能名>/SKILL.md`
2. 填写 `name`、`description` 字段及正文内容
3. 在 [`skills/README.md`](skills/README.md) 技能索引表中注册新技能
4. 提交 Pull Request

详细编写规范请参阅 [技能编写指引](.github/skills/skill-authoring-guide/SKILL.md)。
