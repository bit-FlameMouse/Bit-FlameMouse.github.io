/**
 * 路径解析。
 *
 * 站点部署在 GitHub Pages 的子路径（例如 /Bit-FlameMouse.github.io/）上，
 * 页面里的相对路径、模块的 import 都相对于各自文件位置解析，直接拼接会算错。
 * 统一通过 <base href="./"> 提供的 document.baseURI 解析，
 * 这样无论部署到根域名还是子路径、无论从哪个模块调用，结果都正确。
 */

/**
 * 解析站点内资源的绝对地址。
 * @param {string} relative 相对仓库根目录的路径，如 'assets/img/avatar.png'
 * @returns {string} 可直接用于 img src / a href / fetch 的绝对路径
 */
export function resolveAsset(relative) {
  const clean = String(relative ?? '').replace(/^\/+/, '');
  return new URL(clean, document.baseURI).href;
}

/**
 * 解析 Markdown 文档中的相对链接（图片、附件）。
 * 相对的是 Markdown 文件所在目录，所以要先与文档路径拼接再归一化。
 * @param {string} url      文档里写的路径，如 '../../assets/img/a.png'
 * @param {string} basePath Markdown 文件所在目录，如 'content/projects/'
 * @returns {string}
 */
export function resolveMarkdownUrl(url, basePath = '') {
  const raw = String(url ?? '').trim();
  if (!raw) return '';
  // 绝对地址、协议相对地址、页内锚点原样返回
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) return raw;

  const target = raw.startsWith('/') ? raw : basePath + raw;
  return resolveAsset(normalizePath(target));
}

/**
 * 归一化相对路径，消掉 '.' 与 '..' 段。
 * @param {string} path
 * @returns {string}
 */
export function normalizePath(path) {
  /** @type {string[]} */
  const segments = [];
  for (const segment of String(path).split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.join('/');
}
