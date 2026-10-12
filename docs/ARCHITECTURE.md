# 架构设计

这份文档说明项目的目录组织、模块边界与约定。改代码前先读一遍，可以避免把新代码放到错误的位置。

## 设计目标与取舍

| 目标 | 具体做法 | 代价 |
| --- | --- | --- |
| 零构建、可长期维护 | 原生 ES Module + 原生 CSS `@import`，浏览器直接执行 | 首次请求模块数较多（HTTP/2 下影响很小） |
| 数据与展示分离 | 所有文案集中在 `src/data/content.js` | 需要一个数据文件作为唯一事实来源 |
| 无脚本也能读 | 页头页脚静态写在 HTML；入场动画的隐藏样式由 JS 运行时添加 | 首屏导航需要用 HTML 手写一遍 |
| 明确的模块边界 | 单向依赖：入口 → 视图 → 组件 → 工具 | 不能图省事直接读全局变量 |

**没有选择打包器**：本项目是纯静态展示站，源码规模不大，打包带来的主要收益（HTTP 请求合并、语法降级、Tree-shaking）在这里价值有限，而代价是引入 `node_modules`、构建配置和"源码与产物不一致"的心智负担。如果将来要接入打包器（Vite / esbuild），源码结构不需要改动，把入口指向 `src/main.js` 即可。

## 目录结构

```text
.
├── index.html                 # 唯一入口：静态页头页脚 + <script type="module">
├── package.json               # 元信息与 npm scripts（无 dependencies）
├── .editorconfig              # 跨编辑器统一缩进与换行
├── .prettierrc.json           # 代码风格（可选的格式化工具配置）
├── .nojekyll                  # GitHub Pages 跳过 Jekyll
│
├── scripts/                   # 工程脚本（只在本地/CI 运行，不参与线上）
│   ├── serve.mjs              # 零依赖静态服务器：npm run dev
│   └── verify.mjs             # 静态校验：npm run verify
│
├── src/                       # 源码
│   ├── main.js                # 应用入口：初始化 + 路由分派
│   ├── config/constants.js    # 跨模块常量（路由名、存储键、区块 id）
│   ├── data/                  # 纯数据，不含任何 DOM 操作
│   │   ├── content.js         # ★ 站点全部文案与配置
│   │   └── icons.js           # 内联 SVG 图标库
│   ├── utils/                 # 无副作用的通用工具
│   │   ├── dom.js             # 转义、选择器、防抖
│   │   ├── paths.js           # 路径解析（部署在子路径也不出错）
│   │   ├── format.js          # 日期、首字、URL 展示、数值范围
│   │   ├── storage.js         # localStorage 安全读写
│   │   ├── clipboard.js       # 复制（含降级方案）
│   │   ├── icons.js           # 图标渲染
│   │   └── asyncState.js      # 加载中 / 失败 / 空状态片段
│   ├── core/                  # 应用级基础设施（有状态、有副作用）
│   │   ├── router.js          # hash 路由
│   │   ├── theme.js           # 深浅色主题
│   │   ├── shell.js           # 页头页脚注入、全局事件委托、进度条
│   │   └── scrollSpy.js       # 首页章节高亮
│   ├── markdown/              # Markdown 能力
│   │   ├── renderer.js        # 渲染器（唯一需要了解语法的模块）
│   │   ├── loader.js          # 拉取文件 + 渲染 + 渲染后增强
│   │   └── toc.js             # 目录生成与定位滚动
│   ├── ui/                    # 与业务无关的可复用 UI 片段
│   │   ├── fragments.js       # 按钮、标签、数据行、返回链接
│   │   ├── cards.js           # 项目卡片、文档卡片
│   │   └── shells.js          # 详情页外壳、列表页标题区、404 页
│   ├── effects/               # 纯视觉动效
│   │   ├── reveal.js          # 滚动入场
│   │   └── typewriter.js      # 打字机
│   ├── views/                 # 页面级组装（每个路由一个模块）
│   │   ├── home.js
│   │   ├── project.js
│   │   ├── docs.js
│   │   ├── resume.js
│   │   └── notfound.js
│   └── styles/                # 样式（入口 main.css 统一 @import）
│       ├── main.css
│       ├── 01-tokens.css      # 设计变量
│       ├── base/              # reset / typography / utilities / responsive
│       ├── layouts/           # 页面骨架
│       ├── components/        # 可复用组件
│       ├── effects/           # 动效
│       ├── views/             # 页面专属样式
│       └── print.css          # 打印
│
├── content/                   # 内容（Markdown）
│   ├── projects/*.md          # 项目详情
│   └── docs/*.md              # 技术笔记
│
└── public/                    # 原样托管的静态资源
    ├── img/                   # 头像与截图
    └── files/                 # 简历 PDF 等下载文件
```

## 依赖方向

**只允许自上而下依赖，不允许反向。**

```text
main.js
  └─ views/*            （页面组装）
       └─ ui/*          （可复用片段）
       └─ effects/*     （动效）
       └─ markdown/*    （文档能力）
       └─ core/*        （路由 / 主题 / 外壳）
            └─ utils/*  （无副作用工具）
            └─ config/* （常量）
                 └─ data/*  （纯数据）
```

几条硬性约束：

- `data/` 与 `utils/` 不 import 任何 `core/`、`views/`、`ui/` 的模块；
- `utils/` 里的函数必须是纯函数或只做局部副作用，不能读写应用状态；
- 视图之间不互相 import，共享的片段抽到 `ui/`；
- 不使用全局变量传递数据。历史上用 `window.CONTENT` 那一套，现在全部改为 `import`。

## 一次路由切换发生了什么

```text
用户点击链接 / 修改地址栏
        │
        ▼
  router.js  emit()
        │  解析 hash → { name, param }
        ▼
  main.js handleRoute()
        │
        ├── setView()          切换前释放上一个视图（如停止打字机）
        ├── 调用对应视图的 render()
        │      └── 视图内部：拼 HTML → 注入 #app → 绑定自身事件
        │      └── 需要文档时：markdown/loader.js 发起 fetch 并渲染
        ├── updateShell(route) 同步导航高亮、详情页紧凑模式、章节高亮
        └── scanReveal()       为新内容注册滚动入场动画
```

## 关键约定

### 路径

站点可能部署在子路径（`/Bit-FlameMouse.github.io/`）下，而模块的 `import` 是相对于模块自身位置解析的。因此：

- `index.html` 里声明了 `<base href="./">`；
- 所有运行时资源路径都通过 `utils/paths.js` 的 `resolveAsset()` 解析，它基于 `document.baseURI`；
- Markdown 里的相对图片路径经 `resolveMarkdownUrl()` 处理，会先与文档目录拼接再归一化。

**不要在视图里手写 `assets/...` 这样的相对路径。**

### 导航链接

页头导航里的锚点链接统一写成 `href="#about"` 并带 `data-nav="about"`：

- 无脚本时它是普通的页内锚点，仍然可用；
- 有脚本时由 `core/shell.js` 的委托处理器接管，在首页内平滑滚动，在详情页先回首页再滚动。

### HTML 与视图的分工

| 内容 | 放在哪 | 原因 |
| --- | --- | --- |
| 页头 / 页脚骨架 | `index.html` | 首屏立刻可见，且无脚本可用 |
| 社交按钮、主题开关 | `core/shell.js` 注入 | 依赖图标库 |
| 首屏与各区块 | `views/home.js` | 内容来自 `content.js` |
| 详情页正文 | `markdown/loader.js` | 来自 Markdown 文件 |

### 安全

所有插入模板的动态文本都经过 `utils/dom.js` 的 `escapeHtml()`。Markdown 渲染器同样先把文本转义再注入受控标签，因此文档里写 `<script>` 也只会显示成文本。

### 样式层叠顺序

`src/styles/main.css` 的 `@import` 顺序即层叠顺序：变量 → 重置与排版 → 布局 → 组件 → 动效 → 页面 → 响应式 → 打印。响应式断点必须留在最后，否则会被后面的同优先级规则覆盖。

## 常见扩展怎么做

**加一个页面**

1. 在 `src/config/constants.js` 的 `ROUTE` 里加路由名；
2. `src/core/router.js` 的 `parseRoute()` 里加分支；
3. 新建 `src/views/xxx.js`，导出 `renderXxx(root, param)`；
4. 在 `src/main.js` 的 `handleRoute()` 里加 case 与 `import`。

**加一个可复用组件**

放进 `src/ui/`，导出一个"输入数据 → 返回 HTML 字符串"的函数，动态文本一律 `escapeHtml`。

**接入站外笔记（飞书 / Notion 等）**

笔记来源分三种形态，由 `src/utils/noteSource.js` 统一归一化，视图不再各自判断：

| 数据写法 | kind | 行为 |
| --- | --- | --- |
| 只有 `body` | `local` | 站内渲染，可被站内搜索 |
| 只有 `url` | `external` | 卡片直接新窗口打开原文，并标注「原文」 |
| `body` + `url` | `hybrid` | 站内渲染正文，页面顶部给出「查看原文」 |
| `url` + `embed: true` | `external` | 额外渲染一个「点击后加载」的 iframe 预览面板 |

关于 iframe 预览：飞书这类平台的文档页普遍用 `X-Frame-Options` / `frame-ancestors` 拒绝被嵌入，
官方推荐的「网页组件」又需要自建应用与服务端鉴权，静态站点用不了。
因此 `src/ui/embed.js` 的策略是：默认只给外链入口，预览做成**点击后才创建 iframe**（不拖累首屏），
并在面板里始终保留「在新窗口打开」作为兜底出口。
**加一种 Markdown 语法**

只改 `src/markdown/renderer.js`，其他模块不需要动。

**加一个图标**

在 `src/data/icons.js` 里加一个键值对，之后就能在 `content.js` 里按名字引用。

## 质量保障

```bash
npm run verify   # 检查资源引用、import 路径与导出名、Markdown 文件是否存在、旧写法残留
```

这个脚本不依赖任何第三方包，可以直接放进 CI（例如 GitHub Actions 的 pull_request 工作流）作为门禁。
