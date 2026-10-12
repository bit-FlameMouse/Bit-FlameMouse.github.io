/**
 * 卡片类 UI 片段：项目卡片、文档卡片。
 */

import { CONTENT } from '../data/content.js';
import { escapeHtml } from '../utils/dom.js';
import { formatDate } from '../utils/format.js';
import { createIcon } from '../utils/icons.js';
import { metricRow, tagList } from './fragments.js';
import { externalBadge } from './embed.js';
import { resolveNoteSource } from '../utils/noteSource.js';
import { routeHref } from '../core/router.js';

/**
 * 项目卡片。整卡可点，内部叠了一个铺满的链接以保证行为与可访问性。
 * @param {import('../data/content.js').CONTENT['projects'][number]} project
 * @param {number} [index=0] 用于错峰入场动画
 * @returns {string}
 */
export function projectCard(project, index = 0) {
  const href = routeHref('/project/' + project.id);

  return (
    '<article class="card project-card' +
    (project.featured ? ' is-featured' : '') +
    '" data-reveal data-reveal-delay="' +
    (index % 3) * 90 +
    '">' +
    '<a class="project-hit" href="' +
    escapeHtml(href) +
    '" aria-label="查看项目：' +
    escapeHtml(project.name) +
    '"></a>' +
    '<header class="project-head">' +
    '<div>' +
    '<p class="project-category">' +
    escapeHtml(project.category ?? '') +
    '</p>' +
    '<h3 class="project-name">' +
    escapeHtml(project.name) +
    '</h3>' +
    '</div>' +
    (project.badge ? '<span class="badge">' + escapeHtml(project.badge) + '</span>' : '') +
    '</header>' +
    '<p class="project-tagline">' +
    escapeHtml(project.tagline ?? '') +
    '</p>' +
    '<p class="project-summary">' +
    escapeHtml(project.summary ?? '') +
    '</p>' +
    metricRow((project.metrics ?? []).slice(0, 3)) +
    '<div class="project-foot">' +
    tagList(project.tech) +
    '<span class="project-more">' +
    createIcon('arrow-right', 16) +
    '</span>' +
    '</div>' +
    '</article>'
  );
}

/**
 * 笔记卡片。
 *
 * 三种来源形态（见 utils/noteSource.js）渲染成不同行为：
 *   - local    站内有正文 → 点击进入站内阅读页
 *   - hybrid   站内正文 + 外部原文 → 进入站内阅读页，页内另给原文入口
 *   - external 只有外部链接 → 直接新窗口打开原文，并在卡片上标注来源
 *
 * @param {object} doc
 * @param {number} [index=0] 用于错峰入场动画
 * @returns {string}
 */
export function docCard(doc, index = 0) {
  const source = resolveNoteSource(doc);
  const searchIndex = [doc.title, doc.description, doc.category].join(' ').toLowerCase();
  const href = source.hasLocal ? routeHref('/docs/' + doc.id) : source.url;
  const external = !source.hasLocal && source.hasExternal;

  return (
    '<a class="card doc-card' +
    (external ? ' is-external' : '') +
    '" href="' +
    escapeHtml(href) +
    '" data-doc-item data-reveal data-reveal-delay="' +
    index * 70 +
    '" data-search="' +
    escapeHtml(searchIndex) +
    '"' +
    (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
    '>' +
    '<span class="doc-category">' +
    escapeHtml(doc.category ?? '文档') +
    '</span>' +
    '<h3 class="doc-title">' +
    escapeHtml(doc.title) +
    externalBadge(source.url) +
    '</h3>' +
    '<p class="doc-desc">' +
    escapeHtml(doc.description) +
    '</p>' +
    '<span class="doc-foot">' +
    createIcon('calendar', 14) +
    escapeHtml(formatDate(doc.updated)) +
    '<span class="doc-more">' +
    (external ? '前往原文' : '阅读') +
    createIcon(external ? 'external-link' : 'arrow-right', 14) +
    '</span></span>' +
    '</a>'
  );
}

/**
 * 文档库侧边栏条目。
 * @param {object} doc
 * @param {string} activeId
 * @returns {string}
 */
export function docSideItem(doc, activeId) {
  const source = resolveNoteSource(doc);
  const searchIndex = [doc.title, doc.description, doc.category].join(' ').toLowerCase();
  const href = source.hasLocal ? routeHref('/docs/' + doc.id) : source.url;
  const external = !source.hasLocal && source.hasExternal;

  return (
    '<li><a class="side-item' +
    (doc.id === activeId ? ' is-active' : '') +
    (external ? ' is-external' : '') +
    '" href="' +
    escapeHtml(href) +
    '" data-doc-item data-search="' +
    escapeHtml(searchIndex) +
    '"' +
    (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
    '>' +
    '<span class="side-category">' +
    escapeHtml(doc.category ?? '文档') +
    (external ? ' · 原文' : '') +
    '</span>' +
    '<span class="side-title">' +
    escapeHtml(doc.title) +
    '</span>' +
    '<span class="side-updated">' +
    escapeHtml(formatDate(doc.updated)) +
    '</span>' +
    '</a></li>'
  );
}

/**
 * 首页的"最新文档"区块。
 * @param {number} [limit=3]
 * @returns {string}
 */
export function docPreviewSection(limit = 3) {
  // 首页强调"能直接在这里读"，所以只挑有站内正文的笔记
  const docs = CONTENT.docs.filter((doc) => resolveNoteSource(doc).hasLocal).slice(0, limit);
  if (!docs.length) return '';

  return (
    '<section class="section section-alt" id="docs" data-section>' +
    '<div class="container">' +
    '<header class="section-head section-head-row">' +
    '<div>' +
    '<p class="eyebrow">Docs</p>' +
    '<h2 class="section-title">文档与笔记</h2>' +
    '<p class="section-desc">用 Markdown 写的内容，直接在这个网站里渲染。</p>' +
    '</div>' +
    '<a class="button button-ghost" href="' +
    escapeHtml(routeHref('/docs')) +
    '">' +
    createIcon('book', 16) +
    '<span>全部文档</span></a>' +
    '</header>' +
    '<div class="doc-grid">' +
    docs.map((doc, index) => docCard(doc, index)).join('') +
    '</div>' +
    '</div></section>'
  );
}
