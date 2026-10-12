/**
 * 数据格式化与展示辅助。
 */

/**
 * 把姓名转成头像占位文字：中文取首字，英文取前两个字母。
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  const text = String(name ?? '').trim();
  if (!text) return '?';
  if (/[\u4e00-\u9fa5]/.test(text[0])) return text.slice(0, 1);
  return text.slice(0, 2).toUpperCase();
}

/**
 * 把 '2025-01' / '2025.01' 之类的字符串格式化成中文可读日期。
 * @param {string} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '';
  const text = String(value).trim();
  const match = text.match(/^(\d{4})[-./](\d{1,2})/);
  if (!match) return text;
  return `${match[1]} 年 ${Number(match[2])} 月`;
}

/**
 * 把 URL 精简成适合展示的形式（去掉协议头）。
 * @param {string} url
 * @returns {string}
 */
export function prettyUrl(url) {
  return String(url ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/^mailto:/, '');
}

/**
 * 限制数值范围，用于技能熟练度等百分比。
 * @param {unknown} value
 * @param {number} [min=0]
 * @param {number} [max=100]
 * @returns {number}
 */
export function clampPercent(value, min = 0, max = 100) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
}
