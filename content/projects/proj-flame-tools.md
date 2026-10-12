# Flame Tools

> 一个可扩展的命令行小工具箱。日常开发里总有些重复动作——批量重命名、找重复文件、看看哪个目录最占空间——这些事写一次脚本就够，但每次都要重写。于是我把它们收进了一个 CLI。

**技术栈**：Node.js · TypeScript · Commander · npm
**仓库**：[github.com/Bit-FlameMouse](https://github.com/Bit-FlameMouse)
**协议**：MIT

---

## 设计目标

1. **冷启动要快**。工具类命令最怕"为了干 20ms 的活等 1 秒"，所以坚持零运行时框架、按需 `import`。
2. **加一条命令只改一个文件**。命令自动注册，不需要维护一张庞大的路由表。
3. **默认安全**。所有会修改文件的操作，默认先打印"将要做什么"，加 `--yes` 才真正执行。

## 安装与使用

```bash
# 全局安装
npm install -g flame-tools

# 查看所有命令
flame --help

# 批量重命名：把 image_001.jpg 之类的序号统一成两位
flame rename ./photos --pattern "image_(\\d+).jpg" --to "shot-$1.jpg" --dry-run

# 找出目录下的重复文件（按内容 hash 比对）
flame dedupe ./downloads

# 按体积列出子目录，只看前 10 个
flame size ./node_modules --top 10
```

## 现有命令

| 命令 | 作用 | 常用参数 |
| --- | --- | --- |
| `flame rename` | 正则批量重命名 | `--pattern` `--to` `--dry-run` |
| `flame dedupe` | 按内容查找重复文件 | `--delete` `--keep` |
| `flame size` | 目录体积分析 | `--top` `--depth` |
| `flame enc` | 文本编码转换（GBK ↔ UTF-8） | `--from` `--to` |
| `flame json` | 格式化 / 压缩 JSON，支持流式大文件 | `--minify` |
| `flame port` | 查看端口占用进程并结束 | `--kill` |

（完整列表见仓库 README）

## 插件式命令注册

每个命令就是一个导出了 `meta` 和 `run` 的模块：

```typescript
import type { CommandModule } from '../core/types';

export const meta = {
  name: 'size',
  describe: '按体积统计目录占用',
  options: [
    ['--top <n>', '只显示前 n 条', '20'],
    ['--depth <n>', '统计深度', '3'],
  ],
} as const;

export const run: CommandModule['run'] = async (args, io) => {
  const report = await measure(args.path, { depth: Number(args.depth) });
  io.table(report.slice(0, Number(args.top)));
};
```

核心只要扫描 `commands/` 目录并把符合条件的模块挂到 Commander 上即可：

```typescript
const files = await readdir(commandsDir);
for (const file of files) {
  const mod = await import(`../commands/${file}`);
  registerCommand(program, mod.meta, mod.run);
}
```

## 性能

- 冷启动 **< 80ms**（`node --experimental-strip-types` 直跑 TS，无打包步骤）
- `dedupe` 用流式 hash，处理 2GB 文件不爆内存
- `size` 使用并发遍历 + 结果缓存，比 `du -sh` 快约 3 倍（在 NTFS 上）

## 踩坑记录

- **Windows 路径分隔符**：一开始用 `/` 拼路径，在 Windows 上处处出错。统一改用 `path.join` 和 `node:path` 的 `win32` / `posix` 分支后解决。
- **`--dry-run` 应该默认**：早期版本默认直接改文件，我自己误删过一次测试目录。现在默认干跑，必须显式传 `--yes`。
- **输出排版**：手写表格对齐在中英混排时很难看，后来按"显示宽度"（中文算 2 列）计算填充，才对齐。

## 学到的东西

- CLI 的体验藏在细节里：`--help` 的措辞、错误信息的可操作性、进度提示的必要性。
- 破坏性操作增加一道确认，成本极低但收益极高。
