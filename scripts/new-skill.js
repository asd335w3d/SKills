#!/usr/bin/env node
/**
 * skill:new — 从模板脚手架新建一个技能
 * 用法：node scripts/new-skill.js <skill-name>
 *       npm run skill:new -- <skill-name>
 *
 * 行为：
 *   1. 校验技能名称格式（小写字母、数字、连字符；不能以连字符开头/结尾）
 *   2. 检查技能是否已存在
 *   3. 读取 skills/template/SKILL.md 作为模板
 *   4. 将模板中的占位符替换为实际技能名
 *   5. 写入 skills/<name>/SKILL.md
 *   6. 写入 .github/skills/<name>/SKILL.md（副本）
 *   7. 在 skills/README.md 的技能索引表中注册新技能
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const GITHUB_SKILLS_DIR = path.join(ROOT, '.github', 'skills');
const TEMPLATE_FILE = path.join(SKILLS_DIR, 'template', 'SKILL.md');
const README_FILE = path.join(SKILLS_DIR, 'README.md');

/** 合法的技能名称正则：小写字母/数字，单词间可用连字符，不能以连字符开头/结尾 */
const NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

function usage() {
  console.log('用法: npm run skill:new -- <skill-name>');
  console.log('示例: npm run skill:new -- my-new-skill');
  process.exit(1);
}

function main() {
  const skillName = process.argv[2];

  if (!skillName) {
    console.error('错误：请提供技能名称。');
    usage();
  }

  // 1. 校验名称格式
  if (!NAME_PATTERN.test(skillName)) {
    console.error(`错误：技能名称 "${skillName}" 格式不合规。`);
    console.error('  要求：仅含小写字母、数字和连字符，不能以连字符开头或结尾。');
    console.error('  示例：my-skill、api-doc-generator、git-commit-helper');
    process.exit(1);
  }

  // 2. 检查是否已存在
  const destDir = path.join(SKILLS_DIR, skillName);
  if (fs.existsSync(destDir)) {
    console.error(`错误：技能 "${skillName}" 已存在（${destDir} 目录已存在）。`);
    process.exit(1);
  }

  // 3. 读取模板
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`错误：模板文件 ${TEMPLATE_FILE} 不存在。`);
    process.exit(1);
  }
  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

  // 4. 替换占位符
  const content = template
    .replace(/^name: <技能唯一标识>/m, `name: ${skillName}`)
    .replace(/^description: <一句话描述：技能的核心功能 \+ 触发场景>/m, 'description: （请在此填写技能描述，20～200 字，须包含核心功能和触发场景）');

  // 5. 写入 skills/<name>/SKILL.md
  fs.mkdirSync(destDir, { recursive: true });
  const skillFile = path.join(destDir, 'SKILL.md');
  fs.writeFileSync(skillFile, content, 'utf8');
  console.log(`✅ 已创建 skills/${skillName}/SKILL.md`);

  // 6. 写入 .github/skills/<name>/SKILL.md
  const githubDestDir = path.join(GITHUB_SKILLS_DIR, skillName);
  fs.mkdirSync(githubDestDir, { recursive: true });
  const githubFile = path.join(githubDestDir, 'SKILL.md');
  fs.writeFileSync(githubFile, content, 'utf8');
  console.log(`✅ 已创建 .github/skills/${skillName}/SKILL.md`);

  // 7. 在 skills/README.md 索引表中注册
  if (!fs.existsSync(README_FILE)) {
    console.warn(`警告：${README_FILE} 不存在，跳过索引注册。`);
  } else {
    const readme = fs.readFileSync(README_FILE, 'utf8');

    // 找到技能索引表的最后一行并在其后追加
    // 正则说明：匹配以「| `...` | [`skills/...`]...」格式结尾的表格行，
    // 其后紧跟空行 + --- 或 ## 分隔符，从而定位到表格的最后一行。
    const tableRowPattern = /(\| `[^`]+` \| \[`skills\/[^`]+\/`\][^\n]*\n)(?=\n---|\n##|\n\n---)/;
    const newRow = `| \`${skillName}\` | [\`skills/${skillName}/\`](./${skillName}/) | （请填写技能描述） |\n`;

    let updatedReadme;
    if (tableRowPattern.test(readme)) {
      updatedReadme = readme.replace(tableRowPattern, (match) => match + newRow);
    } else {
      // 降级：在表头下方查找最后一个 | 行并在其后追加
      const lastRowIdx = readme.lastIndexOf('\n| ');
      if (lastRowIdx !== -1) {
        const lineEnd = readme.indexOf('\n', lastRowIdx + 1);
        updatedReadme =
          readme.slice(0, lineEnd + 1) + newRow + readme.slice(lineEnd + 1);
      } else {
        updatedReadme = readme + `\n${newRow}`;
        console.warn('警告：未找到索引表，已将新行追加到文件末尾。请手动调整格式。');
      }
    }

    fs.writeFileSync(README_FILE, updatedReadme, 'utf8');
    console.log(`✅ 已在 skills/README.md 索引表中注册 "${skillName}"`);
  }

  console.log(`\n🎉 技能 "${skillName}" 创建成功！`);
  console.log(`\n下一步：`);
  console.log(`  1. 编辑 skills/${skillName}/SKILL.md，填写 description 及所有必需章节`);
  console.log(`  2. 完成后运行 npm run skill:validate 校验规范`);
  console.log(`  3. 运行 npm run skill:sync 确保副本同步`);
}

main();
