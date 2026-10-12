/**
 * 首页视图：首屏 / 数据统计 / 关于 / 技能 / 项目 / 经历 / 教育 / 文档 / 联系。
 */

import { CONTENT } from '../data/content.js';
import { escapeHtml, $$ } from '../utils/dom.js';
import { initials } from '../utils/format.js';
import { resolveAsset } from '../utils/paths.js';
import { createIcon } from '../utils/icons.js';
import { copyWithFeedback } from '../utils/clipboard.js';
import { externalAttrs, tagList } from '../ui/fragments.js';
import { docPreviewSection, projectCard } from '../ui/cards.js';
import { createTypewriter } from '../effects/typewriter.js';
import { scanReveal } from '../effects/reveal.js';
import { scrollToSection } from '../core/shell.js';

/** 首页可锚点跳转的区块 id（与 content.js 的 nav 对应） */
const SECTION_IDS = ['about', 'skills', 'projects', 'experience', 'education', 'docs', 'contact'];

/** @type {ReturnType<typeof createTypewriter>|null} */
let typewriter = null;

/* ------------------------------------------------------------------ 片段 */

/** 头像：有配置就显示图片，否则显示姓名首字 */
function avatarMarkup() {
  const { avatar } = CONTENT.site;

  if (!avatar) {
    return (
      '<div class="avatar avatar-fallback">' +
      '<span class="avatar-initials" aria-hidden="true">' +
      escapeHtml(initials(CONTENT.profile.name)) +
      '</span></div>'
    );
  }

  return (
    '<div class="avatar">' +
    '<img src="' +
    escapeHtml(resolveAsset(avatar)) +
    '" alt="' +
    escapeHtml(CONTENT.profile.name) +
    ' 的头像" width="220" height="220">' +
    '</div>'
  );
}

/** 首屏 */
function heroSection() {
  const { profile, hero, links } = CONTENT;

  const roleLine = hero.roles.length
    ? '<p class="hero-role" data-reveal data-reveal-delay="120">' +
      '<span class="hero-role-prefix">' +
      escapeHtml(hero.greeting) +
      '</span>' +
      '<span class="typewriter" data-typewriter>' +
      escapeHtml(hero.roles[0]) +
      '</span>' +
      '<span class="caret" aria-hidden="true"></span></p>'
    : '';

  const actions = hero.actions
    .map(
      (action) =>
        '<a class="button button-' +
        escapeHtml(action.style) +
        ' " href="' +
        escapeHtml(action.href) +
        '" data-cta="' +
        escapeHtml(action.href) +
        '">' +
        createIcon(action.icon, 16) +
        '<span>' +
        escapeHtml(action.label) +
        '</span></a>',
    )
    .join('');

  const chips = links
    .map(
      (link) =>
        '<a class="chip chip-link" href="' +
        escapeHtml(link.url) +
        '"' +
        externalAttrs(link.url) +
        '>' +
        createIcon(link.icon, 16) +
        '<span>' +
        escapeHtml(link.label) +
        '</span></a>',
    )
    .join('');

  return (
    '<section class="hero" id="top" data-section>' +
    '<div class="container hero-inner">' +
    '<div class="hero-copy">' +
    (profile.status
      ? '<p class="status-pill" data-reveal><span class="pulse" aria-hidden="true"></span>' +
        escapeHtml(profile.status) +
        '</p>'
      : '') +
    '<h1 class="hero-title" data-reveal data-reveal-delay="60">' +
    escapeHtml(profile.name) +
    '<span class="hero-title-sub">' +
    escapeHtml(profile.title) +
    '</span></h1>' +
    roleLine +
    '<p class="hero-tagline" data-reveal data-reveal-delay="180">' +
    escapeHtml(profile.tagline) +
    '</p>' +
    '<div class="hero-actions" data-reveal data-reveal-delay="240">' +
    actions +
    '</div>' +
    '<div class="hero-chips" data-reveal data-reveal-delay="300">' +
    chips +
    '</div>' +
    (profile.location
      ? '<p class="hero-meta" data-reveal data-reveal-delay="340">' +
        createIcon('map', 15) +
        '<span>' +
        escapeHtml(profile.location) +
        '</span></p>'
      : '') +
    '</div>' +
    '<div class="hero-aside" data-reveal data-reveal-delay="160">' +
    avatarMarkup() +
    '</div>' +
    '</div></section>'
  );
}

/** 数字统计 */
function statsSection() {
  if (!CONTENT.stats.length) return '';
  return (
    '<section class="section section-compact" id="stats" data-section aria-label="数据概览">' +
    '<ul class="stat-grid">' +
    CONTENT.stats
      .map(
        (stat, index) =>
          '<li class="stat-card" data-reveal data-reveal-delay="' +
          index * 70 +
          '"><strong class="stat-value">' +
          escapeHtml(stat.value) +
          '</strong><span class="stat-label">' +
          escapeHtml(stat.label) +
          '</span></li>',
      )
      .join('') +
    '</ul></section>'
  );
}

/** 关于我 */
function aboutSection() {
  const { about } = CONTENT;
  return (
    '<section class="section" id="about" data-section>' +
    '<div class="container">' +
    '<header class="section-head">' +
    '<p class="eyebrow">About</p>' +
    '<h2 class="section-title">关于我</h2>' +
    '</header>' +
    '<div class="about-grid">' +
    '<div class="about-copy" data-reveal">' +
    about.paragraphs.map((text) => '<p>' + escapeHtml(text) + '</p>').join('') +
    '</div>' +
    '<ul class="fact-list">' +
    about.facts
      .map(
        (fact, index) =>
          '<li class="fact" data-reveal data-reveal-delay="' +
          index * 60 +
          '"><span class="fact-label">' +
          escapeHtml(fact.label) +
          '</span><span class="fact-value">' +
          escapeHtml(fact.value) +
          '</span></li>',
      )
      .join('') +
    '</ul></div></div></section>'
  );
}

/** 技能栈 */
function skillsSection() {
  if (!CONTENT.skills.length) return '';
  return (
    '<section class="section section-alt" id="skills" data-section>' +
    '<div class="container">' +
    '<header class="section-head">' +
    '<p class="eyebrow">Skills</p>' +
    '<h2 class="section-title">技能栈</h2>' +
    '<p class="section-desc">用得到的技术，以及大致的熟练度。</p>' +
    '</header>' +
    '<div class="skill-grid">' +
    CONTENT.skills
      .map(
        (group, groupIndex) =>
          '<article class="card skill-card" data-reveal data-reveal-delay="' +
          groupIndex * 90 +
          '">' +
          '<header class="card-head">' +
          '<span class="card-icon">' +
          createIcon(group.icon, 18) +
          '</span>' +
          '<h3 class="card-title">' +
          escapeHtml(group.group) +
          '</h3>' +
          '</header>' +
          skillListMarkup(group.items) +
          '</article>',
      )
      .join('') +
    '</div></div></section>'
  );
}

/**
 * 技能分组内部的进度条列表。
 * @param {{ name: string, level: number }[]} items
 */
function skillListMarkup(items) {
  return (
    '<ul class="skill-list">' +
    items
      .map((item) => {
        const level = Math.max(0, Math.min(100, Number(item.level) || 0));
        return (
          '<li class="skill-item">' +
          '<div class="skill-line"><span class="skill-name">' +
          escapeHtml(item.name) +
          '</span><span class="skill-level">' +
          level +
          '%</span></div>' +
          '<div class="skill-track" role="progressbar" aria-label="' +
          escapeHtml(item.name) +
          '" aria-valuenow="' +
          level +
          '" aria-valuemin="0" aria-valuemax="100">' +
          '<span class="skill-fill" style="--level:' +
          level +
          '%"></span></div></li>'
        );
      })
      .join('') +
    '</ul>'
  );
}

/** 项目作品 */
function projectsSection() {
  if (!CONTENT.projects.length) return '';
  return (
    '<section class="section" id="projects" data-section>' +
    '<div class="container">' +
    '<header class="section-head">' +
    '<p class="eyebrow">Projects</p>' +
    '<h2 class="section-title">项目作品</h2>' +
    '<p class="section-desc">点开任意一张卡片，可以看这个项目的完整说明文档。</p>' +
    '</header>' +
    '<div class="project-grid">' +
    CONTENT.projects.map((project, index) => projectCard(project, index)).join('') +
    '</div></div></section>'
  );
}

/** 经历时间线 */
function experienceSection() {
  if (!CONTENT.experience.length) return '';
  return (
    '<section class="section section-alt" id="experience" data-section>' +
    '<div class="container">' +
    '<header class="section-head">' +
    '<p class="eyebrow">Experience</p>' +
    '<h2 class="section-title">经历</h2>' +
    '</header>' +
    '<ol class="timeline">' +
    CONTENT.experience
      .map(
        (item, index) =>
          '<li class="timeline-item" data-reveal data-reveal-delay="' +
          index * 80 +
          '">' +
          '<span class="timeline-dot" aria-hidden="true"></span>' +
          '<div class="timeline-card">' +
          '<div class="timeline-top">' +
          '<h3 class="timeline-role">' +
          escapeHtml(item.role) +
          '</h3>' +
          '<span class="timeline-period">' +
          createIcon('calendar', 14) +
          escapeHtml(item.period) +
          '</span></div>' +
          '<p class="timeline-company">' +
          escapeHtml(item.company) +
          (item.location ? ' · ' + escapeHtml(item.location) : '') +
          '</p>' +
          (item.summary ? '<p class="timeline-summary">' + escapeHtml(item.summary) + '</p>' : '') +
          bulletList(item.highlights) +
          tagList(item.tech) +
          '</div></li>',
      )
      .join('') +
    '</ol></div></section>'
  );
}

/** 教育经历 */
function educationSection() {
  if (!CONTENT.education.length) return '';
  return (
    '<section class="section" id="education" data-section>' +
    '<div class="container">' +
    '<header class="section-head">' +
    '<p class="eyebrow">Education</p>' +
    '<h2 class="section-title">教育经历</h2>' +
    '</header>' +
    '<div class="edu-grid">' +
    CONTENT.education
      .map(
        (item, index) =>
          '<article class="card edu-card" data-reveal data-reveal-delay="' +
          index * 80 +
          '">' +
          '<header class="card-head">' +
          '<span class="card-icon">' +
          createIcon('book', 18) +
          '</span>' +
          '<div><h3 class="card-title">' +
          escapeHtml(item.school) +
          '</h3><p class="card-sub">' +
          escapeHtml(item.degree) +
          (item.major ? ' · ' + escapeHtml(item.major) : '') +
          '</p></div></header>' +
          '<p class="edu-period">' +
          createIcon('calendar', 14) +
          escapeHtml(item.period) +
          '</p>' +
          bulletList(item.details) +
          '</article>',
      )
      .join('') +
    '</div></div></section>'
  );
}

/** 联系面板 */
function contactSection() {
  const { profile, links } = CONTENT;

  const items = links
    .map((link) => {
      const isMail = link.url.startsWith('mailto:');
      const detail = isMail ? profile.email : link.url.replace(/^https?:\/\//, '');
      return (
        '<a class="contact-link" href="' +
        escapeHtml(link.url) +
        '"' +
        externalAttrs(link.url) +
        '>' +
        '<span class="contact-icon">' +
        createIcon(link.icon, 20) +
        '</span>' +
        '<span class="contact-text"><strong>' +
        escapeHtml(link.label) +
        '</strong><small>' +
        escapeHtml(detail) +
        '</small></span>' +
        createIcon('arrow-right', 16) +
        '</a>'
      );
    })
    .join('');

  return (
    '<section class="section" id="contact" data-section>' +
    '<div class="container">' +
    '<div class="contact-panel" data-reveal>' +
    '<div class="contact-copy">' +
    '<p class="eyebrow">Contact</p>' +
    '<h2 class="section-title">来聊聊</h2>' +
    '<p class="section-desc">无论是项目合作、技术问题，还是只有一句反馈，都欢迎直接联系我。</p>' +
    (profile.email
      ? '<div class="email-row"><code class="email-text">' +
        escapeHtml(profile.email) +
        '</code>' +
        '<button class="button button-ghost button-sm" type="button" data-copy-email data-label="复制">' +
        createIcon('copy', 15) +
        '<span>复制</span></button></div>'
      : '') +
    '</div>' +
    '<div class="contact-list">' +
    items +
    '</div></div></div></section>'
  );
}

/**
 * 项目要点列表。
 * @param {string[]} [items]
 */
function bulletList(items = []) {
  if (!items.length) return '';
  return (
    '<ul class="bullet-list">' +
    items.map((text) => '<li>' + escapeHtml(text) + '</li>').join('') +
    '</ul>'
  );
}

/* ------------------------------------------------------------------ 渲染 */

/**
 * 渲染首页。
 * @param {HTMLElement} root 应用根节点
 */
export function renderHome(root) {
  root.innerHTML =
    heroSection() +
    statsSection() +
    aboutSection() +
    skillsSection() +
    projectsSection() +
    experienceSection() +
    educationSection() +
    docPreviewSection() +
    contactSection();

  scanReveal(root);
  bindHomeEvents(root);

  const target = root.querySelector('[data-typewriter]');
  typewriter = createTypewriter(target, CONTENT.hero.roles);
  typewriter.start();
}

/** 绑定首页内的事件（锚点滚动、复制邮箱） */
function bindHomeEvents(root) {
  // 首屏按钮：指向区块的直接平滑滚动，指向路由的交给 hashchange
  $$('[data-cta]', root).forEach((link) => {
    const target = link.dataset.cta;
    if (!target.startsWith('#') || target.startsWith('#/')) return;
    const id = target.slice(1);
    if (!SECTION_IDS.includes(id)) return;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToSection(id);
    });
  });

  const copyButton = root.querySelector('[data-copy-email]');
  if (copyButton) {
    copyButton.addEventListener('click', () => copyWithFeedback(CONTENT.profile.email, copyButton));
  }
}

/** 离开首页时停止动画 */
export function destroyHome() {
  typewriter?.stop();
  typewriter = null;
}

/** 页面标题 */
export function homeTitle() {
  return CONTENT.site.title + ' · ' + CONTENT.site.titleSuffix;
}
