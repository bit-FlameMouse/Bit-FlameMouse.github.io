/**
 * 知识索引数据
 *
 * ⚠️ 所有 url 目前是占位地址（your-domain.feishu.cn），发布前请逐条替换成飞书文档的真实分享链接。
 * 正文不放本站：条目只保留标题、一句话说明、分类与更新时间。
 */

export const categories = [
  {
    id: 'tech',
    name: '技术笔记',
    en: 'Technical',
    desc: '具身智能、智能驾驶与系统工程的机制细节和工程判断。',
  },
  {
    id: 'management',
    name: '管理知识',
    en: 'Management',
    desc: '项目节奏、依赖、风险与变更的处理方法。',
  },
  {
    id: 'reflection',
    name: '管理心得',
    en: 'Reflection',
    desc: '项目复盘与跨团队协作中的具体经验。',
  },
] as const;

export type CategoryId = (typeof categories)[number]['id'];

export interface Entry {
  title: string;
  summary: string;
  category: CategoryId;
  /** YYYY.MM.DD，用于排序与展示 */
  date: string;
  tags: string[];
  url: string;
  /** public = 可直接查看；request = 需要向作者申请权限 */
  access?: 'public' | 'request';
  featured?: boolean;
}

const doc = (id: string) => `https://your-domain.feishu.cn/docx/${id}`;

const raw: Entry[] = [
  {
    title: '数据闭环不是一条流水线',
    summary: '采集、回流、标注、训练、评测之间的接口和延迟，决定了闭环能不能真的转起来。',
    category: 'tech',
    date: '2026.11.18',
    tags: ['数据闭环', '具身智能'],
    url: doc('ReplaceWithRealId01'),
    featured: true,
  },
  {
    title: '端到端智驾的评测：把「感觉变好」变成指标',
    summary: '场景库、回归集与在线指标怎么分工，避免用平均分掩盖长尾退化。',
    category: 'tech',
    date: '2026.11.06',
    tags: ['评测', '智驾'],
    url: doc('ReplaceWithRealId02'),
  },
  {
    title: '车端算力预算怎么估',
    summary: '从模型参数量、算子特性到帧率的粗算方法，以及哪些环节最容易超预算。',
    category: 'tech',
    date: '2026.10.29',
    tags: ['推理', '算力'],
    url: doc('ReplaceWithRealId03'),
    access: 'request',
  },
  {
    title: 'DDS 与车载中间件：QoS 不是一个开关',
    summary: 'reliability、durability、deadline 组合起来才决定行为，默认值往往不适用。',
    category: 'tech',
    date: '2026.10.17',
    tags: ['ROS 2', '中间件'],
    url: doc('ReplaceWithRealId04'),
  },
  {
    title: 'sim2real 的工程卡点',
    summary: '标定误差、控制时延与长尾场景，仿真里都对、实车上不对的三个原因。',
    category: 'tech',
    date: '2026.09.30',
    tags: ['仿真', '具身智能'],
    url: doc('ReplaceWithRealId05'),
  },

  {
    title: '里程碑要按可验证产出切',
    summary: '「完成 80%」不是里程碑。以能演示、能回归、能交付的产出为单位切分。',
    category: 'management',
    date: '2026.11.12',
    tags: ['里程碑', '计划'],
    url: doc('ReplaceWithRealId06'),
    featured: true,
  },
  {
    title: '跨团队依赖写成契约',
    summary: '接口人、交付物、时间点、失败时的升级路径，四样缺一不可。',
    category: 'management',
    date: '2026.11.02',
    tags: ['依赖管理'],
    url: doc('ReplaceWithRealId07'),
  },
  {
    title: '风险要有触发条件',
    summary: '没有触发条件的风险只是清单；分级、owner、触发后的动作才让它可管理。',
    category: 'management',
    date: '2026.10.21',
    tags: ['风险管理'],
    url: doc('ReplaceWithRealId08'),
  },
  {
    title: '变更管理的成本账',
    summary: '需求变更不可怕，没人算成本才可怕。谁付账、付多少，要在变更发生时写清。',
    category: 'management',
    date: '2026.10.09',
    tags: ['变更管理'],
    url: doc('ReplaceWithRealId09'),
  },

  {
    title: '复盘为什么常常变成甩锅会',
    summary: '把「谁的问题」换成「哪个环节允许它发生」，提问方式决定复盘的产出。',
    category: 'reflection',
    date: '2026.11.20',
    tags: ['复盘'],
    url: doc('ReplaceWithRealId10'),
    featured: true,
  },
  {
    title: '周报用决策点组织，而不是流水账',
    summary: '上级要的是需要他决策的事、需要他知道的风险、需要他协调的资源。',
    category: 'reflection',
    date: '2026.11.08',
    tags: ['沟通'],
    url: doc('ReplaceWithRealId11'),
  },
  {
    title: '第一次带跨职能项目踩的三个坑',
    summary: '节奏、授权、信息同步，每一个当时都以为是常识。',
    category: 'reflection',
    date: '2026.10.25',
    tags: ['协作'],
    url: doc('ReplaceWithRealId12'),
    access: 'request',
  },
  {
    title: '优先级争论，往往是在争约束',
    summary: '先把范围、时间、资源三个约束摆出来，优先级自然收敛。',
    category: 'reflection',
    date: '2026.10.02',
    tags: ['优先级'],
    url: doc('ReplaceWithRealId13'),
  },
];

/** 按更新时间倒序 */
export const entries: Entry[] = [...raw].sort((a, b) => b.date.localeCompare(a.date));

export const counts = Object.fromEntries(
  categories.map((c) => [c.id, entries.filter((e) => e.category === c.id).length]),
) as Record<CategoryId, number>;

export const latestDate = entries[0]?.date ?? '';

export const featured = entries.filter((e) => e.featured);

export const groups = categories.map((category) => ({
  ...category,
  items: entries.filter((e) => e.category === category.id),
}));

