# 这个网站是怎么搭的

写这篇文档的目的很实际：**半年后我回来改内容时，能立刻想起该改哪个文件。**

想了解目录分层与模块边界，看仓库里的 [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md)。

## 快速上手

| 我想做的事 | 改哪里 |
| --- | --- |
| 改姓名、头衔、邮箱、简介 | `src/data/content.js` → `profile` |
| 加一个新项目 | `content.js` 的 `projects` + 新建 `content/projects/xxx.md` |
| 加一篇技术笔记 | `content.js` 的 `docs` + 新建 `content/docs/xxx.md` |
| 改技能、经历、教育 | `content.js` 对应数组 |
| 换主题色 | `content.js` → `site.accent`，或 `src/styles/01-tokens.css` |
| 换头像 | 图片放进 `public/img/`，再设 `content.js` → `site.avatar` |
| 加简历 PDF 下载 | PDF 放进 `public/files/`，再设 `content.js` → `site.resumePdf` |
| 加一个图标 | `src/data/icons.js` 里加一个键值对 |

原则：**只改数据，不改结构**。如果发现某次修改必须动 HTML 或 CSS，那说明内容配置少了一个字段，应该先补字段。

## 新增一个项目（两步）

**第一步**：在 `src/data/content.js` 的 `projects` 数组里追加一项：

```javascript
{
  id: 'proj-my-tool',              // 唯一标识，会成为网址：#/project/proj-my-tool
  name: 'My Tool',
  category: '工程效率',
  featured: true,                   // 是否在首页突出显示
  badge: '新增',
  year: '2025',
  tagline: '一句话说明它做什么',
  summary: '两三句详细介绍，会显示在卡片上。',
  tech: ['Node.js', 'TypeScript'],
  repo: 'https://github.com/Bit-FlameMouse/my-tool',
  demo: '',                         // 没有线上地址就留空
  body: 'content/projects/proj-my-tool.md',
  metrics: [
    { value: '12', label: '个子命令' },
  ],
}
```

**第二步**：新建 `content/projects/proj-my-tool.md`，用 Markdown 写正文。开头直接写 `# 项目名`，后面随意组织。推荐结构：

```markdown
# 项目名

> 一句话定位 + 为什么做它

## 它解决什么问题

## 核心功能 / 技术方案

## 数据与成果

## 遇到的坑

## 学到的东西
```

保存后刷新浏览器即可看到，不需要编译。

## 新增一篇文档

在 `src/data/content.js` 的 `docs` 数组里加一项，然后新建对应的 Markdown 文件：

```javascript
{
  id: 'doc-my-note',
  title: '我的技术笔记',
  description: '一句摘要，会显示在卡片上。',
  category: '前端',
  updated: '2025-03',
  body: 'content/docs/doc-my-note.md',
}
```

## Markdown 支持哪些语法

渲染器是手写的（`src/markdown/renderer.js`，约 300 行，零依赖），目前支持：

| 语法 | 写法 |
| --- | --- |
| 标题 | H1~H6，也支持 === / --- 下划线式 |
| 强调 | 粗体、斜体、删除线 |
| 代码 | 行内代码，代码块用三个反引号并标注语言 |
| 列表 | - / * / +，有序列表用数字加点 |
| 任务清单 | - [x] 已完成 / - [ ] 未完成 |
| 表格 | 标准 GFM 表格，支持 :--- 对齐 |
| 引用 | 行首加 > |
| 链接与图片 | [文字](地址)、![说明](图片地址) |

代码块会自动带上语言标签和一个 **复制** 按钮。

> 图片路径按 Markdown 文件所在目录解析。例如在 `content/projects/` 里的文档写
> `![图](../../public/img/shot.png)`，会正确指向 `public/img/shot.png`。
> 路径解析由 `src/utils/paths.js` 统一处理，所以部署在 GitHub Pages 子路径下也不会出错。

出于安全考虑，文档里的原生 HTML 标签会被转义成文本显示，不会被执行。

## 本地开发

必须先起静态服务器：直接双击 `index.html`（file:// 协议）时浏览器禁止 fetch，项目详情与文档会因为读不到 Markdown 而报错。

```bash
npm run dev            # 项目自带的零依赖服务器，默认 http://localhost:8000
npm run dev -- 3000    # 指定端口

# 或者用任意静态服务器
python -m http.server 8000
```

提交前建议跑一次静态校验（不需要联网，也不需要安装依赖）：

```bash
npm run verify
```

它会检查 HTML 引用的资源、JS 的 import 路径与导出名、CSS 的 @import、`content.js` 里登记的 Markdown 文件是否存在，以及是否有旧的全局变量写法残留。

## 部署

这个仓库名是 `Bit-FlameMouse.github.io`，属于 **用户主页仓库**，推送到 `main` 分支后 GitHub Pages 会自动发布到根域名，不需要额外配置，也没有构建步骤——浏览器直接加载 `src/` 下的源码。

```bash
git add .
git commit -m "更新内容"
git push
```

仓库根目录的 `.nojekyll` 文件请保留：它告诉 GitHub Pages 不要用 Jekyll 处理文件，否则以下划线开头的路径可能被忽略。

## 目录约定

- 源码全部放在 `src/`：数据在 `src/data/`，工具在 `src/utils/`，基础设施在 `src/core/`，页面在 `src/views/`
- 样式放在 `src/styles/`，由 `main.css` 统一 @import，**引入顺序即层叠顺序**
- 文案只放在 `src/data/content.js`，不要在视图文件里硬编码
- Markdown 只放在 `content/` 下，按用途分 `projects/` 与 `docs/`
- 图片与下载文件放在 `public/` 下

## 常见问题

**改成中文名后网址有乱码？**
路由会做 encodeURIComponent，地址栏里显示编码后的字符是正常的。建议 `id` 保持英文，`name` 用中文。

**加了项目但首页没变化？**
先强制刷新（Ctrl + F5）清掉模块缓存。仍然没变化就检查两点：`body` 路径是否写错（它相对**仓库根目录**），以及 `content/` 下的文件名大小写是否一致。

**想加一个全新的页面（比如博客列表）？**
在 `src/config/constants.js` 加路由名 → `src/core/router.js` 加解析分支 → `src/views/` 新建视图 → `src/main.js` 加 import 与 case。参考 `src/views/resume.js` 的写法。

**npm run verify 报「导入的名字未被导出」？**
说明某个 import 里的名字在目标模块里没有导出（可能是改了名字或漏了 export）。这是最常见的低级错误，脚本会直接指出文件和名字。
