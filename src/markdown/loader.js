/**
 * Markdown 文档加载与渲染。
 */

import { render as renderMarkdown } from '../markdown/renderer.js';
import { resolveAsset } from '../utils/paths.js';
import { copyWithFeedback } from '../utils/clipboard.js';
import { $$ } from '../utils/dom.js';
import { errorState, loadingState } from '../utils/asyncState.js';

/** 判断是否处于 file:// 直接打开的状态（此时 fetch 会被浏览器拦截） */
function isFileProtocol() {
  return window.location.protocol === 'file:';
}

/**
 * 把 Markdown 文件渲染进目标容器。
 * @param {string} path    相对仓库根目录的路径，如 'content/projects/proj-maze.md'
 * @param {HTMLElement} node 目标容器
 * @returns {Promise<string|null>} 渲染成功返回原文，失败返回 null
 */
export async function loadMarkdown(path, node) {
  if (!node) return null;

  if (isFileProtocol()) {
    node.innerHTML = errorState(
      '浏览器禁止 file:// 协议读取本地 Markdown 文件。',
      '请在项目目录执行 <code>npm run dev</code>（或任意静态服务器）后访问 http://localhost:8000 预览。',
    );
    return null;
  }

  node.innerHTML = loadingState('正在读取文档…');

  try {
    const response = await fetch(resolveAsset(path), { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ' ' + response.statusText);
    }
    const text = await response.text();
    const basePath = path.replace(/[^/]*$/, '');

    node.innerHTML = renderMarkdown(text, { basePath });
    node.dataset.source = path;
    enhanceMarkdown(node);
    return text;
  } catch (error) {
    node.innerHTML = errorState(
      '无法读取 ' + path + '（' + error.message + '）。',
      '请确认文件已提交到仓库，且路径大小写一致。',
    );
    return null;
  }
}

/**
 * 渲染完成后的增强：代码复制按钮、外链补 target。
 * @param {HTMLElement} node
 */
export function enhanceMarkdown(node) {
  $$('[data-copy]', node).forEach((button) => {
    button.addEventListener('click', () => {
      const code = button.parentNode?.querySelector('code');
      if (!code) return;
      copyWithFeedback(code.innerText, button, { doneText: '已复制' });
    });
  });

  // 正文里的外链统一新窗口打开
  $$('a[href^="http"]', node).forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}
