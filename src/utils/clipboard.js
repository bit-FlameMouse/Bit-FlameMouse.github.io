/**
 * 剪贴板复制。优先使用异步 Clipboard API，不可用时回退到 execCommand。
 */

/**
 * 复制文本到剪贴板。
 * @param {string} text
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyText(text) {
  const value = String(text ?? '');
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* 继续走降级方案 */
    }
  }
  return legacyCopy(value);
}

/**
 * 旧浏览器 / 非安全上下文下的复制方案。
 * @param {string} text
 * @returns {boolean}
 */
function legacyCopy(text) {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * 复制文本，并在按钮上给出短暂的"已复制"反馈。
 * @param {string} text
 * @param {HTMLElement|null} [button]
 * @param {{ doneText?: string, resetDelay?: number }} [options]
 */
export async function copyWithFeedback(text, button, options = {}) {
  const { doneText = '已复制', resetDelay = 1600 } = options;
  const ok = await copyText(text);
  if (!ok || !button) return ok;

  const original = button.dataset.label ?? button.textContent;
  button.dataset.label = original;
  button.textContent = doneText;
  button.classList.add('is-copied');
  window.setTimeout(() => {
    button.textContent = button.dataset.label;
    button.classList.remove('is-copied');
  }, resetDelay);
  return true;
}
