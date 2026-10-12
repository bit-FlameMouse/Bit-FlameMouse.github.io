/**
 * 页面骨架片段：详情页外壳、页面标题区。
 */

import { escapeHtml } from '../utils/dom.js';
import { loadingState } from '../utils/asyncState.js';
import { backLink } from './fragments.js';

/**
 * 详情页外壳：返回链接 + 标题区 + 正文容器。
 * @param {{ backHref: string, backLabel?: string, eyebrow?: string, title: string,
 *           lead?: string, meta?: string, actions?: string, loadingText?: string }} options
 * @returns {string}
 */
export function detailShell(options) {
  const { backHref, backLabel = '返回', eyebrow, title, lead, meta, actions, loadingText } = options;

  return (
    '<article class="detail container" data-detail>' +
    backLink(backHref, backLabel) +
    '<header class="detail-head">' +
    (eyebrow ? '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>' : '') +
    '<h1 class="detail-title">' + escapeHtml(title) + '</h1>' +
    (lead ? '<p class="detail-lead">' + escapeHtml(lead) + '</p>' : '') +
    (meta ? '<div class="detail-meta">' + meta + '</div>' : '') +
    '</header>' +
    (actions ? '<div class="detail-actions">' + actions + '</div>' : '') +
    '<div class="md-body" data-md-body>' +
    loadingState(loadingText ?? '正在加载内容…') +
    '</div>' +
    '</article>'
  );
}

/**
 * 列表类页面的标题区（文档库等）。
 * @param {{ eyebrow: string, title: string, description: string, extra?: string }} options
 * @returns {string}
 */
export function pageHeader({ eyebrow, title, description, extra = '' }) {
  return (
    '<section class="page-head">' +
    '<div class="container">' +
    '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>' +
    '<h1 class="page-title">' + escapeHtml(title) + '</h1>' +
    '<p class="section-desc">' + escapeHtml(description) + '</p>' +
    extra +
    '</div></section>'
  );
}

/**
 * 404 风格的空状态页面。
 * @param {{ code?: string, title: string, description: string, actions?: string }} options
 * @returns {string}
 */
export function emptyPage({ code, title, description, actions = '' }) {
  return (
    '<div class="container notfound">' +
    (code ? '<p class="notfound-code">' + escapeHtml(code) + '</p>' : '') +
    '<h1 class="notfound-title">' + escapeHtml(title) + '</h1>' +
    '<p class="notfound-desc">' + description + '</p>' +
    (actions ? '<div class="notfound-actions">' + actions + '</div>' : '') +
    '</div>'
  );
}
