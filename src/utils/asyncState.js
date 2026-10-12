/**
 * 异步加载过程中的占位状态（加载中 / 失败 / 空）。
 */

import { escapeHtml } from './dom.js';
import { createIcon } from './icons.js';

/**
 * 加载中占位。
 * @param {string} [text='正在加载…']
 * @returns {string}
 */
export function loadingState(text = '正在加载…') {
  return (
    '<div class="loading" role="status">' +
    '<span class="spinner" aria-hidden="true"></span>' +
    '<p>' +
    escapeHtml(text) +
    '</p>' +
    '</div>'
  );
}

/**
 * 错误占位。hint 允许传入受控 HTML（本站自己写的提示文案）。
 * @param {string} message
 * @param {string} [hint]
 * @returns {string}
 */
export function errorState(message, hint = '') {
  return (
    '<div class="empty-state">' +
    '<span class="empty-icon">' +
    createIcon('alert', 24) +
    '</span>' +
    '<h3>内容加载失败</h3>' +
    '<p>' +
    escapeHtml(message || '请稍后再试。') +
    '</p>' +
    (hint ? '<p class="empty-hint">' + hint + '</p>' : '') +
    '</div>'
  );
}

/**
 * 空数据占位。
 * @param {string} title
 * @param {string} message
 * @returns {string}
 */
export function emptyState(title, message) {
  return (
    '<div class="empty-state">' +
    '<span class="empty-icon">' +
    createIcon('info', 24) +
    '</span>' +
    '<h3>' +
    escapeHtml(title) +
    '</h3>' +
    '<p>' +
    escapeHtml(message) +
    '</p>' +
    '</div>'
  );
}
