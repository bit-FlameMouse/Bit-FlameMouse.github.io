/**
 * 滚动入场动画。
 *
 * 关键约定：[data-reveal] 的初始隐藏样式由本模块在运行时添加（见 scanReveal 里的
 * 一次性标记），因此在没有 JavaScript 时内容依然完整可见，不会出现空白页。
 */

import { $$ } from '../utils/dom.js';

const REVEAL_READY_ATTR = 'data-reveal-ready';
let observer = null;

/** 浏览器是否支持 IntersectionObserver */
const supported = typeof IntersectionObserver === 'function';

/** 用户是否开启了"减少动态效果" */
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function ensureObserver() {
  if (observer || !supported) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  return observer;
}

/**
 * 为范围内所有 [data-reveal] 元素注册入场动画。
 * @param {ParentNode} [scope=document]
 */
export function scanReveal(scope = document) {
  const nodes = $$('[data-reveal]:not(.is-visible)', scope);
  if (!nodes.length) return;

  if (!supported || prefersReducedMotion()) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  // 首次扫描时才把"未进入视口先隐藏"的样式打开
  document.documentElement.setAttribute(REVEAL_READY_ATTR, 'true');

  const io = ensureObserver();
  nodes.forEach((node, index) => {
    const explicit = Number(node.dataset.revealDelay);
    const delay = Number.isNaN(explicit) ? Math.min(index * 60, 360) : explicit;
    node.style.setProperty('--reveal-delay', delay + 'ms');
    io.observe(node);
  });
}
