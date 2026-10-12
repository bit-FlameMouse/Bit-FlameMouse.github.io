/**
 * 可复用的 HTML 片段（纯函数，输入数据输出字符串）。
 *
 * 约定：所有动态文本都经过 escapeHtml，调用方无需再处理转义。
 */

import { escapeHtml } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';
import { clampPercent } from '../utils/format.js';

/**
 * 判断是否外部链接。
 * @param {string} url
 * @returns {boolean}
 */
export function isExternalUrl(url) {
  return /^https?:/i.test(String(url ?? ''));
}

/**
 * 外部链接的 target / rel 属性（内部链接返回空字符串）。
 * @param {string} url
 * @returns {string}
 */
export function externalAttrs(url) {
  return isExternalUrl(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

/**
 * 技术标签组。
 * @param {string[]} [tags]
 * @returns {string}
 */
export function tagList(tags = []) {
  if (!tags.length) return '';
  return (
    '<ul class="tag-list">' +
    tags.map((tag) => '<li class="tag">' + escapeHtml(tag) + '</li>').join('') +
    '</ul>'
  );
}

/**
 * 项目要点数据行。
 * @param {{ value: string, label: string }[]} [metrics]
 * @param {boolean} [large=false]
 * @returns {string}
 */
export function metricRow(metrics = [], large = false) {
  if (!metrics.length) return '';
  return (
    '<ul class="metric-row' +
    (large ? ' metric-row-lg' : '') +
    '">' +
    metrics
      .map(
        (metric) =>
          '<li><strong>' +
          escapeHtml(metric.value) +
          '</strong><span>' +
          escapeHtml(metric.label) +
          '</span></li>',
      )
      .join('') +
    '</ul>'
  );
}

/**
 * 按钮式链接。url 为空或 '#' 时返回空字符串，方便在模板里直接内联。
 * @param {string} url
 * @param {string} label
 * @param {string} iconName
 * @param {'primary'|'ghost'} [variant='ghost']
 * @returns {string}
 */
export function linkButton(url, label, iconName, variant = 'ghost') {
  if (!url || url === '#') return '';
  return (
    '<a class="button button-' +
    variant +
    '" href="' +
    escapeHtml(url) +
    '"' +
    externalAttrs(url) +
    '>' +
    createIcon(iconName, 16) +
    '<span>' +
    escapeHtml(label) +
    '</span></a>'
  );
}

/**
 * 技能进度条。
 * @param {{ name: string, level: number }[]} [items]
 * @returns {string}
 */
export function skillList(items = []) {
  return (
    '<ul class="skill-list">' +
    items
      .map((item) => {
        const level = clampPercent(item.level);
        return (
          '<li class="skill-item">' +
          '<div class="skill-line"><span class="skill-name">' +
          escapeHtml(item.name) +
          '</span><span class="skill-level">' +
          level +
          '%</span></div>' +
          '<div class="skill-track" role="progressbar" aria-label="' +
          escapeHtml(item.name) +
          '" aria-valuenow="' +
          level +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<span class="skill-fill" style="--level:' +
          level +
          '%"></span>' +
          '</div>' +
          '</li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

/**
 * 通用"返回"链接。
 * @param {string} href
 * @param {string} [label='返回']
 * @returns {string}
 */
export function backLink(href, label = '返回') {
  return (
    '<a class="back-link" href="' +
    escapeHtml(href) +
    '">' +
    createIcon('arrow-left', 16) +
    '<span>' +
    escapeHtml(label) +
    '</span></a>'
  );
}

/**
 * 详情页的头部（分类眉标 + 标题 + 元信息）。
 * @param {{ eyebrow?: string, title: string, meta?: string, lead?: string }} options
 * @returns {string}
 */
export function detailHeader({ eyebrow, title, meta, lead }) {
  return (
    '<header class="detail-head">' +
    (eyebrow ? '<p class="eyebrow">' + escapeHtml(eyebrow) + '</p>' : '') +
    '<h1 class="detail-title">' + escapeHtml(title) + '</h1>' +
    (lead ? '<p class="detail-lead">' + escapeHtml(lead) + '</p>' : '') +
    (meta ? '<div class="detail-meta">' + meta + '</div>' : '') +
    '</header>'
  );
}
