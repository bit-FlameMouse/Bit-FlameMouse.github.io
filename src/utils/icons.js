/**
 * 图标渲染。
 *
 * 从图标库取出路径片段，包成统一的 <svg> 结构。
 * 使用 currentColor 描边，因此图标颜色跟随文字颜色，深浅主题自动适配。
 */

import { ICON_PATHS } from '../data/icons.js';
import { escapeHtml } from './dom.js';

/**
 * 生成一个内联 SVG 图标。
 * @param {string} name  图标名，见 ICON_PATHS；未知名会退化为通用链接图标
 * @param {number} [size=18] 边长（px）
 * @returns {string} SVG 字符串
 */
export function createIcon(name, size = 18) {
  const path = ICON_PATHS[name] ?? ICON_PATHS.link;
  return (
    '<svg class="icon icon-' +
    escapeHtml(name) +
    '" viewBox="0 0 24 24" width="' +
    size +
    '" height="' +
    size +
    '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"' +
    ' stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    path +
    '</svg>'
  );
}
