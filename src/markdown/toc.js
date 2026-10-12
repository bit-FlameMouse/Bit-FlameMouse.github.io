/**
 * 文档正文的目录（TOC）。
 */

import { toc as extractToc } from '../markdown/renderer.js';
import { escapeHtml, $ } from '../utils/dom.js';
import { headerHeight } from '../core/scrollSpy.js';

/**
 * 依据 Markdown 原文生成目录并插入页面。
 * @param {HTMLElement} scope 查询 [data-toc] 的范围
 * @param {string} source     Markdown 原文
 */
export function mountToc(scope, source) {
  const container = $('[data-toc]', scope);
  if (!container) return;

  const headings = extractToc(source).filter((item) => item.level >= 1 && item.level <= 3);
  if (headings.length < 2) return;

  const list = container.querySelector('ul');
  list.innerHTML = headings
    .map(
      (item) =>
        '<li class="toc-level-' +
        item.level +
        '"><a href="#' +
        escapeHtml(item.id) +
        '" data-toc-link>' +
        escapeHtml(item.text) +
        '</a></li>',
    )
    .join('');
  container.hidden = false;

  list.addEventListener('click', (event) => {
    const link = event.target.closest('[data-toc-link]');
    if (!link) return;
    const target = document.getElementById(String(link.getAttribute('href')).replace('#', ''));
    if (!target) return;
    event.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - headerHeight() - 20,
      behavior: 'smooth',
    });
  });
}
