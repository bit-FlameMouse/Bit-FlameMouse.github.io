# 李辰麾 · 个人网站

纯 **HTML + CSS + 原生 JavaScript** 实现的静态个人网站。零构建步骤、零运行时依赖、零第三方包，
模块用浏览器原生支持的 **ES Module** 组织，部署在 GitHub Pages 上。
项目作品与技术文档用 **Markdown** 编写，由站内自带的轻量渲染器即时渲染。

在线地址：https://bit-flamemouse.github.io/
架构说明：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 快速开始

```bash
npm run dev          # 启动内置的零依赖静态服务器，默认 http://localhost:8000
npm run dev -- 3000  # 指定端口

npm run verify       # 提交前做一次静态校验（资源引用、import、导出名、Markdown 路径）
```

> 也可以直接用 `python -m http.server 8000`，两者等价。
> **不要直接双击 index.html** —— file:// 协议下浏览器禁止 fetch，项目详情与技术文档会因为读不到 Markdown 而报错（页面会给出提示）。

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动本地预览服务器（scripts/serve.mjs，零依赖） |
| `npm run verify` | 静态校验，可当作 CI 门禁（scripts/verify.mjs，零依赖） |

`package.json` 里没有 `dependencies`，也不需要执行 `npm install`。

---

## 我该改哪个文件？

**绝大多数内容修改只需要动一个文件：`src/data/content.js`。**

| 我想做的事 | 改哪里 |
| --- | --- |
| 改姓名、头衔、邮箱、所在地、简介 | `src/data/content.js` → `profile` |
| 改首屏大标题、身份轮播、按钮 | `content.js` → `hero` |
| 改数字统计 | `content.js` → `stats` |
| 改「关于我」段落与信息卡 | `content.js` → `about` |
| 改技能与熟练度 | `content.js` → `skills` |
| **新增 / 修改项目** | `content.js` → `projects` **＋** 新建 `content/projects/xxx.md` |
| **新增 / 修改文档笔记** | `content.js` → `docs` **＋** 新建 `content/docs/xxx.md` |
| 改工作 / 教育经历 | `content.js` → `experience` / `education` |
| 换主题色 | `content.js` → `site.accent` / `site.accent2` |
| 加头像 | 图片放进 `public/img/`，把 `site.avatar` 设为该路径 |
| 加简历 PDF 下载按钮 | PDF 放进 `public/files/`，把 `site.resumePdf` 设为该路径 |
| 改导航菜单 | `content.js` → `nav`，同时更新 `index.html` 里的页头链接 |
| 改页脚 | `index.html` 的结构 + `content.js` 的 `footer` |
| 加一个图标 | `src/data/icons.js` 里加一个键值对 |
| 调配色、圆角、间距 | `src/styles/01-tokens.css` |

> `content.js` 里带 **TODO** 的地方是按 GitHub 用户名推出来的占位内容，请替换成真实信息。

### 新增一个项目（两步）

**第一步** — 在 `src/data/content.js` 的 `projects` 数组里追加：

```javascript
{
  id: 'proj-my-tool',                                  // 唯一标识 → 网址 #/project/proj-my-tool
  name: 'My Tool',
  category: '工程效率',
  featured: true,                                       // 首页是否重点展示
  badge: '新增',                                        // 卡片右上角小标签，不要就写 ''
  year: '2025',
  tagline: '一句话说明它做什么',
  summary: '两三句话的详细介绍，显示在卡片上。',
  tech: ['Node.js', 'TypeScript'],
  repo: 'https://github.com/Bit-FlameMouse/my-tool',    // 没有就写 ''
  demo: 'https://example.com',                          // 没有就写 ''
  body: 'content/projects/proj-my-tool.md',
  metrics: [                                            // 可选，卡片上的小数据
    { value: '12', label: '个子命令' },
  ],
}
```

**第二步** — 新建 `content/projects/proj-my-tool.md`，用 Markdown 写正文：

```markdown
# My Tool

> 一句话定位，以及为什么做它。**技术栈**：Node.js · TypeScript

## 它解决什么问题

## 核心功能 / 技术方案

## 数据与成果

## 遇到的坑

## 学到的东西
```

保存后刷新浏览器即可看到，**不需要编译**。

### 新增一篇文档

```javascript
{
  id: 'doc-my-note',
  title: '我的技术笔记',
  description: '一句摘要，显示在卡片上。',
  category: '前端',
  updated: '2025-03',
  body: 'content/docs/doc-my-note.md',
}
```

---

## 目录结构

```text
.
├── index.html                    # 唯一入口（静态页头页脚 + module script）
├── package.json                  # 元信息与 npm scripts（无 dependencies）
├── .editorconfig                 # 跨编辑器统一缩进与换行
├── .prettierrc.json              # 代码风格配置（可选工具）
├── .nojekyll                     # 让 GitHub Pages 跳过 Jekyll
│
├── scripts/                      # 工程脚本（只在本地 / CI 运行）
│   ├── serve.mjs                 # 零依赖静态服务器
│   └── verify.mjs                # 静态校验
│
├── docs/
│   └── ARCHITECTURE.md           # 架构设计说明
│
├── src/                          # 源码
│   ├── main.js                   # 入口：初始化 + 路由分派
│   ├── config/constants.js       # 跨模块常量
│   ├── data/                     # 纯数据，不含 DOM 操作
│   │   ├── content.js            # ★ 全站文案与配置
│   │   └── icons.js              # 内联 SVG 图标库
│   ├── utils/                    # 无副作用工具
│   │   ├── dom.js  paths.js  format.js  storage.js
│   │   ├── clipboard.js  icons.js  asyncState.js
│   ├── core/                     # 应用基础设施
│   │   ├── router.js  theme.js  shell.js  scrollSpy.js
│   ├── markdown/                 # Markdown 能力
│   │   ├── renderer.js  loader.js  toc.js
│   ├── ui/                       # 可复用 UI 片段
│   │   ├── fragments.js  cards.js  shells.js
│   ├── effects/                  # 纯视觉动效
│   │   ├── reveal.js  typewriter.js
│   ├── views/                    # 页面级组装（每个路由一个模块）
│   │   ├── home.js  project.js  docs.js  resume.js  notfound.js
│   └── styles/                   # 入口 main.css 统一 @import
│       ├── main.css
│       ├── 01-tokens.css         # 设计变量
│       ├── base/                 # reset / typography / utilities / responsive
│       ├── layouts/              # 页面骨架
│       ├── components/           # 可复用组件
│       ├── effects/  views/  print.css
│
├── content/                      # 内容（Markdown）
│   ├── projects/  docs/
│
└── public/                       # 原样托管的静态资源
    ├── img/                      # 头像与截图
    └── files/                    # 简历 PDF 等下载文件
```

### 分层与依赖方向

只允许自上而下依赖，不允许反向：

```text
main.js → views/* → ui/* · effects/* · markdown/* → core/* → utils/* → config/* · data/*
```

详细约定见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

---

## 页面与路由

单页应用，用 hash 路由（GitHub Pages 无法为子路径做服务端重写，hash 路由在任何静态托管上都能直接工作）。

| 地址 | 页面 |
| --- | --- |
| `#/` | 首页（首屏 / 关于 / 技能 / 项目 / 经历 / 教育 / 文档 / 联系） |
| `#/project/proj-maze` | 项目详情（渲染对应 Markdown） |
| `#/docs` | 文档库（带搜索） |
| `#/docs/doc-site-guide` | 单篇文档（带目录） |
| `#/resume` | 简历（可打印 / 存为 PDF） |
| 其它任意地址 | 404 页面 |

也支持 `?project=proj-maze` 形式的分享链接，打开后会自动归一化成 hash 地址。

---

## Markdown 支持范围

站点使用自带的渲染器（`src/markdown/renderer.js`，约 300 行，无依赖）：

| 语法 | 写法 |
| --- | --- |
| 标题 | H1 ~ H6，也支持 === / --- 下划线式 |
| 强调 | 粗体、斜体、粗斜体、删除线 |
| 代码 | 行内代码；代码块用三个反引号并标注语言，自动生成语言标签与复制按钮 |
| 列表 | - / * / +，有序列表，任务清单 |
| 表格 | GFM 表格，支持左对齐、居中、右对齐 |
| 引用 | 行首加 > |
| 链接图片 | 行内链接、图片、裸链接自动识别 |
| 其它 | 分割线 |

**图片路径**按 Markdown 文件所在目录解析，由 `src/utils/paths.js` 统一处理。
例如 `content/projects/` 下的文档写 `![截图](../../public/img/shot.png)` 会正确指向 `public/img/shot.png`，
并且部署在 GitHub Pages 子路径下同样有效。

> 出于安全考虑，正文里的原生 HTML 标签会被转义成文本显示，不会被执行。

---

## 自定义外观

- **换主题色**：改 `content.js` 里的 `site.accent` 与 `site.accent2`，全站按钮、图标、渐变、进度条一起变化。
- **改配色细节**：所有颜色都是 CSS 变量，集中在 `src/styles/01-tokens.css` 的 `:root`（浅色）与 `[data-theme="dark"]`（深色）里。深浅两套都要改，明暗模式才一致。
- **改圆角 / 间距 / 阴影**：同一文件里的 `--radius-*`、`--space-*`、`--shadow-*`。
- **默认主题模式**：`content.js` 的 `site.theme` 可设 `'auto'`（跟随系统）、`'light'`、`'dark'`。访客手动切换后会记在浏览器里。
- **新增图标**：`src/data/icons.js` 是内联 SVG 图标库，新增一个键就能在 `content.js` 中按名字引用。

样式层叠顺序由 `src/styles/main.css` 的 `@import` 顺序决定：
变量 → 重置与排版 → 布局 → 组件 → 动效 → 页面 → 响应式 → 打印。**响应式必须留在最后**。

---

## 简历导出 PDF

两种方式：

1. 打开 `#/resume` 页面，点「打印 / 存为 PDF」，在浏览器打印对话框里选择「另存为 PDF」——
   `src/styles/print.css` 已经隐藏了导航、页脚和按钮，并对分页做了处理。
2. 把现成的 PDF 放进 `public/files/`，在 `content.js` 里设置 `site.resumePdf`，简历页会出现「下载 PDF」按钮。

---

## 工程约定

| 约定 | 说明 |
| --- | --- |
| 缩进 | 2 空格，LF 换行，UTF-8（见 .editorconfig） |
| 引号与分号 | 单引号、必须写分号、行宽 120（见 .prettierrc.json） |
| 模块 | 只用 ES Module，import 必须带 `.js` 扩展名（浏览器要求） |
| 命名 | 文件名用全小写单词或短横线；JS 变量 camelCase，常量 UPPER_SNAKE_CASE |
| 转义 | 所有插入模板的动态文本必须经过 `escapeHtml()` |
| 路径 | 运行时资源路径统一走 `utils/paths.js`，不要手写相对路径 |
| 提交前 | 跑一次 `npm run verify` |

### 技术要点

- **零构建**：没有打包器、没有 node_modules，浏览器直接执行 `src/` 下的源码，十年后依然能跑。
- **数据与展示分离**：文案集中在 `data/content.js`，视图只负责渲染。
- **首屏即可见**：页头页脚直接写在 HTML 里，不依赖 JS 渲染；入场动画的初始隐藏样式由 JS 运行时添加，因此禁用脚本时内容完整可见。
- **无障碍**：跳转主内容的 skip link、`:focus-visible` 焦点环、导航 `aria-current`、进度条 `role="progressbar"`。
- **尊重系统偏好**：`prefers-color-scheme`（自动明暗）、`prefers-reduced-motion`（关闭动画与打字机）。
- **响应式**：断点 1024 / 900 / 640 / 420，移动端为抽屉式导航。

---

## 常见问题

**为什么直接双击 index.html 打不开内容？**
浏览器禁止 file:// 协议用 fetch 读取本地文件。请用 `npm run dev`（页面也会给出这条提示）。

**加了项目但首页没变化？**
先强制刷新（Ctrl + F5）清掉模块缓存；再确认 `body` 路径相对**仓库根目录**是否正确、`content/` 下的文件名大小写是否一致。也可以跑 `npm run verify` 让脚本告诉你哪个路径不对。

**改了页头导航文案？**
导航链接现在直接写在 `index.html` 里（为了首屏可见且无脚本可用），所以要同时改 HTML 和 `content.js` 的 `nav`。

**想加一个全新页面（比如博客列表）？**
`src/config/constants.js` 加路由名 → `src/core/router.js` 加解析分支 → `src/views/` 新建视图 → `src/main.js` 加 import 与 case。参考 `src/views/resume.js`。

**`npm run verify` 报「导入的名字未被导出」？**
说明某个 import 的名字在目标模块里不存在（改了名字或漏了 export），脚本会直接指出文件与名字。

---

## 部署

仓库名 `Bit-FlameMouse.github.io` 属于 GitHub Pages **用户主页仓库**，推送到主分支后会自动发布到
https://bit-flamemouse.github.io/ ，无需额外配置，也没有构建步骤。

```bash
git add .
git commit -m "更新内容"
git push
```

根目录的 `.nojekyll` 请保留：它让 GitHub Pages 跳过 Jekyll 处理。

---

## 待办

- [ ] 替换 `content.js` 里所有 TODO 占位内容（真实邮箱、公司、学校等）
- [ ] 放一张头像到 `public/img/avatar.png` 并配置 `site.avatar`
- [ ] 用真实项目替换示例项目，并补上各自的 Markdown 说明
- [ ] 导出简历 PDF（或配置 `site.resumePdf`）
