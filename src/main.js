/**
 * 应用入口。
 *
 * 职责边界：
 *   - 这里只做"装配"：初始化主题、启动路由、把路由分派给对应视图；
 *   - 具体页面长什么样由 src/views/* 决定；
 *   - 页头页脚等全局交互由 src/core/shell.js 负责。
 */

import { CONTENT } from './data/content.js';
import { ROUTE } from './config/constants.js';
import { $ } from './utils/dom.js';
import { initTheme } from './core/theme.js';
import { startRouter, onRouteChange, routeHref, parseRoute } from './core/router.js';
import { mountShell, scrollToSection, scrollToTop, updateShell } from './core/shell.js';
import { headerHeight, refreshScrollSpy } from './core/scrollSpy.js';
import { scanReveal } from './effects/reveal.js';
import { renderHome, destroyHome, homeTitle } from './views/home.js';
import { renderProject } from './views/project.js';
import { renderDoc, renderDocList } from './views/docs.js';
import { renderResume } from './views/resume.js';
import { renderNotFound } from './views/notfound.js';

/** 当前正在展示的视图名，用于在切换时释放上一个视图的资源 */
let currentView = '';

/** 判断是否由站内点击触发的路由变化（区分"点导航"与"直接输入地址"） */
let internalNavigation = false;

/* --------------------------------------------------------------- 元信息 */

/** 把 content.js 里的站点信息同步到 <head> */
function applyDocumentMeta() {
  document.documentElement.lang = CONTENT.site.lang;
  document.title = homeTitle();

  const setMeta = (selector, content) => {
    const node = document.querySelector(selector);
    if (node) node.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', CONTENT.site.description);
  setMeta('meta[name="keywords"]', CONTENT.site.keywords.join(','));
  setMeta('meta[name="author"]', CONTENT.profile.name);
  setMeta('meta[property="og:title"]', homeTitle());
  setMeta('meta[property="og:description"]', CONTENT.site.description);

  // 主色写进 CSS 变量，改 content.js 一个色值即可整体换肤
  const root = document.documentElement;
  if (CONTENT.site.accent) root.style.setProperty('--accent', CONTENT.site.accent);
  if (CONTENT.site.accent2) root.style.setProperty('--accent2', CONTENT.site.accent2);
}

/* --------------------------------------------------------------- 视图调度 */

/**
 * 记录当前视图，必要时释放上一个视图的资源。
 * @param {string} name
 */
function setView(name) {
  if (currentView === name) return;
  if (currentView === ROUTE.HOME) destroyHome();
  currentView = name;
  document.body.dataset.view = name;
}

/**
 * 路由处理器。
 * @param {{ name: string, param: string }} route
 */
async function handleRoute(route) {
  const root = $('#app');
  if (!root) return;

  switch (route.name) {
    case ROUTE.PROJECT:
      setView(ROUTE.PROJECT);
      await renderProject(root, route.param);
      scrollToTop();
      break;

    case ROUTE.DOCS:
      setView(ROUTE.DOCS);
      renderDocList(root);
      scrollToTop();
      break;

    case ROUTE.DOC:
      setView(ROUTE.DOC);
      await renderDoc(root, route.param);
      scrollToTop();
      break;

    case ROUTE.RESUME:
      setView(ROUTE.RESUME);
      renderResume(root);
      scrollToTop();
      break;

    case ROUTE.NOT_FOUND:
      setView(ROUTE.NOT_FOUND);
      renderNotFound(root, route.param);
      scrollToTop();
      break;

    case ROUTE.HOME:
    default:
      setView(ROUTE.HOME);
      renderHome(root);
      restoreHomeAnchor();
      break;
  }

  updateShell(route);
  scanReveal();
  internalNavigation = false;
}

/**
 * 首页支持 #about 这类"锚点即路由"的地址：
 * 直接打开或刷新时自动滚到对应区块。
 */
function restoreHomeAnchor() {
  const anchor = window.location.hash.replace(/^#\/?/, '');
  if (!anchor || !document.getElementById(anchor)) return;
  if (internalNavigation) return;

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: document.getElementById(anchor).getBoundingClientRect().top + window.scrollY - headerHeight() - 16,
      behavior: 'auto',
    });
  });
}

/* ------------------------------------------------------------------ 启动 */

function bootstrap() {
  if (!CONTENT) {
    console.error('[app] 站点内容未加载，请检查 src/data/content.js。');
    return;
  }

  applyDocumentMeta();
  initTheme(CONTENT.site);
  mountShell();

  // 标记站内点击，用于区分"用户点导航"与"直接刷新页面"
  document.addEventListener(
    'click',
    (event) => {
      if (event.target.closest('a[href^="#/"]')) internalNavigation = true;
    },
    true,
  );

  onRouteChange(handleRoute);
  startRouter();

  // 等字体 / 图片加载完成后校正一次滚动状态
  window.addEventListener('load', () => {
    refreshScrollSpy(headerHeight());
    scanReveal();
  });
  window.setTimeout(() => refreshScrollSpy(headerHeight()), 260);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}

export { bootstrap, handleRoute, routeHref, parseRoute, scrollToSection };
