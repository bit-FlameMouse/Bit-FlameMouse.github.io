/**
 * 笔记来源判定与规范化。
 *
 * 一份笔记可能来自三种地方：
 *   1. 站内 Markdown（body）—— 由本站渲染，可被站内搜索，最稳定；
 *   2. 飞书等外部文档（url）—— 只提供入口，点开跳转；
 *   3. 两者都有 —— 页面渲染站内 Markdown，同时给出"查看原文"入口。
 *
 * 这里把上面三种情况统一成一个结构，避免各视图到处写 if/else。
 */

/**
 * @typedef {object} NoteSource
 * @property {string}  id          唯一标识
 * @property {'local'|'external'|'hybrid'} kind 来源形态
 * @property {string}  body        站内 Markdown 路径，外部笔记为空字符串
 * @property {string}  url         外部原文地址，没有则为空字符串
 * @property {string}  embedUrl    可用于 iframe 的预览地址，没有则为空字符串
 * @property {boolean} hasLocal    是否有站内正文
 * @property {boolean} hasExternal 是否有外部入口
 * @property {boolean} hasEmbed    是否配置了预览嵌入
 */

/**
 * 把一条笔记配置规范化成统一的来源结构。
 * @param {{ id: string, body?: string, url?: string, embedUrl?: string, embed?: boolean }} note
 * @returns {NoteSource}
 */
export function resolveNoteSource(note = {}) {
  const body = typeof note.body === 'string' ? note.body.trim() : '';
  // embed 为 true 时，把 url 当作嵌入地址；也可以单独指定 embedUrl
  const embedUrl = (note.embedUrl || (note.embed ? note.url : '') || '').trim();
  const url = (note.url || '').trim();

  const hasLocal = Boolean(body);
  const hasExternal = Boolean(url);
  const hasEmbed = Boolean(embedUrl);

  /** @type {NoteSource['kind']} */
  let kind = 'local';
  if (hasLocal && hasExternal) kind = 'hybrid';
  else if (!hasLocal && hasExternal) kind = 'external';

  return { id: note.id ?? '', kind, body, url, embedUrl, hasLocal, hasExternal, hasEmbed };
}

/**
 * 笔记列表的排序：有站内正文的排前面（读者能直接读），外部笔记排后面。
 * @param {NoteSource[]} sources
 */
export function sortByAvailability(sources) {
  const weight = { local: 0, hybrid: 1, external: 2 };
  return [...sources].sort((a, b) => weight[a.kind] - weight[b.kind]);
}
