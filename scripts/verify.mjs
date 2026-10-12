#!/usr/bin/env node
/**
 * 静态校验脚本（零依赖）。
 *
 * 在 CI 或提交前跑一次，可以在不打开浏览器的情况下发现最常见的低级错误：
 *   1. HTML 里引用的资源是否存在
 *   2. JS 的 import 路径是否存在（含扩展名）
 *   3. CSS 的 @import 路径是否存在
 *   4. content.js 里登记的 Markdown 文件是否存在
 *   5. 是否存在旧的全局变量写法残留（window.CONTENT 之类）
 *   6. JS / CSS 里是否残留 TODO 之外的空文件
 *
 * 用法：npm run verify
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const errors = [];
const warnings = [];

const toRelative = (absolute) => relative(ROOT, absolute).split('\\').join('/');

/** 递归收集指定扩展名的文件 */
function walk(dir, extensions, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, extensions, acc);
    else if (extensions.includes(extname(name))) acc.push(full);
  }
  return acc;
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

/* 1. HTML 引用的资源 */
for (const htmlFile of walk(ROOT, ['.html'])) {
  const source = readFileSync(htmlFile, 'utf8');
  const refs = [...source.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|data:|mailto:|#|\/\/)/.test(ref)) continue;
    const target = resolve(dirname(htmlFile), ref.split(/[?#]/)[0]);
    if (!exists(target)) errors.push('HTML 引用的资源不存在: ' + ref + '  (来自 ' + toRelative(htmlFile) + ')');
  }
}

/* 2 与 3. JS import / CSS @import */
const importPattern = /(?:^|\n)\s*import\s+(?:[^'"]*?from\s+)?['"]([^'"]+)['"]/g;
for (const jsFile of walk(join(ROOT, 'src'), ['.js', '.mjs'])) {
  const source = readFileSync(jsFile, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (!specifier.startsWith('.')) continue;
    if (!specifier.endsWith('.js')) {
      errors.push('import 缺少 .js 扩展名: ' + specifier + '  (来自 ' + toRelative(jsFile) + ')');
      continue;
    }
    const target = resolve(dirname(jsFile), specifier);
    if (!exists(target)) errors.push('import 目标不存在: ' + specifier + '  (来自 ' + toRelative(jsFile) + ')');
  }
}

for (const cssFile of walk(join(ROOT, 'src'), ['.css'])) {
  const source = readFileSync(cssFile, 'utf8');
  for (const match of source.matchAll(/@import\s+url\(['"]?([^'")]+)['"]?\)/g)) {
    const target = resolve(dirname(cssFile), match[1]);
    if (!exists(target)) errors.push('@import 目标不存在: ' + match[1] + '  (来自 ' + toRelative(cssFile) + ')');
  }
}

/* 4. content.js 里的 Markdown 路径 */
const contentFile = join(ROOT, 'src/data/content.js');
const contentSource = readFileSync(contentFile, 'utf8');
for (const match of contentSource.matchAll(/body:\s*'([^']+)'/g)) {
  const target = join(ROOT, match[1]);
  if (!exists(target)) errors.push('content.js 登记的 Markdown 不存在: ' + match[1]);
}

/* 4.5 导入导出一致性：import 的名字必须真的被目标模块导出 */
/** 收集每个模块导出的名字 */
function collectExports() {
  const map = new Map();
  for (const file of walk(join(ROOT, 'src'), ['.js'])) {
    const source = readFileSync(file, 'utf8');
    const names = new Set();
    for (const m of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
    for (const m of source.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
    for (const m of source.matchAll(/export\s*\{([^}]+)\}/g)) {
      m[1].split(',').forEach((part) => {
        const name = part.trim().split(/\s+as\s+/).pop().trim();
        if (name) names.add(name);
      });
    }
    if (/export\s+default/.test(source)) names.add('default');
    map.set(file, names);
  }
  return map;
}

const exportMap = collectExports();
for (const jsFile of walk(join(ROOT, 'src'), ['.js'])) {
  const source = readFileSync(jsFile, 'utf8');
  const specifierRe = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(specifierRe)) {
    const specifier = match[2];
    if (!specifier.startsWith('.')) continue;
    const target = resolve(dirname(jsFile), specifier);
    const available = exportMap.get(target);
    if (!available) continue; // 文件不存在的情况已在第 2 步报告
    const imported = match[1]
      .split(',')
      .map((part) => part.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    for (const name of imported) {
      if (!available.has(name)) {
        errors.push(
          '导入的名字未被导出: { ' + name + ' } from ' + specifier + '  (来自 ' + toRelative(jsFile) + ')',
        );
      }
    }
  }
}

/* 5. 旧的全局变量写法 */
const legacyPatterns = [
  { re: /window\.(CONTENT|Theme|Router|Shell|Reveal|MiniMarkdown|ViewHelper)/, label: '旧的全局命名空间引用' },
  { re: /^(?!.*\/\/)const CONTENT = \{/m, label: 'content.js 仍然使用旧的全局声明' },
];
for (const jsFile of walk(join(ROOT, 'src'), ['.js'])) {
  const source = readFileSync(jsFile, 'utf8');
  for (const { re, label } of legacyPatterns) {
    if (re.test(source)) errors.push(label + ': ' + toRelative(jsFile));
  }
}

/* 6. 空文件检查 */
for (const file of walk(ROOT, ['.js', '.css', '.html', '.json'])) {
  if (toRelative(file).startsWith('node_modules')) continue;
  if (statSync(file).size === 0) warnings.push('空文件: ' + toRelative(file));
}

/* 输出 */
const jsCount = walk(join(ROOT, 'src'), ['.js']).length;
const cssCount = walk(join(ROOT, 'src'), ['.css']).length;
console.log('校验范围: ' + jsCount + ' 个 JS 模块，' + cssCount + ' 个 CSS 文件');
console.log('');

if (warnings.length) {
  console.log('警告 (' + warnings.length + '):');
  warnings.forEach((w) => console.log('  ! ' + w));
  console.log('');
}

if (errors.length) {
  console.log('错误 (' + errors.length + '):');
  errors.forEach((e) => console.log('  x ' + e));
  process.exitCode = 1;
} else {
  console.log('全部检查通过。');
}
