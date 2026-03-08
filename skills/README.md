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
name: 技能唯一标识        # 必填：与目录名一致，小写连字符
description: 技能描述     # 必填：说明功能及触发场景
license: MIT             # 可选
---

## 说明
## 流程
## 示例
## 注意事项（可选）
```

详细规范请参阅 [`.github/skills/skill-authoring-guide/SKILL.md`](../.github/skills/skill-authoring-guide/SKILL.md)。

---

## 技能索引

| 技能名称 | 目录 | 描述 |
|----------|------|------|
| （暂无已注册技能，请按规范新建后在此登记） | — | — |

---

## 快速新建技能

```bash
# 1. 复制模板目录
cp -r skills/template skills/<your-skill-name>

# 2. 编辑 SKILL.md
#    - 填写 name、description
#    - 完善说明、流程、示例章节

# 3. 在上方「技能索引」表中注册新技能

# 4. 提交 Pull Request（commit message 使用简体中文）
```
