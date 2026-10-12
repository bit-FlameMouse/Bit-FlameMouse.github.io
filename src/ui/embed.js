/**
 * 笔记的"原文入口"与"预览嵌入"。
 *
 * 背景：飞书这类平台默认不允许自己的文档页面被 iframe 嵌入
 *（响应头里的 X-Frame-Options / CSP frame-ancestors 会拦住），
 * 而且它们官方推荐的"网页组件"方案需要自建应用 + 服务端鉴权，
 * 静态站点用不了。所以这里采取的策略是：
 *
 *   1. 默认只给"在新窗口打开原文"的入口 —— 稳定、永远可用；
 *   2. 想尝试站内预览时，用"点击后加载"的懒加载 iframe：
 *      - 不点击就不会请求第三方，首屏性能不受影响；
 *      - 万一被平台拦截，用户看到的是平台自己的提示，同时页面上
 *        依然保留原文链接作为出口。
 */

import { escapeHtml } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';
import { externalAttrs } from './fragments.js';

/**
 * "在新窗口打开原文"按钮。
 * @param {string} url
 * @param {string} [label='查看原文']
 * @returns {string}
 */
export function sourceLink(url, label = '查看原文') {
  if (!url) return '';
  return (
    '<a class="button button-ghost" href="' +
    escapeHtml(url) +
    '"' +
    externalAttrs(url) +
    '>' +
    createIcon('external-link', 16) +
    '<span>' +
    escapeHtml(label) +
    '</span></a>'
  );
}

/**
 * 笔记卡片右上角的"外部来源"标记，让读者一眼知道这篇要去别处看。
 * @param {string} url
 * @param {string} [title='原文在外部文档中']
 * @returns {string}
 */
export function externalBadge(url, title = '原文在外部文档中') {
  if (!url) return '';
  return (
    '<span class="note-source-badge" title="' +
    escapeHtml(title) +
    '" aria-label="' +
    escapeHtml(title) +
    '">' +
    createIcon('external-link', 13) +
    '<span>原文</span>' +
    '</span>'
  );
}

/**
 * 懒加载的预览嵌入容器。
 *
 * 交互：先显示一个占位面板和"加载预览"按钮，点击后才创建 iframe。
 * 这样即便平台拦截嵌入，也不会影响页面其余部分，且用户始终有原文链接可用。
 *
 * @param {string} url 要嵌入的地址
 * @returns {string}
 */
export function embedFrame(url) {
  if (!url) return '';
  const safeUrl = escapeHtml(url);

  return (
    '<section class="note-embed" data-note-embed data-embed-src="' +
    safeUrl +
    '">' +
    '<div class="note-embed-inner">' +
    '<span class="note-embed-icon">' +
    createIcon('layers', 22) +
    '</span>' +
    '<h3 class="note-embed-title">这篇笔记的原文在外部文档</h3>' +
    '<p class="note-embed-desc">' +
    '外部文档平台通常不允许被其他网站嵌入，直接预览可能显示不出来或要求登录。' +
    '若预览为空，请使用下方的"在新窗口打开"。' +
    '</p>' +
    '<div class="note-embed-actions">' +
    '<button class="button button-primary" type="button" data-embed-load>' +
    createIcon('globe', 16) +
    '<span>尝试加载预览</span>' +
    '</button>' +
    '<a class="button button-ghost" href="' +
    safeUrl +
    '" target="_blank" rel="noopener noreferrer">' +
    createIcon('external-link', 16) +
    '<span>在新窗口打开</span>' +
    '</a>' +
    '</div>' +
    '</div>' +
    '</section>'
  );
}

/**
 * 为容器内所有 [data-note-embed] 绑定"点击后加载"的行为。
 * 由视图在渲染完成后调用。
 * @param {ParentNode} [scope=document]
 */
export function mountEmbeds(scope = document) {
  scope.querySelectorAll('[data-note-embed]').forEach((container) => {
    const button = container.querySelector('[data-embed-load]');
    if (!button) return;

    button.addEventListener('click', () => {
      const src = container.dataset.embedSrc;
      if (!src) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'note-embed-frame';
      wrapper.innerHTML =
        '<div class="note-embed-loading" role="status"><span class="spinner" aria-hidden="true"></span><p>正在加载预览…</p></div>' +
        '<iframe title="笔记原文预览" src="' +
        escapeHtml(src) +
        '" loading="lazy" referrerpolicy="no-referrer" allowfullscreen></iframe>' +
        '<p class="note-embed-hint">如果这里一直空白，说明对方平台拒绝了嵌入，请点上面的"在新窗口打开"。</p>';

      container.classList.add('is-embedding');
      container.innerHTML = '';
      container.appendChild(wrapper);

      const loading = wrapper.querySelector('.note-embed-loading');
      wrapper.querySelector('iframe').addEventListener('load', () => {
        loading?.remove();
      });
    });
  });
}
