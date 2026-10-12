/**
 * 项目详情页。
 */

import { CONTENT, findProject } from '../data/content.js';
import { escapeHtml } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';
import { linkButton, metricRow, tagList } from '../ui/fragments.js';
import { emptyPage, detailShell } from '../ui/shells.js';
import { loadMarkdown } from '../markdown/loader.js';
import { routeHref } from '../core/router.js';
import { scanReveal } from '../effects/reveal.js';

/** 项目元信息小标签 */
function metaChips(projectData) {
  const chips = [];
  if (projectData.category) chips.push({ icon: 'layers', text: projectData.category });
  if (projectData.year) chips.push({ icon: 'calendar', text: projectData.year });
  if (projectData.repo) chips.push({ icon: 'github', text: 'GitHub 仓库' });

  return chips
    .map(
      (chip) =>
        '<span class="meta-chip">' + createIcon(chip.icon, 14) + escapeHtml(chip.text) + '</span>',
    )
    .join('');
}

/** 摘要面板：即使 Markdown 加载失败也能看到项目要点 */
function summaryPanel(projectData) {
  return (
    '<div class="project-summary-panel">' +
    '<p class="project-lead">' + escapeHtml(projectData.tagline ?? '') + '</p>' +
    (projectData.summary ? '<p>' + escapeHtml(projectData.summary) + '</p>' : '') +
    metricRow(projectData.metrics ?? [], true) +
    tagList(projectData.tech) +
    '</div>'
  );
}

/** 文末的"下一个项目"导航，让浏览可以连续进行 */
function nextProjectNav(currentId) {
  const list = CONTENT.projects;
  if (list.length < 2) return '';

  const index = list.findIndex((item) => item.id === currentId);
  if (index === -1) return '';

  const next = list[(index + 1) % list.length];
  return (
    '<nav class="next-nav" aria-label="项目导航">' +
    '<span class="next-label">下一个项目</span>' +
    '<a class="next-link" href="' +
    escapeHtml(routeHref('/project/' + next.id)) +
    '">' +
    '<span><strong>' +
    escapeHtml(next.name) +
    '</strong><small>' +
    escapeHtml(next.tagline ?? '') +
    '</small></span>' +
    createIcon('arrow-right', 18) +
    '</a></nav>'
  );
}

/**
 * 渲染项目详情页。
 * @param {HTMLElement} root
 * @param {string} id
 */
export async function renderProject(root, id) {
  const project = findProject(id);

  if (!project) {
    root.innerHTML = emptyPage({
      title: '找不到这个项目',
      description:
        '链接里的项目标识（<code>' +
        escapeHtml(id) +
        '</code>）在 content.js 的 projects 列表里不存在。',
      actions:
        '<a class="button button-primary" href="' +
        escapeHtml(routeHref('/')) +
        '">' +
        createIcon('arrow-left', 16) +
        '<span>回到首页</span></a>',
    });
    scanReveal(root);
    return;
  }

  root.innerHTML = detailShell({
    backHref: routeHref('/'),
    backLabel: '返回项目列表',
    eyebrow: project.category ?? '项目',
    title: project.name,
    meta: metaChips(project),
    actions:
      linkButton(project.repo, '查看源码', 'github', 'primary') +
      linkButton(project.demo, '在线预览', 'external-link'),
    loadingText: '正在读取项目文档…',
  });

  const body = root.querySelector('[data-md-body]');
  body.insertAdjacentHTML('beforebegin', summaryPanel(project));

  const text = await loadMarkdown(project.body, body);
  scanReveal(root);

  if (text) {
    root.querySelector('[data-detail]')?.insertAdjacentHTML('beforeend', nextProjectNav(project.id));
  }

  document.title = project.name + ' · ' + CONTENT.site.title;
}
