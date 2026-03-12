---
name: git-commit-helper
description: 分析当前 Git 仓库的暂存区变更内容，自动生成符合 Conventional Commits 规范的 commit message，并支持按变更类型拆分为多个原子提交，适用于提交前需要快速整理变更描述或保持提交历史规范整洁的场景。
license: MIT
version: "1.0.0"
tags:
  - Git
  - 代码规范
  - 工作流
---

## 说明

本技能读取当前 Git 仓库暂存区（staged）或工作区的变更差异（diff），分析变更的文件、类型和内容，自动生成符合 [Conventional Commits 1.0.0](https://www.conventionalcommits.org/) 规范的 commit message。若变更涉及多个不相关的功能点，还会建议拆分为多个原子提交并给出每个提交的 message。

**适用场景**：

- 场景一：完成一次开发后，需要提交代码但不确定如何写规范的 commit message，希望快速生成一条符合团队规范的提交说明
- 场景二：一次性修改了多个不相关的内容（如同时修复 bug 并新增功能），需要提示拆分为独立提交以保持历史清晰
- 场景三：为项目配置了 commitlint 或语义化版本发布（semantic-release）后，需要确保每次提交格式正确以触发自动化流程

**前提条件**：

- 当前目录为 Git 仓库（存在 `.git` 目录）
- 暂存区有待提交的变更（已执行 `git add`），或工作区有未暂存的变更（此时分析工作区 diff）

**不适用场景**：

- 不适用于首次初始化提交（`git init` 后的第一次提交）
- 不会自动执行 `git commit`，只生成 message 供用户确认后手动提交，避免误操作

---

## 流程

1. **获取变更差异**：运行以下命令获取变更内容：
   ```bash
   # 优先分析暂存区内容
   git diff --staged --stat
   git diff --staged
   ```
   若暂存区为空，则改为分析工作区变更：
   ```bash
   git diff --stat
   git diff
   ```
   若两者均为空，停止并提示用户：「当前没有检测到任何变更，请先修改文件或执行 git add。」

2. **分析变更内容**：解析 diff 输出，提取以下信息：
   - 变更文件列表和各文件变更行数
   - 变更类型判断（新增文件、删除文件、修改文件）
   - 变更内容的语义归类（功能代码、测试文件、文档、配置、样式、构建脚本等）

3. **判断是否需要拆分提交**：若满足以下任一条件，建议拆分：
   - 同时修改了功能代码和测试文件以外的内容（如同时改了 `src/` 和 `docs/`）
   - 变更涉及多个独立功能模块（如同时修改了 `auth` 模块和 `payment` 模块的核心逻辑）
   - 同时包含 `feat`（新功能）和 `fix`（修复）类型的变更

4. **生成 commit message**：按照 Conventional Commits 格式生成：

   ```
   <type>(<scope>): <subject>

   <body（可选）>

   <footer（可选，如 BREAKING CHANGE 或 issue 关联）>
   ```

   - **type** 取值规则：
     | type | 适用场景 |
     |------|---------|
     | `feat` | 新增用户可见的功能 |
     | `fix` | 修复 bug |
     | `docs` | 仅修改文档（README、注释等） |
     | `style` | 不影响逻辑的格式调整（缩进、空格、分号）|
     | `refactor` | 重构代码，不新增功能也不修复 bug |
     | `test` | 新增或修改测试用例 |
     | `chore` | 构建脚本、依赖更新、工具配置等 |
     | `perf` | 性能优化 |
     | `ci` | CI/CD 配置修改 |

   - **scope**：取变更涉及的主要模块名（如 `auth`、`user-api`、`payment`），可为空
   - **subject**：用简体中文（或与项目保持一致的语言）简洁描述变更，不超过 50 字，动词开头，不加句号

5. **输出结果**：按以下格式输出，供用户确认：

   ```markdown
   ## 建议的 commit message

   ### 方案一（推荐）：单次提交
   ```
   feat(user): 新增用户头像上传功能

   支持 JPG/PNG 格式，文件大小限制 2MB，上传后自动压缩至 200x200px。
   ```

   ### 方案二：拆分为 2 次提交（若涉及多个关注点）
   **提交 1/2**：
   ```
   feat(user): 新增用户头像上传功能
   ```
   **提交 2/2**：
   ```
   test(user): 补充头像上传功能的单元测试
   ```

   ---
   > 确认使用后，执行：`git commit -m "feat(user): 新增用户头像上传功能"`
   ```

---

## 示例

### 示例一：修复 bug 的提交

**触发提示词**：

```
请根据我当前的 git 变更生成 commit message
```

**执行前状态**：暂存区包含对 `src/auth/tokenValidator.ts` 的修改（修复了 JWT 过期时间判断逻辑中的时区问题）。

**预期输出**：

```markdown
## 建议的 commit message

### 方案一（推荐）：单次提交
```
fix(auth): 修复 JWT 过期时间判断时区错误问题

将 Date.now() 与 token.exp 的比较统一转换为 UTC 时间戳，
避免在非 UTC 时区服务器上出现误判导致有效 token 被拒绝。
```

> 确认使用后，执行：`git commit -m "fix(auth): 修复 JWT 过期时间判断时区错误问题"`
```

### 示例二：涉及多个关注点，建议拆分提交

**触发提示词**：

```
帮我生成这次的 commit message，我修改了登录功能和 README
```

**预期输出**：

```markdown
## 建议的 commit message

检测到此次变更涉及两个独立关注点，建议拆分为 2 次提交：

**提交 1/2**（先暂存 src/ 下的变更）：
```
feat(auth): 新增记住登录状态功能，有效期 7 天
```

**提交 2/2**（再暂存 README.md）：
```
docs: 更新 README 补充登录功能使用说明
```

**拆分步骤**：
```bash
git add src/auth/
git commit -m "feat(auth): 新增记住登录状态功能，有效期 7 天"
git add README.md
git commit -m "docs: 更新 README 补充登录功能使用说明"
```
```

---

## 注意事项

- 本技能只生成 commit message，不会自动执行 `git commit`，需用户手动确认并执行
- 若项目有自定义的 commit message 规范（如 `.commitlintrc`），请在提示词中告知，生成结果将优先遵循项目规范
- subject 行默认使用简体中文；若项目惯例为英文，可在提示词中说明「请用英文生成」
- 生成的 body 内容基于 diff 的语义推断，用户应检查是否准确描述了变更意图
