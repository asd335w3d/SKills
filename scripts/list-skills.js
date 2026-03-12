#!/usr/bin/env node
/**
 * skill:list — 列出 skills/ 目录下所有已注册的技能
 * 用法：node scripts/list-skills.js
 *       npm run skill:list
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const EXCLUDE = new Set(['template', 'README.md']);

/** 技能名称列宽（字符数）*/
const NAME_COL_WIDTH = 28;
/** 版本号列宽（字符数）*/
const VERSION_COL_WIDTH = 8;

/**
 * 解析 SKILL.md 顶部的 YAML frontmatter，返回 { name, description, version, tags }
 * 仅做简单的正则解析，不引入外部依赖。
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const raw = match[1];
  const result = {};

  // name / description / version / license（单行值）
  for (const key of ['name', 'description', 'version', 'license']) {
    const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const m = raw.match(re);
    if (m) result[key] = m[1].replace(/^["']|["']$/g, '').trim();
  }

  // tags（多行列表）
  const tagsMatch = raw.match(/^tags:\s*\n((?:\s+-\s*.+\n?)*)/m);
  if (tagsMatch) {
    result.tags = tagsMatch[1]
      .split('\n')
      .map((l) => l.replace(/^\s+-\s*/, '').trim())
      .filter(Boolean);
  }

  return result;
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`错误：目录 ${SKILLS_DIR} 不存在`);
    process.exit(1);
  }

  const entries = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE.has(e.name))
    .map((e) => e.name)
    .sort();

  if (entries.length === 0) {
    console.log('暂无已注册的技能。');
    return;
  }

  const skills = [];
  for (const name of entries) {
    const skillFile = path.join(SKILLS_DIR, name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      skills.push({ dir: name, name: name, description: '(缺少 SKILL.md)', version: '-' });
      continue;
    }
    const content = fs.readFileSync(skillFile, 'utf8');
    const meta = parseFrontmatter(content);
    skills.push({
      dir: name,
      name: meta.name || name,
      description: meta.description || '(未填写描述)',
      version: meta.version || '-',
      tags: meta.tags || [],
    });
  }

  console.log(`\n已注册技能（共 ${skills.length} 个）\n`);
  console.log('─'.repeat(80));
  for (const s of skills) {
    const tags = s.tags && s.tags.length ? `  [${s.tags.join(', ')}]` : '';
    console.log(`  ${s.name.padEnd(NAME_COL_WIDTH)} v${s.version.padEnd(VERSION_COL_WIDTH)} ${s.description}`);
    if (tags) console.log(`  ${''.padEnd(NAME_COL_WIDTH)} ${tags}`);
  }
  console.log('─'.repeat(80));
  console.log();
}

main();
