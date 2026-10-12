/**
 * 简历视图。
 *
 * 页面结构与 assets/css/views/resume.css、assets/css/print.css 配套，
 * 点击"打印 / 存为 PDF"会走浏览器打印，打印样式里已隐藏导航与按钮。
 */

import { CONTENT } from '../data/content.js';
import { escapeHtml, $ } from '../utils/dom.js';
import { createIcon } from '../utils/icons.js';
import { copyWithFeedback } from '../utils/clipboard.js';
import { prettyUrl } from '../utils/format.js';
import { resolveAsset } from '../utils/paths.js';
import { externalAttrs } from '../ui/fragments.js';
import { routeHref } from '../core/router.js';
import { scanReveal } from '../effects/reveal.js';

/** 顶部联系方式行 */
function contactLine() {
  const { profile, links } = CONTENT;
  const parts = [];

  if (profile.location) parts.push(createIcon('map', 14) + escapeHtml(profile.location));
  if (profile.email) parts.push(createIcon('mail', 14) + escapeHtml(profile.email));

  links
    .filter((link) => link.url && link.url !== '#' && !link.url.startsWith('mailto:'))
    .forEach((link) => parts.push(createIcon(link.icon, 14) + escapeHtml(prettyUrl(link.url))));

  return parts.map((part) => '<span>' + part + '</span>').join('');
}

/** 技能汇总行 */
function skillsBlock() {
  if (!CONTENT.skills.length) return '';
  return (
    '<section class="resume-block">' +
    '<h2 class="resume-block-title">技能</h2>' +
    CONTENT.skills
      .map(
        (group) =>
          '<p class="resume-skill-row"><strong>' +
          escapeHtml(group.group) +
          '：</strong>' +
          escapeHtml(group.items.map((item) => item.name).join('、')) +
          '</p>',
      )
      .join('') +
    '</section>'
  );
}

/** 个人简介 */
function profileBlock() {
  return (
    '<section class="resume-block">' +
    '<h2 class="resume-block-title">个人简介</h2>' +
    CONTENT.about.paragraphs
      .map((text) => '<p class="resume-paragraph">' + escapeHtml(text) + '</p>')
      .join('') +
    '</section>'
  );
}

/** 经历与项目共用的条目结构 */
function resumeItem({ title, period, paragraphs = [], bullets = [], tech = [], links = [] }) {
  return (
    '<div class="resume-item">' +
    '<div class="resume-item-head">' +
    '<h3>' + title + '</h3>' +
    '<span class="resume-period">' + escapeHtml(period) + '</span>' +
    '</div>' +
    paragraphs.map((text) => '<p class="resume-paragraph">' + escapeHtml(text) + '</p>').join('') +
    (bullets.length
      ? '<ul class="bullet-list">' +
        bullets.map((text) => '<li>' + escapeHtml(text) + '</li>').join('') +
        '</ul>'
      : '') +
    (tech.length ? '<p class="resume-tech">技术：' + escapeHtml(tech.join(' · ')) + '</p>' : '') +
    links
      .map(
        (link) =>
          '<p class="resume-tech">' +
          escapeHtml(link.label) +
          '：<a href="' +
          escapeHtml(link.url) +
          '"' +
          externalAttrs(link.url) +
          '>' +
          escapeHtml(link.text) +
          '</a></p>',
      )
      .join('') +
    '</div>'
  );
}

/** 工作经历 */
function experienceBlock() {
  if (!CONTENT.experience.length) return '';
  return (
    '<section class="resume-block">' +
    '<h2 class="resume-block-title">实习 / 工作经历</h2>' +
    CONTENT.experience
      .map((item) =>
        resumeItem({
          title: escapeHtml(item.company) + ' · ' + escapeHtml(item.role),
          period: item.period + (item.location ? ' · ' + item.location : ''),
          paragraphs: item.summary ? [item.summary] : [],
          bullets: item.highlights ?? [],
          tech: item.tech ?? [],
        }),
      )
      .join('') +
    '</section>'
  );
}

/** 项目经历 */
function projectsBlock() {
  if (!CONTENT.projects.length) return '';
  return (
    '<section class="resume-block">' +
    '<h2 class="resume-block-title">项目经历</h2>' +
    CONTENT.projects
      .map((project) =>
        resumeItem({
          title: escapeHtml(project.name) + ' — ' + escapeHtml(project.tagline ?? ''),
          period: project.year ?? '',
          paragraphs: [project.summary ?? ''],
          tech: project.tech ?? [],
          links: project.repo
            ? [{ label: '仓库', url: project.repo, text: prettyUrl(project.repo) }]
            : [],
        }),
      )
      .join('') +
    '</section>'
  );
}

/** 教育经历 */
function educationBlock() {
  if (!CONTENT.education.length) return '';
  return (
    '<section class="resume-block">' +
    '<h2 class="resume-block-title">教育经历</h2>' +
    CONTENT.education
      .map((item) =>
        resumeItem({
          title: escapeHtml(item.school) + (item.major ? ' · ' + escapeHtml(item.major) : ''),
          period: item.period,
          paragraphs: [item.degree],
          bullets: item.details ?? [],
        }),
      )
      .join('') +
    '</section>'
  );
}

/**
 * 渲染简历页。
 * @param {HTMLElement} root
 */
export function renderResume(root) {
  const { site, profile } = CONTENT;

  const pdfButton = site.resumePdf
    ? '<a class="button button-primary" href="' +
      escapeHtml(resolveAsset(site.resumePdf)) +
      '" target="_blank" rel="noopener">' +
      createIcon('download', 16) +
      '<span>下载 PDF</span></a>'
    : '';

  root.innerHTML =
    '<div class="container resume-page">' +
    '<div class="resume-toolbar">' +
    '<a class="back-link" href="' + escapeHtml(routeHref('/')) + '">' +
    createIcon('arrow-left', 16) + '<span>返回首页</span></a>' +
    '<div class="resume-toolbar-actions">' +
    pdfButton +
    (profile.email
      ? '<button class="button button-ghost" type="button" data-copy-email data-label="复制邮箱">' +
        createIcon('copy', 16) + '<span>复制邮箱</span></button>'
      : '') +
    '<button class="button button-ghost" type="button" data-print>' +
    createIcon('file', 16) + '<span>打印 / 存为 PDF</span></button>' +
    '</div></div>' +
    '<article class="resume-sheet" data-reveal>' +
    '<header class="resume-head">' +
    '<div class="resume-identity">' +
    '<h1 class="resume-name">' + escapeHtml(profile.name) + '</h1>' +
    '<p class="resume-role">' + escapeHtml(profile.title) + '</p>' +
    '<p class="resume-tagline">' + escapeHtml(profile.tagline) + '</p>' +
    '</div>' +
    '<div class="resume-contact">' + contactLine() + '</div>' +
    '</header>' +
    profileBlock() +
    skillsBlock() +
    experienceBlock() +
    projectsBlock() +
    educationBlock() +
    '<footer class="resume-foot">本文档由个人网站 ' +
    escapeHtml(profile.name) +
    ' 自动生成，内容与网站保持一致。</footer>' +
    '</article></div>';

  bindResumeActions(root);
  scanReveal(root);
  document.title = '简历 · ' + CONTENT.site.title;
}

/** 绑定打印与复制邮箱 */
function bindResumeActions(root) {
  $('[data-print]', root)?.addEventListener('click', () => window.print());

  const copyButton = $('[data-copy-email]', root);
  copyButton?.addEventListener('click', () => copyWithFeedback(CONTENT.profile.email, copyButton));
}
