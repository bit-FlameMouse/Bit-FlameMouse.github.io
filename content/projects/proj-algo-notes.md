# Algo Notes

> 刷题时最有价值的产出不是"这题我做出来了"，而是"下次遇到同类题我知道该想什么"。这个仓库就是为后者建立的：按题型归档模板代码，配复杂度分析和易错点提醒。

**技术栈**：Python · pytest · Markdown
**仓库**：[github.com/Bit-FlameMouse](https://github.com/Bit-FlameMouse)

---

## 组织方式

不是按题目编号排列，而是按**解题模式**分类：

| 分类 | 核心思想 | 代表题型 |
| --- | --- | --- |
| 双指针 | 用两个游标缩小搜索空间 | 有序数组两数之和、盛水容器 |
| 滑动窗口 | 维护一个动态区间 | 最长无重复子串、最小覆盖子串 |
| 二分搜索 | 在有序或"单调"空间上折半 | 旋转数组找最小值、答案二分 |
| 动态规划 | 把大问题拆成重叠子问题 | 背包、最长递增子序列、编辑距离 |
| 并查集 | 动态维护连通性 | 岛屿数量、冗余连接 |
| 单调栈 | 维护一个有序的候选集 | 每日温度、柱状图最大矩形 |
| 图论搜索 | BFS / DFS / 拓扑排序 | 课程表、单词接龙 |

## 每个模板包含什么

以滑动窗口为例：

```python
from collections import defaultdict

def longest_substring_without_repeat(s: str) -> int:
    """最长无重复字符子串。

    时间复杂度: O(n)  —— 左右指针各自最多移动 n 次
    空间复杂度: O(k)  —— k 为字符集大小
    """
    window = defaultdict(int)
    left = 0
    best = 0

    for right, char in enumerate(s):
        window[char] += 1

        # 当窗口不再合法时收缩左边界
        while window[char] > 1:
            window[s[left]] -= 1
            left += 1

        best = max(best, right - left + 1)

    return best
```

配套的测试用例：

```python
import pytest
from templates.sliding_window import longest_substring_without_repeat

@pytest.mark.parametrize(
    'text,expected',
    [
        ('abcabcbb', 3),
        ('bbbbb', 1),
        ('pwwkew', 3),
        ('', 0),
        ('a', 1),
        ('abba', 2),      # 容易写错的用例：左指针不能简单回退
        (' ', 1),
    ],
)
def test_longest_substring(text, expected):
    assert longest_substring_without_repeat(text) == expected
```

## 统计

- 整理题解 **150+** 道
- 可复用模板 **24** 类
- 全仓库单元测试，`pytest -q` 一条命令验证所有模板

## 易错点记录

每个模板末尾都有一节"易错点"，下面几条是踩得最深的：

- **滑动窗口**：左指针只能单向移动。遇到 `abba` 这类输入时如果写成 `left = 上一次出现位置 + 1` 就会出错。
- **二分搜索**：`while left < right` 还是 `while left <= right` 取决于区间定义（半开还是闭合）。写代码前先写清楚 `[left, right]` 的含义。
- **动态规划**：先确定"状态是什么"，再考虑转移方程。很多卡壳其实不是方程不会写，而是状态没定义清楚。
- **并查集**：忘记路径压缩会让复杂度从近似 O(1) 退化到 O(n)，大输入直接超时。

## 学到的东西

把解题经验写成"可被未来的自己读懂"的文档，比多刷十道题更有长期价值。
