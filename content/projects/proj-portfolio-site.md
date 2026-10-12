# 个人网站

> 你正在浏览的这个网站。目标很明确：用最朴素的技术栈（HTML + CSS + 原生 JavaScript）做一个**长期可维护**的个人主页，同时不牺牲视觉效果。

**技术栈**：HTML5 · CSS3（自定义属性）· 原生 ES Module · GitHub Pages
**仓库**：[github.com/Bit-FlameMouse/Bit-FlameMouse.github.io](https://github.com/Bit-FlameMouse/Bit-FlameMouse.github.io)
**架构说明**：仓库内 docs/ARCHITECTURE.md

---

## 三个核心决策

### 1. 零构建，但用真正的模块化

没有打包器、没有 node_modules、没有需要维护的构建配置。但模块组织并不将就——用的是浏览器原生支持的 **ES Module**，依赖关系由 import 显式声明：

```javascript
// src/main.js
import { CONTENT } from './data/content.js';
import { startRouter, onRouteChange } from './core/router.js';
import { renderHome } from './views/home.js';
```

这带来两个好处：依赖图不再靠"script 标签的先后顺序"这种隐式约定来维持；模块边界清晰，改一个文件不会牵动别处。同时它依然是零构建的——浏览器直接执行源码，十年后照样能跑。

### 2. 数据与展示分离

所有可能变的内容都集中在 `src/data/content.js` 一个文件里。改一段自我介绍、加一个项目、换一个邮箱，都不需要碰 HTML 和 CSS。

```javascript
export const CONTENT = Object.freeze({
  profile: { name: '李辰麾', title: '软件开发者 / 全栈方向' },
  projects: [
    { id: 'proj-maze', name: 'Maze Studio', body: 'content/projects/proj-maze.md' },
  ],
});
```

### 3. Markdown 直接渲染

项目详情和技术笔记都写在 md 文件里，由我手写的一个约 300 行的渲染器（src/markdown/renderer.js）转成 HTML，支持标题、列表、任务清单、表格、代码块、引用、图片等常用语法。

这样做的理由：

- 写文档时用我最顺手的格式，不用写 HTML
- 文档可以同时被 GitHub 和网站渲染
- 渲染器是独立模块，想换成 marked 只需要替换一个文件

## 目录结构

源码按职责分层，依赖只允许自上而下（入口 → 视图 → 组件 → 工具 → 数据）：

```text
.
├── index.html                 # 唯一入口：静态页头页脚 + module script
├── scripts/                   # 工程脚本（不参与线上）
│   ├── serve.mjs              # 零依赖静态服务器
│   └── verify.mjs             # 静态校验（引用、import、导出名）
├── src/
│   ├── main.js                # 入口：初始化 + 路由分派
│   ├── config/constants.js    # 跨模块常量
│   ├── data/                  # 纯数据
│   │   ├── content.js         # ★ 内容都在这里
│   │   └── icons.js           # 内联 SVG 图标库
│   ├── utils/                 # 无副作用工具
│   ├── core/                  # 应用基础设施
│   │   ├── router.js  theme.js  shell.js  scrollSpy.js
│   ├── markdown/              # Markdown 能力
│   │   ├── renderer.js  loader.js  toc.js
│   ├── ui/                    # 可复用片段
│   │   ├── fragments.js  cards.js  shells.js
│   ├── effects/               # 纯视觉动效
│   │   ├── reveal.js  typewriter.js
│   ├── views/                 # 页面级组装
│   │   ├── home.js  project.js  docs.js  resume.js  notfound.js
│   └── styles/                # 入口 main.css 统一 @import
│       ├── 01-tokens.css      # 设计变量
│       ├── base/              # reset / typography / utilities / responsive
│       ├── layouts/           # 页面骨架
│       ├── components/        # 可复用组件
│       ├── effects/  views/  print.css
├── content/                   # Markdown 内容
│   ├── projects/  docs/
└── public/                    # 原样托管的静态资源
    ├── img/  files/
```

## 路由设计

用 hash 路由而不是 History API，是因为 GitHub Pages 无法为子路径配置服务器端重写。hash 路由在任何静态托管上都能直接工作：

| 地址 | 页面 |
| --- | --- |
| #/ | 首页 |
| #/project/proj-maze | 项目详情 |
| #/docs | 文档库 |
| #/docs/doc-site-guide | 单篇文档 |
| #/resume | 简历 |

同时兼容 ?project=proj-maze 这样的分享链接，打开后会自动归一化成 hash 形式。

## 无障碍与性能考虑

- 键盘可访问：跳转链接、focus-visible 焦点环、导航 aria-current
- 尊重 prefers-reduced-motion：关闭打字机与入场动画
- 尊重 prefers-color-scheme：首次访问自动匹配系统主题，且手动切换后会记住
- **没有 JavaScript 也能看到内容**：页头页脚直接写在 HTML 里，入场动画的初始隐藏样式由 JS 在运行时添加
- 零外部字体、零图片依赖（图标是内联 SVG），首屏只有一个 HTML + 一个 CSS 入口 + 一份模块图

## 工程质量

- npm run verify 是一个零依赖的校验脚本：检查 HTML 引用的资源是否存在、每个 import 的路径与**导出名**是否对得上、CSS 的 @import 是否有效、content.js 里登记的 Markdown 文件是否存在，以及是否残留旧的全局变量写法。它可以直接作为 CI 门禁。
- .editorconfig 统一缩进与换行，.prettierrc.json 提供一致的代码风格配置（可选工具，不装也不影响运行）。
- 路径解析集中在 src/utils/paths.js，基于 base 标签计算，因此部署在子路径下也不会出现图片 404。

## 关于设计

- 主色用 CSS 变量 --accent 统一控制，改一个色值就能整体换肤
- 明暗两套色板都定义在 01-tokens.css，组件层只引用语义变量（--bg、--text、--border）
- 卡片、按钮、标签等组件用统一的圆角与阴影阶梯，保证视觉一致

## 后续想做的

- [ ] 接入站内搜索（把所有 Markdown 建一个静态索引）
- [ ] 给代码块加语法高亮（目前只做等宽 + 分块处理）
- [ ] 项目卡片支持筛选与标签云
- [ ] 自动生成 sitemap.xml

## 学到的东西

组件化不是框架的专利。把"数据 / 渲染 / 交互"分层，用原生 ES Module 一样能写出边界清晰、可长期维护的前端代码；而"零构建"和"工程规范"并不矛盾——前者约束的是运行方式，后者约束的是组织方式。
