/**
 * 轻量 Markdown 渲染器（零依赖）。
 *
 * 支持：H1~H6（# 与 ===/---）、段落、粗体、斜体、行内代码、围栏代码块、
 *       有序/无序列表、任务清单、引用块、分割线、链接、图片、GFM 表格、自动链接。
 * 安全：文本统一先做 HTML 转义，再注入受控标签，文档里写 <script> 也不会被执行。
 *
 * 用法：
 *   import { render, toc } from '../markdown/renderer.js';
 *   const html = render(text, { basePath: 'content/projects/' });
 */

import { escapeHtml } from '../utils/dom.js';
import { resolveMarkdownUrl } from '../utils/paths.js';
var TICK = String.fromCharCode(96);        // 反引号，避免本文件自身被模板字符串干扰
var SENTINEL = '\u0000'; // 占位符定界符

/** 生成标题锚点 id（支持中文） */
function slugify(text, used) {
  var slug = String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  if (!slug) slug = 'section';
  if (!used) return slug;
  var candidate = slug;
  var index = 2;
  while (used[candidate]) {
    candidate = slug + '-' + index;
    index += 1;
  }
  used[candidate] = true;
  return candidate;
}

/* ------------------------------------------------------------ 行内解析 */
function inline(text, ctx) {
  var placeholders = [];
  function stash(html) {
    placeholders.push(html);
    return SENTINEL + (placeholders.length - 1) + SENTINEL;
  }

  var out = String(text);

  // 1. 行内代码（最先处理，内部不再解析）
  var codeRe = new RegExp(TICK + '+([\\s\\S]*?)' + TICK + '+', 'g');
  out = out.replace(codeRe, function (_m, code) {
    return stash('<code>' + escapeHtml(code.trim()) + '</code>');
  });

  // 2. 图片 ![alt](src "title")
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g, function (_m, alt, src, title) {
    return stash('<img src="' + escapeHtml(resolveMarkdownUrl(src, ctx.basePath)) + '" alt="' + escapeHtml(alt) + '"' +
      (title ? ' title="' + escapeHtml(title) + '"' : '') + ' loading="lazy">');
  });

  // 3. 链接 [text](href "title")
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g, function (_m, label, href, title) {
    var url = resolveMarkdownUrl(href, ctx.basePath);
    var external = /^https?:/i.test(url);
    return stash('<a href="' + escapeHtml(url) + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') +
      (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + inline(label, ctx) + '</a>');
  });

  // 4. 自动链接 http(s)://...
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<>()]+)/g, function (_m, prefix, url) {
    return prefix + stash('<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(url) + '</a>');
  });

  // 5. 转义剩余纯文本
  out = escapeHtml(out);

  // 6. 强调与删除线
  out = out
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])__([^_]+)__/g, '$1<strong>$2</strong>')
    .replace(/(^|[^_\w])_([^_\n]+)_(?![_\w])/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // 7. 行尾两个空格 => 硬换行
  out = out.replace(/ {2,}\n/g, '<br>\n');

  // 8. 还原占位符
  out = out.replace(new RegExp(SENTINEL + '(\\d+)' + SENTINEL, 'g'), function (_m, index) {
    return placeholders[Number(index)];
  });

  return out;
}

/* ------------------------------------------------------------ 表格辅助 */
function splitRow(row) {
  return row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (cell) {
    return cell.trim();
  });
}

function isSeparatorRow(row) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(row);
}

function alignmentsOf(row) {
  return splitRow(row).map(function (cell) {
    var left = cell.charAt(0) === ':';
    var right = cell.charAt(cell.length - 1) === ':';
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return '';
  });
}

/* ------------------------------------------------------------ 主解析器 */
/**
 * 把 Markdown 源码渲染成 HTML 字符串
 * @param {string} source            Markdown 文本
 * @param {{basePath?:string}} opts  basePath：文档内相对路径的基准目录
 */
function render(source, options) {
  var ctx = {
    basePath: (options && options.basePath) || '',
    usedSlugs: {},
    headings: []
  };

  var lines = String(source == null ? '' : source)
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .split('\n');

  var html = [];
  var i = 0;
  var fenceRe = new RegExp('^\\s*(' + TICK + '{3,}|~{3,})\\s*([^' + TICK + '~]*)$');
  var closeRe = new RegExp('^\\s*(' + TICK + '{3,}|~{3,})\\s*$');

  while (i < lines.length) {
    var line = lines[i];

    // --- 围栏代码块 -------------------------------------------------
    var fence = line.match(fenceRe);
    if (fence) {
      var marker = fence[1].charAt(0);
      var lang = (fence[2] || '').trim().split(/\s+/)[0];
      var codeLines = [];
      i += 1;
      while (i < lines.length) {
        var closing = lines[i].match(closeRe);
        if (closing && closing[1].charAt(0) === marker) { i += 1; break; }
        codeLines.push(lines[i]);
        i += 1;
      }
      html.push(
        '<div class="md-code" data-lang="' + escapeHtml(lang || 'text') + '">' +
          '<button class="md-copy" type="button" data-copy>复制</button>' +
          '<pre><code' + (lang ? ' class="language-' + escapeHtml(lang) + '"' : '') + '>' +
            escapeHtml(codeLines.join('\n')) +
          '</code></pre>' +
        '</div>'
      );
      continue;
    }

    // --- 空行 -------------------------------------------------------
    if (!line.trim()) { i += 1; continue; }

    // --- 分割线 -----------------------------------------------------
    if (/^\s*(?:\*\s*){3,}$/.test(line) || /^\s*(?:-\s*){3,}$/.test(line) || /^\s*(?:_\s*){3,}$/.test(line)) {
      html.push('<hr>');
      i += 1;
      continue;
    }

    // --- ATX 标题 ---------------------------------------------------
    var atx = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (atx) {
      var level = atx[1].length;
      var headingText = atx[2];
      var id = slugify(headingText.replace(/[*_&#39;]/g, '').split(TICK).join(''), ctx.usedSlugs);
      ctx.headings.push({ level: level, text: headingText.split(TICK).join(''), id: id });
      html.push(
        '<h' + level + ' id="' + escapeHtml(id) + '" class="md-h">' +
          '<a class="md-anchor" href="#' + escapeHtml(id) + '" aria-hidden="true">#</a>' +
          inline(headingText, ctx) +
        '</h' + level + '>'
      );
      i += 1;
      continue;
    }

    // --- Setext 标题（下一行是 === 或 ---） -------------------------
    if (i + 1 < lines.length && line.trim() && /^\s*(={3,}|-{3,})\s*$/.test(lines[i + 1])) {
      var setextLevel = lines[i + 1].trim().charAt(0) === '=' ? 1 : 2;
      var setextId = slugify(line.trim(), ctx.usedSlugs);
      ctx.headings.push({ level: setextLevel, text: line.trim(), id: setextId });
      html.push(
        '<h' + setextLevel + ' id="' + escapeHtml(setextId) + '" class="md-h">' +
          '<a class="md-anchor" href="#' + escapeHtml(setextId) + '" aria-hidden="true">#</a>' +
          inline(line.trim(), ctx) +
        '</h' + setextLevel + '>'
      );
      i += 2;
      continue;
    }

    // --- GFM 表格 ---------------------------------------------------
    if (line.indexOf('|') !== -1 && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      var header = splitRow(line);
      var aligns = alignmentsOf(lines[i + 1]);
      var rows = [];
      i += 2;
      while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      var table = '<div class="md-table-wrap"><table><thead><tr>';
      header.forEach(function (cell, index) {
        table += '<th' + (aligns[index] ? ' style="text-align:' + aligns[index] + '"' : '') + '>' + inline(cell, ctx) + '</th>';
      });
      table += '</tr></thead><tbody>';
      rows.forEach(function (row) {
        table += '<tr>';
        header.forEach(function (_cell, index) {
          table += '<td' + (aligns[index] ? ' style="text-align:' + aligns[index] + '"' : '') + '>' +
            inline(row[index] == null ? '' : row[index], ctx) + '</td>';
        });
        table += '</tr>';
      });
      table += '</tbody></table></div>';
      html.push(table);
      continue;
    }

    // --- 引用块 -----------------------------------------------------
    if (/^\s*>/.test(line)) {
      var quoteLines = [];
      while (i < lines.length && (/^\s*>/.test(lines[i]) || (quoteLines.length && lines[i].trim()))) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      html.push('<blockquote class="md-quote">' + render(quoteLines.join('\n'), { basePath: ctx.basePath }) + '</blockquote>');
      continue;
    }

    // --- 列表 -------------------------------------------------------
    var bullet = line.match(/^(\s*)([-*+])\s+(.*)$/);
    var ordered = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
    if (bullet || ordered) {
      var isOrdered = Boolean(ordered);
      var startNumber = isOrdered ? Number(ordered[2]) : 1;
      var items = [];
      while (i < lines.length) {
        var currentLine = lines[i];
        var b = currentLine.match(/^(\s*)([-*+])\s+(.*)$/);
        var o = currentLine.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
        var match = isOrdered ? o : b;
        if (match) {
          if ((match[1] || '').length >= 4) break;
          items.push(match[3]);
          i += 1;
        } else if (currentLine.trim() && /^\s{2,}/.test(currentLine) && items.length) {
          items[items.length - 1] += ' ' + currentLine.trim();
          i += 1;
        } else {
          break;
        }
      }
      var tag = isOrdered ? 'ol' : 'ul';
      var attr = isOrdered && startNumber !== 1 ? ' start="' + startNumber + '"' : '';
      var itemsHtml = items.map(function (item) {
        var task = item.match(/^\[( |x|X)\]\s+([\s\S]*)$/);
        if (task) {
          var done = task[1].toLowerCase() === 'x';
          return '<li class="md-task' + (done ? ' is-done' : '') + '">' +
            '<span class="md-check" aria-hidden="true">' + (done ? '&#10003;' : '') + '</span>' +
            inline(task[2], ctx) + '</li>';
        }
        return '<li>' + inline(item, ctx) + '</li>';
      }).join('');
      html.push('<' + tag + attr + ' class="md-list">' + itemsHtml + '</' + tag + '>');
      continue;
    }

    // --- 段落 -------------------------------------------------------
    var paragraph = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !fenceRe.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i]) &&
      !/^\s*(?:\*\s*){3,}$/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    html.push('<p>' + inline(paragraph.join('\n'), ctx) + '</p>');
  }

  return html.join('\n');
}

/** 抽取文档标题，生成目录数据 [{level,text,id}] */
function toc(source) {
  var used = {};
  var result = [];
  var lines = String(source == null ? '' : source).replace(/\r\n?/g, '\n').split('\n');
  var inFence = false;
  var fenceRe = new RegExp('^\\s*(' + TICK + '{3,}|~{3,})');
  for (var i = 0; i < lines.length; i += 1) {
    var line = lines[i];
    if (fenceRe.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    var atx = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (atx) {
      var text = atx[2].replace(/[*_\[\]]/g, '').split(TICK).join('').trim();
      result.push({ level: atx[1].length, text: text, id: slugify(atx[2], used) });
    }
  }
  return result;
}

export { render, toc };
