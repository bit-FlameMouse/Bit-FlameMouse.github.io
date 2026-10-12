/**
 * 站点内容配置（唯一需要长期维护的数据文件）
 *
 * 使用方式
 *   1. 改文字 / 换项目 / 换链接，只改这个文件；
 *   2. 带 TODO 标记的字段是按 GitHub 用户名推出来的占位信息，请替换为真实内容；
 *   3. 项目详情与技术笔记的正文写在 content/ 目录下的 Markdown 文件里，本文件只放摘要与索引；
 *   4. 改完直接 git push，GitHub Pages 会自动部署，不需要编译。
 *
 * 字段速查
 *   site        站点标题 / SEO / 主题色 / 头像 / 简历 PDF
 *   profile     姓名、头衔、一句话简介、所在地、邮箱
 *   links       社交与联系方式
 *   nav         顶部导航（href 指向首页区块 id，或 #/ 开头的站内路由）
 *   hero        首屏文案、打字机身份轮播、行动按钮
 *   stats       首屏下方的数字统计
 *   about       关于我（段落 + 信息卡）
 *   skills      技能分组
 *   projects    项目列表（正文在 content/projects/）
 *   experience  工作 / 实习经历
 *   education   教育经历
 *   docs        Markdown 文档索引（正文在 content/docs/）
 *   footer      页脚
 */

export const CONTENT = Object.freeze({
  site: {
    title: '李辰麾',
    titleSuffix: '开发者主页',
    description: '李辰麾（Bit-FlameMouse）的个人网站：项目作品、技术笔记与简历。',
    keywords: ['李辰麾', 'Bit-FlameMouse', '个人网站', '开发者', '项目作品集', '简历'],
    lang: 'zh-CN',
    // 主色，会写入 CSS 变量 --accent，改一个色值即可整体换肤
    accent: '#6366f1',
    accent2: '#06b6d4',
    // 默认主题模式：'auto' 跟随系统 | 'light' | 'dark'（访客仍可手动切换并记住选择）
    theme: 'auto',
    // 头像：把图片放到 assets/img/avatar.png 后改为 'assets/img/avatar.png'，留空则显示姓名首字
    avatar: '',
    // 简历 PDF：把文件放到 assets/files/resume.pdf 后改为该路径，简历页会多出"下载 PDF"按钮
    resumePdf: '',
  },

  profile: {
    name: '李辰麾',
    handle: 'Bit-FlameMouse',
    // TODO 替换成你的真实头衔
    title: '软件开发者 / 全栈方向',
    tagline: '写代码，也写文档 —— 喜欢把复杂问题拆成清晰的模块。',
    location: '中国',
    // 状态徽章，不想显示就设为 ''
    status: '开放实习与协作机会',
    // TODO 替换成真实邮箱
    email: 'bit.flamemouse@example.com',
  },

  links: [
    // icon 可用：github / mail / blog / linkedin / twitter / zhihu / juejin / bilibili / wechat
    { label: 'GitHub', icon: 'github', url: 'https://github.com/Bit-FlameMouse' },
    { label: '邮箱', icon: 'mail', url: 'mailto:bit.flamemouse@example.com' },
    // TODO 有博客 / 掘金 / 知乎就把 url 换成真实地址，不需要就删掉整行
    { label: '博客', icon: 'blog', url: '#' },
  ],

  nav: [
    { label: '关于', href: '#about' },
    { label: '技能', href: '#skills' },
    { label: '项目', href: '#projects' },
    { label: '经历', href: '#experience' },
    { label: '文档', href: '#docs' },
    { label: '联系', href: '#contact' },
  ],

  hero: {
    greeting: '你好，我是',
    // 打字机轮播的身份，留空数组则只显示 title
    roles: ['软件开发者', '全栈工程师', '开源爱好者', '终身学习者'],
    actions: [
      { label: '查看项目', href: '#projects', style: 'primary', icon: 'grid' },
      { label: '下载简历', href: '#/resume', style: 'ghost', icon: 'file' },
    ],
  },

  stats: [
    { value: '6+', label: '项目作品' },
    { value: '8+', label: '技术栈' },
    { value: '2', label: '年编码经历' },
    { value: '100%', label: '文档覆盖率' },
  ],

  about: {
    paragraphs: [
      // TODO 换成你自己的故事，2~3 段最合适
      '我是一名关注工程实践与用户体验的开发者，喜欢从零把想法做成能跑起来的东西：从数据结构与算法，到前端界面与自动化脚本。',
      '在写代码之外，我也在意"可维护性"——清晰的目录结构、统一的命名、能让人一眼看懂的文档。这个网站本身就是这种习惯的练习：数据与展示分离，改内容不用碰样式。',
      '目前我在持续刷题与做小项目，欢迎通过邮件或 GitHub 与我交流。',
    ],
    facts: [
      { label: '昵称', value: 'Bit-FlameMouse' },
      { label: '方向', value: '全栈 / 工具链' },
      { label: '语言', value: 'TypeScript · Python · Java' },
      { label: '所在地', value: '中国' },
      { label: '状态', value: '开放实习与协作机会' },
    ],
  },

  skills: [
    {
      group: '编程语言',
      icon: 'code',
      items: [
        { name: 'TypeScript / JavaScript', level: 88 },
        { name: 'Python', level: 82 },
        { name: 'Java', level: 75 },
        { name: 'C / C++', level: 68 },
      ],
    },
    {
      group: '前端',
      icon: 'layout',
      items: [
        { name: 'HTML5 / CSS3', level: 90 },
        { name: '响应式与无障碍', level: 82 },
        { name: 'React / Vue', level: 72 },
        { name: '原生 Web API', level: 80 },
      ],
    },
    {
      group: '后端与工具',
      icon: 'server',
      items: [
        { name: 'Node.js / Express', level: 78 },
        { name: 'REST API 设计', level: 75 },
        { name: 'Git / GitHub Actions', level: 85 },
        { name: 'Linux / PowerShell', level: 74 },
      ],
    },
  ],

  /**
   * 项目列表。
   * id 会出现在网址里（#/project/<id>），建议保持英文小写与连字符。
   * body 指向仓库根目录下的 Markdown 文件。
   */
  projects: [
    {
      id: 'proj-maze',
      name: 'Maze Studio',
      category: '算法 / 可视化',
      featured: true,
      badge: '特色',
      year: '2025',
      tagline: '迷宫生成与寻路算法可视化实验台',
      summary:
        '把深度优先、Prim、Kruskal 等迷宫生成算法与 A*、BFS、Dijkstra 寻路过程实时画出来，帮助理解图论算法的实际差异。',
      tech: ['TypeScript', 'Canvas API', 'Vite', 'Vitest'],
      repo: 'https://github.com/Bit-FlameMouse',
      demo: '',
      body: 'content/projects/proj-maze.md',
      metrics: [
        { value: '7', label: '种算法' },
        { value: '60fps', label: '渲染帧率' },
        { value: '92%', label: '测试覆盖率' },
      ],
    },
    {
      id: 'proj-flame-tools',
      name: 'Flame Tools',
      category: '工程效率',
      featured: true,
      badge: '',
      year: '2025',
      tagline: '面向日常开发的命令行小工具集合',
      summary:
        '一个可扩展的 CLI 工具箱：批量重命名、文件去重、目录体积分析、编码转换。插件式命令注册，加一个文件就能加一条命令。',
      tech: ['Node.js', 'TypeScript', 'Commander', 'npm'],
      repo: 'https://github.com/Bit-FlameMouse',
      demo: '',
      body: 'content/projects/proj-flame-tools.md',
      metrics: [
        { value: '12', label: '个子命令' },
        { value: '<80ms', label: '冷启动' },
        { value: 'MIT', label: '开源协议' },
      ],
    },
    {
      id: 'proj-portfolio-site',
      name: '个人网站',
      category: '前端 / 静态站点',
      featured: true,
      badge: '你正在看',
      year: '2025',
      tagline: '零依赖的静态个人站，数据驱动 + Markdown 渲染',
      summary:
        '纯 HTML / CSS / JavaScript 实现的多路由单页应用：内容集中在 src/data/content.js，项目详情由站内的轻量 Markdown 渲染器生成，部署在 GitHub Pages。',
      tech: ['HTML5', 'CSS3', 'Vanilla JS', 'GitHub Pages'],
      repo: 'https://github.com/Bit-FlameMouse/Bit-FlameMouse.github.io',
      demo: '',
      body: 'content/projects/proj-portfolio-site.md',
      metrics: [
        { value: '0', label: '运行时依赖' },
        { value: '4', label: '个路由' },
        { value: '100', label: 'Lighthouse 目标' },
      ],
    },
    {
      id: 'proj-algo-notes',
      name: 'Algo Notes',
      category: '算法 / 笔记',
      featured: false,
      badge: '',
      year: '2024',
      tagline: '可复用的算法模板与题解笔记',
      summary:
        '把常见题型的模板代码整理成可直接引用的片段库，配详细注释与复杂度分析，附带单元测试验证边界条件。',
      tech: ['Python', 'pytest', 'Markdown'],
      repo: 'https://github.com/Bit-FlameMouse',
      demo: '',
      body: 'content/projects/proj-algo-notes.md',
      metrics: [
        { value: '150+', label: '道题解' },
        { value: '24', label: '类模板' },
      ],
    },
  ],

  experience: [
    {
      // TODO
      role: '前端开发实习生',
      company: '某某科技有限公司',
      period: '2025.07 — 2025.09',
      location: '远程',
      summary: '参与内部管理后台的组件库维护与页面重构。',
      highlights: [
        '把 6 个重复的业务表格抽象成一个可配置的通用组件，页面代码量下降约 40%。',
        '接入前端构建流水线，将打包时间从 3 分钟优化到 40 秒。',
        '补充组件文档与示例，团队新人上手时间明显缩短。',
      ],
      tech: ['TypeScript', 'React', 'Vite'],
    },
    {
      role: '校园技术团队成员',
      company: '某高校实验室 / 社团',
      period: '2024.09 — 2025.06',
      location: '校内',
      summary: '负责小型工具与活动网站的开发和维护。',
      highlights: [
        '独立完成活动报名系统的前后端，支撑 300+ 人次报名。',
        '编写自动化脚本处理数据导入导出，替代原本的人工表格整理。',
      ],
      tech: ['Node.js', 'MySQL', 'Git'],
    },
  ],

  education: [
    {
      // TODO
      school: '某某大学',
      degree: '工学学士',
      major: '计算机科学与技术',
      period: '2022.09 — 2026.06',
      details: ['主修：数据结构与算法、操作系统、计算机网络、数据库系统。', '绩点 / 排名：待补充。'],
    },
  ],

  /**
   * 笔记列表。每一条可以是三种来源形态之一：
   *   - 只有 body：站内 Markdown，由本站渲染（推荐，可被站内搜索、离线可读）
   *   - body + url：站内正文 + "查看原文"入口（推荐，兼顾飞书协作与站点可读性）
   *   - 只有 url：外部文档（如飞书），点开跳转原文；可加 embed: true 尝试站内预览
   * 详细做法见 content/docs/doc-feishu-notes.md
   */
  docs: [
    {
      id: 'doc-site-guide',
      title: '这个网站是怎么搭的',
      description: '目录结构、数据与展示分离的设计、如何新增一个项目或一篇文档。',
      category: '工程',
      updated: '2025-01',
      body: 'content/docs/doc-site-guide.md',
    },
    {
      id: 'doc-feishu-notes',
      title: '用飞书写笔记，怎么放进这个网站',
      description: '三种接入形态的取舍、导出 Markdown 的完整流程，以及预览嵌入的注意事项。',
      category: '工程',
      updated: '2025-02',
      body: 'content/docs/doc-feishu-notes.md',
      // 想让读者能跳去飞书看原文，就补一个 url；只想放链接则删掉上面的 body：
      // url: 'https://xxx.feishu.cn/docx/your-doc-token',
      // 想让站内尝试用 iframe 预览原文，再加上 embed: true（多数平台会拦截）
      // embed: true,
    },
    {
      id: 'doc-markdown-demo',
      title: 'Markdown 渲染效果示例',
      description: '标题、列表、表格、代码块、引用等各类语法的渲染样式预览。',
      category: '示例',
      updated: '2025-01',
      body: 'content/docs/doc-markdown-demo.md',
    },
  ],

  footer: {
    note: '用 HTML / CSS / JavaScript 手写，托管于 GitHub Pages。',
    copyright: '李辰麾',
  },
});

/** 按 id 查找项目，找不到返回 null */
export function findProject(id) {
  return CONTENT.projects.find((project) => project.id === id) ?? null;
}

/** 按 id 查找文档，找不到返回 null */
export function findDoc(id) {
  return CONTENT.docs.find((doc) => doc.id === id) ?? null;
}
