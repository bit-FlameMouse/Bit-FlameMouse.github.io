/**
 * 打字机效果：在若干短语之间循环打字与删除。
 */

/**
 * 创建一个打字机实例。
 * @param {HTMLElement|null} node 承载文字的节点
 * @param {string[]} phrases 轮播短语
 * @param {{ typeDelay?: number, deleteDelay?: number, holdDelay?: number }} [options]
 * @returns {{ start: () => void, stop: () => void }}
 */
export function createTypewriter(node, phrases, options = {}) {
  const { typeDelay = 110, deleteDelay = 55, holdDelay = 1800 } = options;

  /** @type {number|undefined} */
  let timer;
  let phraseIndex = 0;
  let charIndex = phrases[0]?.length ?? 0;
  let deleting = false;

  function stop() {
    window.clearTimeout(timer);
    timer = undefined;
  }

  function tick() {
    const current = phrases[phraseIndex] ?? '';
    if (!deleting) {
      charIndex += 1;
      node.textContent = current.slice(0, charIndex);
      if (charIndex >= current.length) {
        deleting = true;
        timer = window.setTimeout(tick, holdDelay);
        return;
      }
      timer = window.setTimeout(tick, typeDelay);
    } else {
      charIndex -= 1;
      node.textContent = current.slice(0, Math.max(0, charIndex));
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timer = window.setTimeout(tick, 320);
        return;
      }
      timer = window.setTimeout(tick, deleteDelay);
    }
  }

  function start() {
    stop();
    // 只有一句时无需轮播；尊重系统的"减少动态效果"偏好
    if (!node || phrases.length < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    timer = window.setTimeout(tick, holdDelay);
  }

  return { start, stop };
}
