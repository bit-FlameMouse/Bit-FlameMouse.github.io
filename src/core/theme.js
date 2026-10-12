/**
 * 主题（深浅色）管理。
 *
 * 优先级：用户手动选择 > content.js 的 site.theme > 系统偏好。
 * 手动选择会写入 localStorage，下次访问直接生效；
 * index.html 里还有一段等效的防闪烁脚本，在样式加载前就把 data-theme 定下来。
 */

import { THEME, THEME_STORAGE_KEY } from '../config/constants.js';
import { readLocal, writeLocal } from '../utils/storage.js';

/** @type {Set<(mode: string) => void>} */
const listeners = new Set();

/** @returns {'light'|'dark'} */
export function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? THEME.DARK : THEME.LIGHT;
}

/** 用户手动选择的主题，未选择时返回 null */
export function storedTheme() {
  const value = readLocal('theme');
  return value === THEME.LIGHT || value === THEME.DARK ? value : null;
}

/** 当前实际生效的主题 */
export function currentTheme() {
  return storedTheme() ?? systemTheme();
}

/**
 * 把主题写到 <html data-theme>，并同步浏览器地址栏配色。
 * @param {'light'|'dark'} mode
 */
export function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-theme-source', storedTheme() ? 'manual' : 'system');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }
  listeners.forEach((listener) => listener(mode));
}

/** 在浅色 / 深色之间切换并记住选择 */
export function toggleTheme() {
  const next = currentTheme() === THEME.DARK ? THEME.LIGHT : THEME.DARK;
  writeLocal('theme', next);
  applyTheme(next);
  return next;
}

/**
 * 订阅主题变化。
 * @param {(mode: string) => void} listener
 * @returns {() => void} 取消订阅
 */
export function onThemeChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * 依据站点配置与系统偏好做初始化，只在启动时调用一次。
 * @param {{ theme?: string }} [siteConfig]
 */
export function initTheme(siteConfig = {}) {
  const stored = storedTheme();
  if (!stored && (siteConfig.theme === THEME.LIGHT || siteConfig.theme === THEME.DARK)) {
    applyTheme(siteConfig.theme);
  } else {
    applyTheme(document.documentElement.getAttribute('data-theme') || currentTheme());
  }

  // 用户未手动选择时跟随系统变化
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (!storedTheme()) applyTheme(systemTheme());
  });
}
