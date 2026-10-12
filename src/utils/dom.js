/**
 * DOM 与字符串工具。
 */

/**
 * 转义 HTML 特殊字符。
 * 所有插入模板的动态文本都必须先经过这里，避免 XSS 与标签错乱。
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * querySelector 简写。
 * @param {string} selector
 * @param {ParentNode} [scope=document]
 * @returns {HTMLElement|null}
 */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * querySelectorAll 简写，返回真数组以便使用 filter / map。
 * @param {string} selector
 * @param {ParentNode} [scope=document]
 * @returns {HTMLElement[]}
 */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * 便捷地遍历 querySelectorAll 结果。
 * @param {string} selector
 * @param {(el: HTMLElement, index: number) => void} callback
 * @param {ParentNode} [scope=document]
 */
export function each(selector, callback, scope = document) {
  $$(selector, scope).forEach(callback);
}

/**
 * 用 HTML 字符串填充元素（仅用于本站自己的模板，不含用户输入）。
 * @param {HTMLElement|null} node
 * @param {string} html
 */
export function setHtml(node, html) {
  if (node) node.innerHTML = html;
}

/**
 * 防抖：在停止触发 wait 毫秒后执行一次。
 * @template {(...args: any[]) => void} F
 * @param {F} fn
 * @param {number} [wait=150]
 * @returns {F}
 */
export function debounce(fn, wait = 150) {
  /** @type {number|undefined} */
  let timer;
  return /** @type {F} */ (
    function debounced(...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), wait);
    }
  );
}
