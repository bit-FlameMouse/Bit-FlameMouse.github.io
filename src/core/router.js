/**
 * 极简 hash 路由。
 *
 * 地址形式：
 *   #/                     首页
 *   #/project/proj-maze    项目详情
 *   #/docs                 文档库
 *   #/docs/doc-site-guide  单篇文档
 *   #/resume               简历
 *
 * 直接打开 ?project=xxx 或 ?doc=xxx 形式的分享链接也能正确识别，
 * 并会被归一化成对应的 hash 地址。
 * 选 hash 而不是 History API，是因为 GitHub Pages 无法为子路径做服务端重写。
 */

import { ROUTE } from '../config/constants.js';

/** @typedef {{ name: string, param: string }} Route */

const ROUTE_PREFIX = '#/';

/** @type {Set<(route: Route) => void>} */
const listeners = new Set();

/**
 * 把任意路径拼成可写进 href 的 hash 地址。
 * @param {string} path 以 / 开头或不带斜杠，如 '/docs/doc-a'
 * @returns {string}
 */
export function routeHref(path) {
  const clean = String(path ?? '/');
  return ROUTE_PREFIX + (clean.startsWith('/') ? clean.slice(1) : clean);
}

/**
 * 解析当前地址。
 * @returns {Route}
 */
export function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '');

  if (!raw) {
    const search = window.location.search || '';
    const projectMatch = search.match(/[?&]project=([^&]+)/);
    const docMatch = search.match(/[?&]doc=([^&]+)/);
    if (projectMatch) return { name: ROUTE.PROJECT, param: decodeURIComponent(projectMatch[1]) };
    if (docMatch) return { name: ROUTE.DOC, param: decodeURIComponent(docMatch[1]) };
    return { name: ROUTE.HOME, param: '' };
  }

  const segments = raw.split('/').filter(Boolean).map(decodeURIComponent);
  if (!segments.length) return { name: ROUTE.HOME, param: '' };

  switch (segments[0]) {
    case 'project':
      return { name: ROUTE.PROJECT, param: segments[1] ?? '' };
    case 'docs':
    case 'doc':
      return segments[1] ? { name: ROUTE.DOC, param: segments[1] } : { name: ROUTE.DOCS, param: '' };
    case 'resume':
      return { name: ROUTE.RESUME, param: '' };
    case '404':
      return { name: ROUTE.NOT_FOUND, param: '' };
    default:
      return { name: ROUTE.NOT_FOUND, param: raw };
  }
}

/**
 * 跳转（写入 hash，因此进入浏览器历史，可前进后退）。
 * @param {string} path
 */
export function navigate(path) {
  const target = routeHref(path);
  if (window.location.hash === target) {
    emit();
    return;
  }
  window.location.hash = target;
}

/**
 * 订阅路由变化。
 * @param {(route: Route) => void} listener
 * @returns {() => void} 取消订阅
 */
export function onRouteChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  const route = parseRoute();
  listeners.forEach((listener) => {
    try {
      listener(route);
    } catch (error) {
      console.error('[router] 渲染出错', error);
    }
  });
}

/** 启动路由：归一化分享链接并监听 hashchange */
export function startRouter() {
  const route = parseRoute();
  const hasHash = Boolean(window.location.hash.replace(/^#\/?/, ''));
  if (!hasHash && (route.name === ROUTE.PROJECT || route.name === ROUTE.DOC)) {
    const normalized = route.name === ROUTE.PROJECT ? '/project/' + route.param : '/docs/' + route.param;
    window.history.replaceState(null, '', window.location.pathname + routeHref(normalized));
  }
  window.addEventListener('hashchange', emit);
  emit();
}
