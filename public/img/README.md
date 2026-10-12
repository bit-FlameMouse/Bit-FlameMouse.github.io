# 图片目录

把头像、项目截图等图片放在这里，然后在 Markdown 或 content.js 里用相对路径引用。

- 头像：文件名建议 avatar.png（正方形，512×512 以上），然后在 src/data/content.js 里设置
  site.avatar: 'public/img/avatar.png'。
- 项目截图：在 Markdown 里用相对路径引用。例如 content/projects/ 下的文档写
  ![截图](../../public/img/my-shot.png)，渲染时会自动解析成正确的绝对路径。

当前目录下的 avatar-placeholder.svg 是一张占位头像，接入真实头像后可以删除。
