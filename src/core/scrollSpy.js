/**
 * 首页章节的滚动高亮（scroll spy）。
 *
 * 只有首页存在多个 <section data-section>，其余页面会清空所有高亮。
 * 计算方式：找出最后一个"顶部已经滚过导航栏高度"的章节；
 * 滚到页面底部时强制高亮最后一节。
 */

import { $, $$ } from '../utils/dom.js';

/** 当前高亮的章节 id，用于避免重复写 DOM */
let activeSection = '';

/** 首页章节区块是否能被找到 */
function sections() {
  return $$('main [data-section]');
}

/** 顶部导航里的锚点链接 */
function anchorLinks() {
  return $$('.nav-link[data-anchor]');
}

/**
 * 应用高亮状态。
 * @param {string} id
 */
function applyActive(id) {
  if (activeSection === id) return;
  activeSection = id;

  anchorLinks().forEach((link) => {
    const isActive = link.dataset.anchor === id;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

/** 清除所有高亮（进入非首页路由时调用） */
export function clearScrollSpy() {
  activeSection = '';
  anchorLinks().forEach((link) => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });
}

/**
 * 重新计算并应用高亮。
 * @param {number} [headerHeight=68] 顶部导航高度，用于计算偏移
 * @returns {boolean} 当前页面是否存在可高亮的章节
 */
export function refreshScrollSpy(headerHeight = 68) {
  const list = sections();
  if (!list.length) {
    clearScrollSpy();
    return false;
  }

  const offset = headerHeight + 24;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  let current = list[0].id;

  list.forEach((section) => {
    if (section.getBoundingClientRect().top + scrollY - offset <= scrollY) {
      current = section.id;
    }
  });

  if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    current = list[list.length - 1].id;
  }

  applyActive(current);
  return true;
}

/** 当前高亮的章节 id */
export function activeSectionId() {
  return activeSection;
}

/**
 * 取顶部导航的实际高度，作为滚动偏移量。
 * @returns {number}
 */
export function headerHeight() {
  return $('[data-header]')?.offsetHeight ?? 68;
}
