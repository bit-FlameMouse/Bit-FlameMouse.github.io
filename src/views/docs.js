/**
 * 文档库视图：列表（带搜索）与单篇文档（带目录）。
 */

import { CONTENT, findDoc } from '../data/content.js';
import { escapeHtml, $, $$ } from '../utils/dom.js';
import { formatDate } from '../utils/format.js';
import { createIcon } from '../utils/icons.js';
import { docCard, docSideItem } from '../ui/cards.js';
import { emptyPage, pageHeader } from '../ui/shells.js';
import { loadMarkdown } from '../markdown/loader.js';
import { mountToc } from '../markdown/toc.js';
import { embedFrame, sourceLink, mountEmbeds } from '../ui/embed.js';
import { resolveNoteSource } from '../utils/noteSource.js';
import { routeHref } from '../core/router.js';
import { scanReveal } from '../effects/reveal.js';

/**
 * 文档库列表页。
 * @param {HTMLElement} root
 */
export function renderDocList(root) {
  const docs = CONTENT.docs;

  root.innerHTML =
    pageHeader({
      eyebrow: 'Docs',
      title: '文档库',
      description: '项目说明、技术笔记与踩坑记录，全部用 Markdown 编写，并在浏览器里实时渲染。',
      extra:
        '<div class="search-box" data-reveal>' +
        createIcon('hash', 16) +
        '<input type="search" id="doc-search" placeholder="搜索文档标题或关键词…" aria-label="搜索文档" autocomplete="off">' +
        '</div>',
    }) +
    '<section class="section"><div class="container">' +
    (docs.length
      ? '<div class="doc-grid doc-grid-lg">' +
        docs.map((doc, index) => docCard(doc, index)).join('') +
        '</div>'
      : emptyDocState()) +
    '<p class="search-empty" hidden>没有匹配的文档，换个关键词试试。</p>' +
    '</div></section>';

  bindDocSearch(root);
  scanReveal(root);
  document.title = '文档库 · ' + CONTENT.site.title;
}

/** 文档库为空时的提示 */
function emptyDocState() {
  return (
    '<div class="empty-state">' +
    '<span class="empty-icon">' + createIcon('info', 24) + '</span>' +
    '<h3>还没有文档</h3>' +
    '<p>在 src/data/content.js 的 docs 数组里登记文档，并把 Markdown 文件放进 content/docs/ 目录。</p>' +
    '</div>'
  );
}

/** 关键词过滤 */
function bindDocSearch(root) {
  const input = $('#doc-search', root);
  if (!input) return;

  const items = $$('[data-doc-item]', root);
  const emptyHint = $('.search-empty', root);

  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();
    let visible = 0;

    items.forEach((item) => {
      const hit = !keyword || (item.dataset.search ?? '').includes(keyword);
      item.hidden = !hit;
      if (hit) visible += 1;
    });

    if (emptyHint) emptyHint.hidden = visible !== 0;
  });
}

/**
 * 单篇笔记页。
 *
 * 三种来源形态分别处理：
 *   - local    渲染站内 Markdown
 *   - hybrid   渲染站内 Markdown，顶部额外给"查看原文"入口
 *   - external 没有站内正文，给出外部入口（可选的懒加载预览）
 *
 * @param {HTMLElement} root
 * @param {string} id
 */
export async function renderDoc(root, id) {
  const doc = findDoc(id);

  if (!doc) {
    root.innerHTML = emptyPage({
      title: '找不到这篇笔记',
      description:
        '链接里的标识（<code>' +
        escapeHtml(id) +
        '</code>）在 content.js 的 docs 列表里不存在。',
      actions:
        '<a class="button button-primary" href="' +
        escapeHtml(routeHref('/docs')) +
        '">' +
        createIcon('arrow-left', 16) +
        '<span>返回文档库</span></a>',
    });
    scanReveal(root);
    return;
  }

  const source = resolveNoteSource(doc);
  const isExternalOnly = source.kind === 'external';

  root.innerHTML =
    '<div class="container docs-layout">' +
    '<aside class="docs-sidebar">' +
    '<a class="back-link" href="' +
    escapeHtml(routeHref('/docs')) +
    '">' +
    createIcon('arrow-left', 16) +
    '<span>文档库</span></a>' +
    '<nav class="side-nav" aria-label="文档列表"><ul>' +
    CONTENT.docs.map((item) => docSideItem(item, id)).join('') +
    '</ul></nav></aside>' +
    '<article class="docs-main" data-detail>' +
    '<header class="detail-head">' +
    '<p class="eyebrow">' + escapeHtml(doc.category ?? '文档') + '</p>' +
    '<h1 class="detail-title">' + escapeHtml(doc.title) + '</h1>' +
    '<p class="detail-lead">' + escapeHtml(doc.description ?? '') + '</p>' +
    '<p class="detail-updated">' +
    createIcon('calendar', 14) +
    '更新于 ' +
    escapeHtml(formatDate(doc.updated)) +
    '</p>' +
    (source.hasExternal && !isExternalOnly
      ? '<div class="detail-actions">' + sourceLink(source.url) + '</div>'
      : '') +
    '</header>' +
    (source.hasEmbed && isExternalOnly ? embedFrame(source.embedUrl) : '') +
    (source.hasLocal
      ? '<nav class="toc" data-toc hidden><span class="toc-label">本页目录</span><ul></ul></nav>' +
        '<div class="md-body" data-md-body></div>'
      : '') +
    '</article></div>';

  if (source.hasLocal) {
    const body = root.querySelector('[data-md-body]');
    const text = await loadMarkdown(source.body, body);
    if (text) mountToc(root, text);
  }

  mountEmbeds(root);
  scanReveal(root);
  document.title = doc.title + ' · ' + CONTENT.site.title;
}
