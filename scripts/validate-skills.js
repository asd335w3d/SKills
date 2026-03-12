#!/usr/bin/env node
/**
 * skill:validate — 校验所有技能文件的规范性
 * 用法：node scripts/validate-skills.js
 *       npm run skill:validate
 *
 * 校验项：
 *   1. SKILL.md 存在且包含有效的 YAML frontmatter（name、description 必填）
 *   2. name 字段与目录名完全一致
 *   3. description 长度在 20～200 字之间
 *   4. 正文包含全部 7 个必需章节
 *   5. .github/skills/<name>/SKILL.md 副本存在且与 skills/<name>/SKILL.md 内容一致
 *   6. 技能已在 skills/README.md 索引表中注册
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const GITHUB_SKILLS_DIR = path.join(ROOT, '.github', 'skills');
const README_FILE = path.join(SKILLS_DIR, 'README.md');
const EXCLUDE = new Set(['template', 'README.md']);

/**
 * 必需章节列表。
 * 对应 .github/copilot-instructions.md 中「SKILL.md 必需章节」规范，
 * 共 7 个必填章节 + 1 个推荐章节（注意事项，不在此校验）。
 */
const REQUIRED_SECTIONS = ['## 说明', '## 流程', '## 示例', '## 测试方案', '## 评分标准', '## 维度测评报告', '## 迭代方案'];

/**
 * 解析 SKILL.md 顶部的 YAML frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const raw = match[1];
  const result = {};
  for (const key of ['name', 'description', 'version', 'license']) {
    const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const m = raw.match(re);
    if (m) result[key] = m[1].replace(/^["']|["']$/g, '').trim();
  }
  return result;
}

function validate() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`错误：目录 ${SKILLS_DIR} 不存在`);
    process.exit(1);
  }

  const skillDirs = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE.has(e.name))
    .map((e) => e.name)
    .sort();

  if (skillDirs.length === 0) {
    console.log('暂无技能，跳过校验。');
    return;
  }

  const readmeContent = fs.existsSync(README_FILE) ? fs.readFileSync(README_FILE, 'utf8') : '';

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const dir of skillDirs) {
    const errors = [];
    const warnings = [];
    const skillFile = path.join(SKILLS_DIR, dir, 'SKILL.md');

    // 1. SKILL.md 存在
    if (!fs.existsSync(skillFile)) {
      errors.push(`缺少 SKILL.md 文件`);
      printResult(dir, errors, warnings);
      totalErrors += errors.length;
      continue;
    }

    const content = fs.readFileSync(skillFile, 'utf8');
    const meta = parseFrontmatter(content);

    // 2. frontmatter 有效
    if (!meta) {
      errors.push('缺少 YAML frontmatter（文件开头需要 --- ... --- 块）');
    } else {
      // 3. name 字段存在且与目录名一致
      if (!meta.name) {
        errors.push('frontmatter 缺少必填字段 name');
      } else if (meta.name !== dir) {
        errors.push(`name 字段（"${meta.name}"）与目录名（"${dir}"）不一致`);
      }

      // 4. description 字段存在且长度合规
      if (!meta.description) {
        errors.push('frontmatter 缺少必填字段 description');
      } else {
        const len = meta.description.length;
        if (len < 20) {
          errors.push(`description 过短（当前 ${len} 字，要求 ≥20 字）`);
        } else if (len > 200) {
          errors.push(`description 过长（当前 ${len} 字，要求 ≤200 字）`);
        }
      }
    }

    // 5. 必需章节
    for (const section of REQUIRED_SECTIONS) {
      if (!content.includes(section)) {
        errors.push(`缺少必需章节 "${section}"`);
      }
    }

    // 6. .github/skills 副本
    const githubCopy = path.join(GITHUB_SKILLS_DIR, dir, 'SKILL.md');
    if (!fs.existsSync(githubCopy)) {
      errors.push(`.github/skills/${dir}/SKILL.md 副本不存在`);
    } else {
      const copyContent = fs.readFileSync(githubCopy, 'utf8');
      if (copyContent !== content) {
        warnings.push(`.github/skills/${dir}/SKILL.md 与 skills/${dir}/SKILL.md 内容不一致，请执行 npm run skill:sync 同步`);
      }
    }

    // 7. 已在 README.md 中注册
    if (!readmeContent.includes(dir)) {
      warnings.push(`技能尚未在 skills/README.md 索引表中注册`);
    }

    printResult(dir, errors, warnings);
    totalErrors += errors.length;
    totalWarnings += warnings.length;
  }

  console.log('\n' + '─'.repeat(60));
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`✅ 全部 ${skillDirs.length} 个技能校验通过，无错误。`);
  } else {
    console.log(`共检查 ${skillDirs.length} 个技能：${totalErrors} 个错误，${totalWarnings} 个警告`);
  }
  console.log();

  if (totalErrors > 0) process.exit(1);
}

function printResult(name, errors, warnings) {
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`✅ ${name}`);
    return;
  }
  if (errors.length > 0) {
    console.log(`❌ ${name}`);
    for (const e of errors) console.log(`   [错误] ${e}`);
  }
  if (warnings.length > 0) {
    if (errors.length === 0) console.log(`⚠️  ${name}`);
    for (const w of warnings) console.log(`   [警告] ${w}`);
  }
}

validate();
