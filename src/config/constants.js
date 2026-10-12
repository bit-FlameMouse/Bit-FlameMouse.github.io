/**
 * 全局常量。
 *
 * 集中定义跨模块共享的固定值，避免魔法字符串散落在各处。
 */

/** 站点名称缩写，用于 localStorage 键名前缀 */
export const STORAGE_PREFIX = 'bfm';

/** 主题持久化的 localStorage 键名（index.html 的首屏防闪烁脚本也会读取它） */
export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}-theme`;

/** 主题枚举 */
export const THEME = Object.freeze({ LIGHT: 'light', DARK: 'dark', AUTO: 'auto' });

/** 站点路由名 */
export const ROUTE = Object.freeze({
  HOME: 'home',
  PROJECT: 'project',
  DOCS: 'docs',
  DOC: 'doc',
  RESUME: 'resume',
  NOT_FOUND: '404',
});

/** 首页里可供导航高亮与锚点跳转的区块 id */
export const HOME_SECTIONS = Object.freeze([
  'about',
  'skills',
  'projects',
  'experience',
  'education',
  'docs',
  'contact',
]);

/** 需要隐藏顶部导航、让读者专注阅读的路由 */
export const FOCUSED_ROUTES = Object.freeze([ROUTE.PROJECT, ROUTE.DOC, ROUTE.NOT_FOUND]);
