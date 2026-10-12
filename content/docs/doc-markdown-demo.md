# Markdown 渲染效果示例

这篇文档用来检查渲染器对各种语法的处理效果。写完内容后可以对照这里看看样式是否符合预期。

## 文本与强调

普通段落文字。这里包含 **粗体**、*斜体*、***粗斜体***、~~删除线~~，以及行内代码 `npm run build`。

> 引用块用于强调重点或引用他人观点。
>
> 引用块内部也可以有 **格式** 与 `代码`，甚至包含列表：
> - 第一点
> - 第二点

一个超长链接的自动识别：https://github.com/Bit-FlameMouse

## 列表

无序列表：

- 第一项，说明一个事实
- 第二项，包含 `代码片段`
- 第三项，包含一个 [链接](https://github.com/Bit-FlameMouse)

有序列表（从 3 开始）：

3. 第三步
4. 第四步
5. 第五步

任务清单：

- [x] 确定信息架构
- [x] 实现深色模式
- [ ] 接入站内搜索
- [ ] 生成 sitemap

## 表格

| 特性 | 状态 | 说明 |
| --- | :---: | ---: |
| 深色模式 | ✅ | 跟随系统 + 手动记忆 |
| 响应式布局 | ✅ | 断点 1024 / 900 / 640 |
| 站内搜索 | ⏳ | 计划中 |
| 语法高亮 | ⏳ | 计划中 |

## 代码块

TypeScript：

```typescript
interface Project {
  id: string;
  name: string;
  tech: string[];
  repo?: string;
}

export function featured(projects: Project[]): Project[] {
  return projects.filter((project) => project.repo !== undefined);
}
```

Shell：

```bash
git add .
git commit -m "docs: 更新项目说明"
git push origin main
```

不带语言标注：

```
纯文本代码块，不带语言标签时默认显示为 text。
```

## 分割线与图片

---

图片语法示例（这里故意指向一个不存在的文件，用来观察加载失败的降级效果）：

![示意图](../../public/img/example-shot.png)

## 中文排版检查

中文段落应当有合适的行高与字间距。标点符号使用全角：「引号」、（括号）、—— 破折号。中英混排时如 GitHub、TypeScript、Node.js 应有自然的间距，不应显得拥挤。

一段较长的文字用来检验阅读体验：良好的正文排版需要控制每行字数在 35 到 75 个字符之间，行高大约是字号的 1.6 到 1.8 倍，段与段之间留出明确的间隔。当这些条件满足时，长文阅读才不会让人疲劳。

## 渲染器已知限制

- 不支持四级以上的嵌套列表（深层缩进会按续行处理）
- 不支持 HTML 内联标签（会被转义后原样显示，这是出于安全考虑）
- 不支持脚注、定义列表、数学公式

需要这些能力时，替换 `src/markdown/renderer.js` 即可，其余代码无需改动。
