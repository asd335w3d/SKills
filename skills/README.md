# Skills 技能目录

本目录收录符合 GitHub Copilot Agent Skills 规范的技能集合。

---

## 目录结构

```
skills/
├── README.md           # 本文件：技能索引与结构说明
├── template/           # 标准技能模板（新建技能时复制此目录）
│   └── SKILL.md
└── <技能名称>/         # 每个技能独占一个目录（小写，连字符分隔）
    ├── SKILL.md        # 技能主文件（必需）
    └── scripts/        # 辅助脚本（可选，仅 .js / .ts）
```

---

## 标准 SKILL.md 结构

```markdown
---
name: 技能唯一标识        # 必填：小写字母+数字+连字符，与目录名一致
description: 技能描述     # 必填：20～200字，包含功能和触发场景
license: MIT             # 可选
version: "1.0.0"         # 可选
tags:                    # 可选
  - 标签
---

## 说明          # 必需：功能概述 + 适用场景(≥2条) + 前提条件
## 流程          # 必需：有序步骤，每步有完成标志，涉及文件/命令给出具体路径和代码块
## 示例          # 必需：至少1个完整示例（触发提示词 + 预期输出）
## 注意事项      # 推荐：已知限制、边界情况、相关技能推荐
```

详细规范请参阅 [`.github/skills/skill-authoring-guide/SKILL.md`](../.github/skills/skill-authoring-guide/SKILL.md)。

---

## 技能索引

| 技能名称 | 目录 | 描述 |
|----------|------|------|
| （暂无已注册技能，请按规范新建后在此登记） | — | — |

---

## 快速新建技能

### 方式一：使用 Copilot Agent 工作流（推荐）

在 GitHub 仓库页面，进入 **Actions → 创建新 Skill（Copilot Agent）**，点击 **Run workflow**，填写：

| 输入项 | 说明 |
|--------|------|
| `skill_name` | 技能目录名（小写，连字符，如 `my-skill`） |
| `requirement` | 技能需求描述（功能、场景、预期行为） |

Copilot Agent 将自动：理解项目结构 → 生成符合规范的 Skill → 注册索引 → 提交 Pull Request。

### 方式二：手动创建

```bash
# 1. 复制模板目录
cp -r skills/template skills/<your-skill-name>

# 2. 编辑 SKILL.md
#    - 填写 name、description
#    - 完善说明、流程、示例章节

# 3. 在上方「技能索引」表中注册新技能

# 4. 提交 Pull Request（commit message 使用简体中文）
```
