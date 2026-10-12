# Maze Studio

> 一个把"迷宫生成"和"寻路算法"画出来的可视化实验台。写它的初衷很朴素：课本上的算法描述我能背下来，但直到看见它们一步步生长出来，才真正理解为什么 A* 比 BFS 快。

**技术栈**：TypeScript · Canvas API · Vite · Vitest · GitHub Actions
**仓库**：[github.com/Bit-FlameMouse](https://github.com/Bit-FlameMouse)

---

## 为什么做这个项目

学习图论算法时我发现两个问题：

1. **算法描述与实际行为之间有落差**。Prim 和 Kruskal 都是"最小生成树"，但在迷宫上的表现形式完全不同——一个像水漫，一个像拼接。
2. **现成的可视化工具不够可控**。多数在线演示只能看不能改，改一个参数要重刷页面。

所以我决定自己做一台"实验台"：所有参数可调，所有过程可回放。

## 功能

### 迷宫生成算法

| 算法 | 特点 | 生成迷宫的"性格" |
| --- | --- | --- |
| 深度优先（递归回溯） | 沿一条路走到底再回退 | 长廊多，路线曲折 |
| Prim | 从已访问集合向外扩张 | 短分支多，均匀 |
| Kruskal | 随机合并集合，并查集判断环路 | 分支自然，比较"随机" |
| 二叉树立 | 每个格子朝随机方向打通 | 有明显的斜向纹理 |

### 寻路算法

- **BFS**：保证最短路径（无权图），但探索面积大
- **DFS**：不保证最短，适合演示"撞南墙"
- **Dijkstra**：带权图上的最短路，是 A* 的退化形式
- **A\***：引入启发函数后探索的节点数明显下降

下面是核心逻辑的示意（TypeScript）：

```typescript
/** 用二叉树立生成迷宫：每个格子只朝上或朝左打通 */
export function binaryTreeMaze(width: number, height: number): Maze {
  const maze = createMaze(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const directions: Direction[] = [];
      if (y > 0) directions.push('north');
      if (x > 0) directions.push('west');
      if (directions.length === 0) continue;

      const pick = directions[Math.floor(Math.random() * directions.length)];
      carve(maze, { x, y }, pick);
    }
  }

  return maze;
}
```

## 战绩数据

- 支持 **7 种算法**组合对比（4 种生成 + 5 种寻路，可同屏运行）
- 网格规模从 10×10 到 120×80 实时渲染，稳定在 **60fps**
- 单元测试覆盖率 **92%**（Vitest，重点覆盖边界：1×1 网格、无解迷宫、全墙迷宫）

## 遇到的坑

### 递归回溯在超大网格上爆栈

最初用真正的递归实现 DFS 生成，网格超过 100×100 时浏览器直接抛 `Maximum call stack size exceeded`。改成显式维护一个栈数组后问题解决，顺便让"暂停 / 单步"功能变得容易实现——因为状态不再藏在调用栈里。

### 动画帧与算法速度解耦

一开始算法每执行一步就 `requestAnimationFrame` 重绘一次，速度快时卡顿、速度慢时又浪费帧。最终拆成两层：

- 算法层：按"步"产出状态快照
- 渲染层：按固定帧率消费快照队列

这样速度滑块只影响消费速率，渲染始终平滑。

## 后续计划

- [x] 支持导出迷宫为 JSON / PNG
- [ ] 加入迷宫"求解路径"的手动游玩模式
- [ ] 把算法步骤导出成 GIF，方便写文章时配图

## 学到的东西

- 把"状态"从调用栈里搬到数据结构里，是可视化的通用前提。
- 模块边界清晰之后，加一种新算法基本只是新增一个文件，不用改动渲染层。
