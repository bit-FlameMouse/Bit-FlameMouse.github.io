#!/usr/bin/env node
/**
 * 零依赖静态服务器，仅用于本地预览。
 *
 * 为什么不能直接双击 index.html：
 *   浏览器禁止 file:// 协议发起 fetch，而项目详情与技术笔记是用 fetch 读取 Markdown 的。
 *
 * 用法：
 *   npm run dev            # 默认 http://localhost:8000
 *   npm run dev -- 3000    # 指定端口
 *
 * 注意：ES Module 要求正确的 MIME 类型，因此这里显式维护了一份扩展名映射表；
 * 用 Python 的 `python -m http.server` 也能正常预览，两者等价。
 */

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 8000);
const HOST = process.env.HOST ?? '127.0.0.1';

/** 扩展名 → Content-Type。ES Module 必须以 text/javascript 返回，否则浏览器拒绝执行 */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * 把请求路径映射到磁盘文件，并阻止越权访问项目目录之外的文件。
 * @param {string} urlPath
 * @returns {string|null}
 */
function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = normalize(decoded).replace(/^([/\\])+/, '');
  const target = join(ROOT, relative);

  // 目录穿越保护：解析后的路径必须仍在项目目录内
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;

  try {
    const stats = statSync(target);
    if (stats.isDirectory()) return resolveFile(join(relative, 'index.html'));
    if (stats.isFile()) return target;
  } catch {
    /* 落到 404 */
  }
  return null;
}

const server = createServer((req, res) => {
  const file = resolveFile(req.url ?? '/');

  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + req.url);
    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(file).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log('本地预览已启动: http://' + HOST + ':' + PORT + '/');
  console.log('按 Ctrl+C 停止');
});
