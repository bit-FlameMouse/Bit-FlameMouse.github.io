/**
 * 站点外壳：顶部导航、移动端菜单、阅读进度条、返回顶部、页脚年份。
 *
 * 页头与页脚的静态结构直接写在 index.html 里（首屏即可见，
 * 并且在没有 JavaScript 时导航依然可用），这里只负责：
 *   - 注入依赖图标库的部分（社交按钮、主题开关、返回顶部）
 *   - 绑定交互（菜单开合、主题切换、锚点跳转）
 *   - 同步路由相关的状态（当前页面高亮、详情页紧凑模式）
 */

import { CONTENT } from '../data/content.js';
import { FOCUSED_ROUTES, ROUTE } from '../config/constants.js';
import { $, $$, debounce } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';
import { escapeHtml } from '../utils/dom.js';
import { externalAttrs } from '../ui/fragments.js';
import { toggleTheme } from './theme.js';
import { clearScrollSpy, headerHeight, refreshScrollSpy } from './scrollSpy.js';
import { navigate, routeHref } from './router.js';

/** @type {HTMLElement|null} */
let progressBar = null;

/* ------------------------------------------------------------------ 注入 */

/** 把社交图标按钮注入页头 */
function mountHeaderActions() {
  const host = $('[data-header-actions]');
  if (!host) return;

  const social = CONTENT.links
    .filter((link) => link.url && link.url !== '#')
    .slice(0, 3)
    .map(
      (link) =>
        '<a class="icon-button" href="' +
        escapeHtml(link.url) +
        '" title="' +
        escapeHtml(link.label) +
        '" aria-label="' +
        escapeHtml(link.label) +
        '"' +
        externalAttrs(link.url) +
        '>' +
        createIcon(link.icon, 18) +
        '</a>',
    )
    .join('');

  host.innerHTML =
    social +
    '<button class="icon-button theme-toggle" type="button" data-theme-toggle aria-label="切换深浅色主题" title="切换主题">' +
    '<span class="theme-icon theme-icon-sun">' +
    createIcon('sun', 18) +
    '</span>' +
    '<span class="theme-icon theme-icon-moon">' +
    createIcon('moon', 18) +
    '</span>' +
    '</button>' +
    '<button class="icon-button nav-toggle" type="button" data-nav-toggle aria-label="打开菜单" aria-expanded="false" aria-controls="site-nav">' +
    '<span class="nav-toggle-open">' +
    createIcon('menu', 20) +
    '</span>' +
    '<span class="nav-toggle-close">' +
    createIcon('x', 20) +
    '</span>' +
    '</button>';
}

/** 把社交链接注入页脚 */
function mountFooterSocial() {
  const host = $('[data-footer-social]');
  if (!host) return;

  host.innerHTML = CONTENT.links
    .map(
      (link) =>
        '<a class="footer-link" href="' +
        escapeHtml(link.url) +
        '"' +
        externalAttrs(link.url) +
        '>' +
        createIcon(link.icon, 16) +
        '<span>' +
        escapeHtml(link.label) +
        '</span></a>',
    )
    .join('');
}

/** 补上页脚年份与版权 */
function mountFooterMeta() {
  const copy = $('[data-footer-copy]');
  if (copy) {
    copy.innerHTML =
      '&copy; ' + new Date().getFullYear() + ' ' + escapeHtml(CONTENT.footer.copyright) + ' · 保留所有权利';
  }
}

/** 创建返回顶部按钮 */
function mountBackToTop() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'to-top';
  button.setAttribute('aria-label', '返回顶部');
  button.innerHTML = createIcon('arrow-up', 20);
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(button);
}

/* ------------------------------------------------------------- 交互逻辑 */

/** 关闭移动端菜单 */
export function closeMenu() {
  document.body.classList.remove('nav-open');
  $('[data-nav-toggle]')?.setAttribute('aria-expanded', 'false');
}

/** 开合移动端菜单 */
function toggleMenu() {
  const open = !document.body.classList.contains('nav-open');
  document.body.classList.toggle('nav-open', open);
  $('[data-nav-toggle]')?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/** 更新阅读进度条与返回顶部按钮的可见性 */
function updateProgress() {
  if (!progressBar) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max)) : 0;

  progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  if (progressBar.parentNode) {
    progressBar.parentNode.style.opacity = ratio > 0.005 ? '1' : '0';
  }
  document.body.classList.toggle('show-to-top', (window.scrollY || doc.scrollTop) > 600);
}

/**
 * 处理导航链接点击：
 *   - 目标在首页内且当前也在首页 → 平滑滚动，不触发路由
 *   - 当前在详情页 → 先回首页，等视图渲染后再滚动
 */
function handleNavClick(event) {
  const link = event.target.closest('a[data-nav]');
  if (!link) return;

  const anchor = link.dataset.nav;
  if (!anchor) return;

  event.preventDefault();
  closeMenu();

  if (window.location.hash === routeHref('/') || window.location.hash === '') {
    scrollToSection(anchor);
    return;
  }

  navigate('/');
  // 等待首页渲染完成再滚动
  window.setTimeout(() => scrollToSection(anchor), 60);
}

/**
 * 平滑滚动到首页某个区块。
 * @param {string} id
 */
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;
  window.scrollTo({ top, behavior: 'smooth' });
  window.history.replaceState(null, '', routeHref('/' + id));
}

/* --------------------------------------------------------------- 生命周期 */


/** 初始化外壳：注入动态部分、绑定全局事件 */
export function mountShell() {
  progressBar = $('[data-progress]');

  mountHeaderActions();
  mountFooterSocial();
  mountFooterMeta();
  mountBackToTop();

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-nav-toggle]')) {
      toggleMenu();
      return;
    }
    if (event.target.closest('[data-theme-toggle]')) {
      toggleTheme();
      return;
    }

    handleNavClick(event);

    // 点击菜单内任意链接、或点击菜单外部区域都收起菜单
    if (event.target.closest('a[href^="#/"]')) closeMenu();
    if (document.body.classList.contains('nav-open') && !event.target.closest('.site-header')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  let hasSections = false;
  // 滚动时刷新进度条与章节高亮（高亮只在首页存在章节时计算）
  const onScroll = debounce(() => {
    updateProgress();
    if (hasSections) refreshScrollSpy(headerHeight());
  }, 80);

  window.addEventListener(
    'scroll',
    () => {
      updateProgress();
      onScroll();
    },
    { passive: true },
  );

  window.addEventListener(
    'resize',
    debounce(() => {
      updateProgress();
      if (hasSections) refreshScrollSpy(headerHeight());
    }, 150),
  );

  // 记录首页是否存在章节，避免在详情页做无用计算
  new MutationObserver(() => {
    hasSections = refreshScrollSpy(headerHeight());
  }).observe(document.getElementById('app') ?? document.body, { childList: true });

  updateProgress();
}

/**
 * 路由切换后同步外壳状态。
 * @param {{ name: string }} route
 */
export function updateShell(route) {
  // 同步导航里的"页面"链接高亮
  $$('.nav-link-page').forEach((link) => {
    const matches = (link.dataset.navMatch ?? '').split(',').filter(Boolean);
    const active = matches.includes(route?.name);
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // 详情页隐藏顶部导航，让读者专注
  document.body.classList.toggle('is-detail', FOCUSED_ROUTES.includes(route?.name ?? ROUTE.HOME));

  closeMenu();

  if (!refreshScrollSpy(headerHeight()) && route?.name === ROUTE.HOME) {
    clearScrollSpy();
  }
}

/** 滚动到页面顶部 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'auto' });
}
