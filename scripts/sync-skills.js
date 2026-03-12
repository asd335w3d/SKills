#!/usr/bin/env node
/**
 * skill:sync — 将 skills/<name>/SKILL.md 同步到 .github/skills/<name>/SKILL.md
 * 用法：node scripts/sync-skills.js
 *       npm run skill:sync
 *
 * 行为：
 *   - 遍历 skills/ 下的所有技能目录（排除 template）
 *   - 若 .github/skills/<name>/SKILL.md 不存在或内容与 skills/<name>/SKILL.md 不同，则覆盖写入
 *   - 最终输出同步统计
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const GITHUB_SKILLS_DIR = path.join(ROOT, '.github', 'skills');
const EXCLUDE = new Set(['template', 'README.md']);

function sync() {
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
    console.log('暂无技能，跳过同步。');
    return;
  }

  let synced = 0;
  let skipped = 0;
  let missing = 0;

  for (const dir of skillDirs) {
    const src = path.join(SKILLS_DIR, dir, 'SKILL.md');
    const dest = path.join(GITHUB_SKILLS_DIR, dir, 'SKILL.md');

    if (!fs.existsSync(src)) {
      console.log(`⚠️  跳过 ${dir}：skills/${dir}/SKILL.md 不存在`);
      missing++;
      continue;
    }

    const srcContent = fs.readFileSync(src, 'utf8');

    if (fs.existsSync(dest)) {
      const destContent = fs.readFileSync(dest, 'utf8');
      if (destContent === srcContent) {
        console.log(`✔  ${dir}：已是最新，无需同步`);
        skipped++;
        continue;
      }
    }

    // 确保目标目录存在
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, srcContent, 'utf8');
    console.log(`🔄 ${dir}：已同步到 .github/skills/${dir}/SKILL.md`);
    synced++;
  }

  console.log(`\n同步完成：已更新 ${synced} 个，无需更新 ${skipped} 个，缺少源文件 ${missing} 个。\n`);
}

sync();
