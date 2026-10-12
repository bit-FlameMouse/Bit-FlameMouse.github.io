/**
 * localStorage 安全读写。
 *
 * 浏览器在隐私模式或禁用存储时会抛异常，这里统一吞掉并降级，
 * 避免因为"记住主题"这种非关键功能导致整站脚本中断。
 */

import { STORAGE_PREFIX } from '../config/constants.js';

/**
 * @param {string} key 不含前缀的键名
 * @returns {string|null}
 */
export function readLocal(key) {
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}-${key}`);
  } catch {
    return null;
  }
}

/**
 * @param {string} key 不含前缀的键名
 * @param {string} value
 */
export function writeLocal(key, value) {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}-${key}`, value);
  } catch {
    /* 存储不可用时忽略 */
  }
}

/**
 * 读取布尔型偏好。
 * @param {string} key
 * @param {boolean} [fallback=false]
 * @returns {boolean}
 */
export function readFlag(key, fallback = false) {
  const value = readLocal(key);
  if (value === null) return fallback;
  return value === 'true' || value === '1';
}
