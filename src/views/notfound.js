/**
 * 404 视图。
 */

import { CONTENT } from '../data/content.js';
import { escapeHtml } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';
import { emptyPage } from '../ui/shells.js';
import { routeHref } from '../core/router.js';
import { scanReveal } from '../effects/reveal.js';

/**
 * @param {HTMLElement} root
 * @param {string} path 用户访问的无效路径
 */
export function renderNotFound(root, path) {
  root.innerHTML = emptyPage({
    code: '404',
    title: '这个页面不存在',
    description:
      '地址 <code>' +
      escapeHtml(String(path ?? '').slice(0, 80)) +
      '</code> 没有对应的内容。可能是链接过期，或者内容还在路上。',
    actions:
      '<a class="button button-primary" href="' +
      escapeHtml(routeHref('/')) +
      '">' + createIcon('arrow-left', 16) + '<span>回到首页</span></a>' +
      '<a class="button button-ghost" href="' +
      escapeHtml(routeHref('/docs')) +
      '">' + createIcon('book', 16) + '<span>看看文档</span></a>',
  });

  scanReveal(root);
  document.title = '页面不存在 · ' + CONTENT.site.title;
}
