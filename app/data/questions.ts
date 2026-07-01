import type { CityCategory } from './cities';

export type ScoreKey = CityCategory;

export interface QuizOption {
  label: string;
  weights: Partial<Record<ScoreKey, number>>;
  tagWeights: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  subtitle?: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  // ===== 第1-5题：生活方式的底色 =====
  {
    id: 'q1',
    text: '给你一个完全自由的周末，你会怎么过？',
    subtitle: '选最贴近你内心渴望的那个',
    options: [
      { label: '睡到自然醒，去熟悉的咖啡馆看书，晚上在家做顿饭', weights: { settle: 2 }, tagWeights: { '慢生活': 2, '宜居': 1, '咖啡': 1 } },
      { label: '探索一个没去过的小镇，逛当地市集，住特色民宿', weights: { sojourn: 2 }, tagWeights: { '探索': 2, '手工艺': 1, '慢生活': 1 } },
      { label: '一个人背包出发，跳上随机的地铁/公交，走到哪算哪', weights: { solo: 2 }, tagWeights: { '探索': 2, '自由': 1, '公共交通': 1 } },
      { label: '参加国际友人聚会或校园活动，认识来自不同国家的人', weights: { exchange: 2 }, tagWeights: { '国际化': 2, '多元文化': 1, '大学': 1 } }
    ]
  },
  {
    id: 'q2',
    text: '一个城市最让你心动的瞬间是什么？',
    subtitle: '闭上眼睛想象那个画面',
    options: [
      { label: '社区邻里熟悉的面孔，转角那家记得你口味的早餐店', weights: { settle: 2 }, tagWeights: { '包容': 2, '慢生活': 1, '宜居': 1 } },
      { label: '坐在陌生城市的广场上，阳光正好，时间仿佛变慢了', weights: { sojourn: 2 }, tagWeights: { '阳光': 2, '美学': 1, '复古': 1 } },
      { label: '深夜街头独自漫步，城市灯火璀璨却让你感到莫名自由', weights: { solo: 2 }, tagWeights: { '夜生活': 2, '自由': 1, '安全': 1 } },
      { label: '在校园/咖啡馆里和来自世界各地的人畅聊到忘记时间', weights: { exchange: 2 }, tagWeights: { '大学': 2, '英语': 1, '多元文化': 1 } }
    ]
  },
  {
    id: 'q3',
    text: '如果给你选一个「梦中情房」，它长什么样？',
    subtitle: '不考虑预算，你理想的居住空间是',
    options: [
      { label: '安静社区里的舒适公寓，有大窗、绿植和长期的好邻居', weights: { settle: 2 }, tagWeights: { '宜居': 2, '公园城市': 1, '安静': 1 } },
      { label: '带露台的老城小屋，出门就是市集和独立咖啡馆', weights: { sojourn: 2 }, tagWeights: { '复古': 2, '咖啡': 1, '文化底蕴': 1 } },
      { label: '市中心的高层公寓，24小时便利店楼下就有，去哪都方便', weights: { solo: 2 }, tagWeights: { '便利': 2, '高效': 1, '夜生活': 1 } },
      { label: '大学附近的共享公寓，有公共厨房、花园和各国室友', weights: { exchange: 2 }, tagWeights: { '大学': 2, '国际化': 1, '多元文化': 1 } }
    ]
  },
  {
    id: 'q4',
    text: '你对「好天气」的定义是什么？',
    subtitle: '气候影响你每天的心情和能量',
    options: [
      { label: '四季分明，春花秋叶冬雪，每季都有独特的美', weights: { settle: 1.5 }, tagWeights: { '四季': 3, '传统': 1 } },
      { label: '阳光灿烂、温暖舒适，最好一年300天以上是晴天', weights: { sojourn: 2 }, tagWeights: { '阳光': 3, '海滩': 1, '温暖': 1 } },
      { label: '不太重要——只要城市有趣，什么天气我都能玩得开心', weights: { solo: 1.5 }, tagWeights: { '探索': 2, '自由': 1 } },
      { label: '凉爽舒适，适合学习和长时间户外活动', weights: { exchange: 1.5 }, tagWeights: { '公园城市': 2, '宜居': 1 } }
    ]
  },
  {
    id: 'q5',
    text: '你的消费哲学更接近哪种？',
    subtitle: '钱要花得值——但「值」的定义每人不同',
    options: [
      { label: '注重品质和长期价值，愿意为好生活投资但要有保障', weights: { settle: 2 }, tagWeights: { '品质生活': 2, '性价比': 1 } },
      { label: '愿意为体验和美好事物花钱，但追求合理的性价比', weights: { sojourn: 2 }, tagWeights: { '性价比': 2, '美食': 1 } },
      { label: '花最少的钱获得最丰富的体验，预算敏感但玩心不小', weights: { solo: 2 }, tagWeights: { '性价比': 3 } },
      { label: '重点投入在学习和社交上，生活开销能省则省', weights: { exchange: 2 }, tagWeights: { '大学': 2, '性价比': 1 } }
    ]
  },

  // ===== 第6-10题：社交与生活节奏 =====
  {
    id: 'q6',
    text: '你在朋友圈里的角色是？',
    subtitle: '你的社交风格决定了适合的城市氛围',
    options: [
      { label: '三五知己深交即可，喜欢稳定、有深度的关系圈', weights: { settle: 2 }, tagWeights: { '安静': 2, '包容': 1, '传统': 1 } },
      { label: '享受和陌生人聊天，在旅途中结识新朋友是最大的乐趣', weights: { sojourn: 2 }, tagWeights: { '包容': 2, '多元文化': 1, '数字游民': 1 } },
      { label: '独来独往也可以很开心，偶尔和同好交流就够了', weights: { solo: 2 }, tagWeights: { '自由': 2, '探索': 1, '一人食': 1 } },
      { label: '喜欢组织活动、跨国社交，朋友圈遍布世界各地', weights: { exchange: 2 }, tagWeights: { '国际化': 2, '节庆': 1, '英语': 1 } }
    ]
  },
  {
    id: 'q7',
    text: '对你来说，美食在一座城市里扮演什么角色？',
    subtitle: '吃货等级测试 😋',
    options: [
      { label: '家常味最重要——熟悉的菜系、靠谱的菜市场、能做菜的家', weights: { settle: 2 }, tagWeights: { '美食': 2, '性价比': 1, '传统': 1 } },
      { label: '从米其林到路边摊都想打卡，美食是旅行的重要驱动力', weights: { sojourn: 2 }, tagWeights: { '美食': 3, '夜市': 1 } },
      { label: '街头小吃和深夜食堂就是最爱，一人食也津津有味', weights: { solo: 2 }, tagWeights: { '美食': 2, '一人食': 2, '夜市': 1 } },
      { label: '喜欢各国料理混搭，学校/公寓附近的美食多元最重要', weights: { exchange: 2 }, tagWeights: { '美食': 2, '多元文化': 1, '国际化': 1 } }
    ]
  },
  {
    id: 'q8',
    text: '你理想中的日常出行方式是什么？',
    subtitle: '通勤方式很大程度上定义了你感受城市的方式',
    options: [
      { label: '步行或骑行可达一切——社区配套完善，不需要远距离通勤', weights: { settle: 2 }, tagWeights: { '步行城市': 3, '自行车': 1, '宜居': 1 } },
      { label: '骑车穿过古城小巷，或坐复古电车慢慢看街景', weights: { sojourn: 2 }, tagWeights: { '复古': 2, '自行车': 1, '步行城市': 1 } },
      { label: '发达的地铁/公交系统，一张交通卡走遍全城', weights: { solo: 2 }, tagWeights: { '公共交通': 3, '高效': 1, '便利': 1 } },
      { label: '骑行+公共交通混合，校园和市中心之间方便切换', weights: { exchange: 2 }, tagWeights: { '自行车': 2, '公共交通': 1, '大学': 1 } }
    ]
  },
  {
    id: 'q9',
    text: '面对一个你不太会当地语言的城市，你会？',
    subtitle: '语言障碍对不同人的影响差别很大',
    options: [
      { label: '希望语言环境简单，最好能用母语或熟悉的语言搞定一切', weights: { settle: 2 }, tagWeights: { '华人友好': 3, '便利': 1 } },
      { label: '会基本的当地语就行，旅游区的英语够用就好', weights: { sojourn: 2 }, tagWeights: { '英语': 1, '多元文化': 1 } },
      { label: '无所谓，比手画脚也是旅行乐趣，翻译App够用了', weights: { solo: 2 }, tagWeights: { '探索': 2, '自由': 1 } },
      { label: '想沉浸式学一门新语言，或去英语普及度高的地方深度交流', weights: { exchange: 2 }, tagWeights: { '英语': 2, '大学': 1, '双语': 1 } }
    ]
  },
  {
    id: 'q10',
    text: '深夜11点，你对这个城市的要求是？',
    subtitle: '夜晚的安全感和活力值同样重要',
    options: [
      { label: '安静安全，晚上散步不用担心，社区氛围温暖', weights: { settle: 2 }, tagWeights: { '安全': 3, '安静': 1 } },
      { label: '有夜生活的选择但不过分喧闹——一杯小酒或一场街头表演', weights: { sojourn: 2 }, tagWeights: { '夜生活': 2, '音乐': 1, '安全': 1 } },
      { label: '灯火通明！夜市、酒吧、24小时店铺——夜晚才是城市的灵魂', weights: { solo: 2 }, tagWeights: { '夜生活': 3, '夜市': 1, '活力': 1 } },
      { label: '安全即可，偶尔和朋友去学生酒吧或参加宿舍活动', weights: { exchange: 2 }, tagWeights: { '安全': 2, '大学': 1, '包容': 1 } }
    ]
  },

  // ===== 第11-15题：价值观与深层偏好 =====
  {
    id: 'q11',
    text: '你和大自然的关系是怎样的？',
    subtitle: '山、海、公园——你离不开哪个？',
    options: [
      { label: '城市里要有大公园和绿地，周末能爬山或逛湖', weights: { settle: 2 }, tagWeights: { '公园城市': 3, '自然': 1, '山水': 1 } },
      { label: '山海之间最好——早上冲浪下午爬山，大自然是我的充电站', weights: { sojourn: 2 }, tagWeights: { '海滩': 2, '自然': 2, '山景': 1 } },
      { label: '偶尔需要自然放松，但城市的热闹和便利更重要', weights: { solo: 1.5 }, tagWeights: { '便利': 2, '公园城市': 1 } },
      { label: '有绿地和户外学习空间就好，校园草坪是我的最爱', weights: { exchange: 1.5 }, tagWeights: { '公园城市': 2, '大学': 1, '自行车': 1 } }
    ]
  },
  {
    id: 'q12',
    text: '逛一座陌生城市时，你第一站通常是？',
    subtitle: '你的探索习惯暴露了你的城市偏好',
    options: [
      { label: '先去居民区走走，感受真实的日常生活气息', weights: { settle: 2 }, tagWeights: { '宜居': 2, '慢生活': 1, '包容': 1 } },
      { label: '去老城区或艺术区——建筑、画廊、独立书店最吸引我', weights: { sojourn: 2 }, tagWeights: { '艺术': 2, '建筑': 1, '文化底蕴': 1 } },
      { label: '直奔城市地标和最佳观景台，先把城市脉络看清', weights: { solo: 2 }, tagWeights: { '探索': 2, '高效': 1 } },
      { label: '去大学城或青年聚集区，感受学术和创意氛围', weights: { exchange: 2 }, tagWeights: { '大学': 2, '创意': 1, '艺术': 1 } }
    ]
  },
  {
    id: 'q13',
    text: '你的「舒适区」有多大？',
    subtitle: '诚实面对自己——你愿意走多远？',
    options: [
      { label: '适度的新鲜感就好，太陌生的环境会让我焦虑', weights: { settle: 2 }, tagWeights: { '华人友好': 2, '安全': 1, '便利': 1 } },
      { label: '喜欢新鲜感但不是冒险派——换个城市生活几周刚好', weights: { sojourn: 2 }, tagWeights: { '数字游民': 2, '包容': 1, '性价比': 1 } },
      { label: '舒适区是什么？到一个完全陌生的地方才让我兴奋', weights: { solo: 2.5 }, tagWeights: { '探索': 2, '自由': 2 } },
      { label: '想挑战自己，但有学习/项目作为主心骨会更安心', weights: { exchange: 2 }, tagWeights: { '大学': 2, '国际化': 1, '安全': 1 } }
    ]
  },
  {
    id: 'q14',
    text: '如果用一个词形容你理想的生活状态，它更接近？',
    subtitle: '走心题——选最击中你的那个',
    options: [
      { label: '安稳——有根基、有归属、有期待', weights: { settle: 3 }, tagWeights: { '宜居': 2, '安全': 1, '品质生活': 1 } },
      { label: '自在——不被定义、不被催促、不被束缚', weights: { sojourn: 3 }, tagWeights: { '自由': 2, '慢生活': 1, '治愈': 1 } },
      { label: '热烈——每一天都是新的冒险、新的故事', weights: { solo: 3 }, tagWeights: { '探索': 2, '夜生活': 1, '自由': 1 } },
      { label: '成长——不断学习、拓宽视野、遇见更好的自己', weights: { exchange: 3 }, tagWeights: { '大学': 2, '国际化': 1, '英语': 1 } }
    ]
  },
  {
    id: 'q15',
    text: '最后诚实一问：你做这个测试，真正想找到的是什么？',
    subtitle: '闭上眼睛，听你内心的声音',
    options: [
      { label: '一个可以称之为「家」、安心扎根的地方', weights: { settle: 4 }, tagWeights: { '宜居': 3, '品质生活': 1, '安全': 1 } },
      { label: '灵感与生活交织的地方——想换个活法，重新感受世界', weights: { sojourn: 4 }, tagWeights: { '慢生活': 2, '治愈': 1, '美学': 1 } },
      { label: '那份说走就走的勇气——验证我内心的冒险渴望', weights: { solo: 4 }, tagWeights: { '探索': 2, '自由': 2, '夜生活': 1 } },
      { label: '打开世界的方式——想去更大的舞台学习、成长、交流', weights: { exchange: 4 }, tagWeights: { '大学': 2, '国际化': 2, '英语': 1 } }
    ]
  },

  // ===== 第16-20题：人格亚型辨识（新增） =====
  {
    id: 'q16',
    text: '你对「家」的定义更接近什么？',
    subtitle: '这决定了你是哪种定居型人格',
    options: [
      { label: '家是港湾——稳定的工作、靠谱的邻居、熟悉的菜市场', weights: { settle: 2.5 }, tagWeights: { '宜居': 2, '安全': 2, '传统': 1 } },
      { label: '家是作品——精心布置的空间、品质生活的展示', weights: { settle: 1.5, sojourn: 1 }, tagWeights: { '设计': 2, '品质生活': 2, '美学': 1 } },
      { label: '家是充电站——一个让我休息好再出发的地方', weights: { solo: 1.5, sojourn: 1 }, tagWeights: { '便利': 2, '高效': 1, '自由': 1 } },
      { label: '家是成长的土壤——需要学习资源和社交网络', weights: { exchange: 2, settle: 0.5 }, tagWeights: { '大学': 2, '国际化': 1, '教育': 1 } }
    ]
  },
  {
    id: 'q17',
    text: '你理想的工作/生活模式是？',
    subtitle: '数字游民还是办公室？',
    options: [
      { label: '稳定的全职工作，有清晰的职业路径和保障', weights: { settle: 2 }, tagWeights: { '品质生活': 2, '安全': 1, '经济': 1 } },
      { label: '远程工作或自由职业，今天在咖啡馆明天在图书馆', weights: { sojourn: 3 }, tagWeights: { '数字游民': 3, '咖啡': 1, '自由': 1 } },
      { label: '阶段性工作+阶段性旅行，工作是为了更好地玩', weights: { solo: 2, sojourn: 1.5 }, tagWeights: { '自由': 2, '探索': 2 } },
      { label: '学术研究或国际项目，在不同机构间流动', weights: { exchange: 3 }, tagWeights: { '大学': 2, '国际化': 2, '英语': 1 } }
    ]
  },
  {
    id: 'q18',
    text: '一个人旅行时，你最享受的是什么？',
    subtitle: '独旅也有不同风格',
    options: [
      { label: '全身心沉浸在异国文化中，像一个临时当地人', weights: { sojourn: 1.5, solo: 1 }, tagWeights: { '文化底蕴': 2, '慢生活': 2 } },
      { label: '挑战极限——跳伞、潜水、火山徒步，刺激最重要', weights: { solo: 3 }, tagWeights: { '探索': 2, '冒险': 3, '户外': 1 } },
      { label: '自由随性地穿梭城市，发现隐藏的小店和街头艺术', weights: { solo: 2.5 }, tagWeights: { '探索': 2, '艺术': 1, '自由': 1 } },
      { label: '在旅途中找到自我——安静地写日记、拍照、冥想', weights: { solo: 1.5, sojourn: 1 }, tagWeights: { '治愈': 2, '安静': 2, '自然': 1 } }
    ]
  },
  {
    id: 'q19',
    text: '学习/交流对你来说最重要的是什么？',
    subtitle: '交换不只是换学校，是换一种活法',
    options: [
      { label: '学术深度——想进入顶尖实验室或师从某位教授', weights: { exchange: 2.5 }, tagWeights: { '大学': 3, '教育': 2, '学术': 1 } },
      { label: '跨文化体验——和各国同学碰撞出不一样的火花', weights: { exchange: 2.5 }, tagWeights: { '国际化': 3, '多元文化': 2, '节庆': 1 } },
      { label: '职业跳板——积累国际经验，为未来铺路', weights: { exchange: 1.5, settle: 1 }, tagWeights: { '经济': 2, '国际化': 2, '金融': 1 } },
      { label: '语言沉浸——想真正掌握一门语言，不只是考试高分', weights: { exchange: 1.5, sojourn: 1 }, tagWeights: { '英语': 2, '双语': 2, '大学': 1 } }
    ]
  },
  {
    id: 'q20',
    text: '你对「变化」的态度是什么？',
    subtitle: '这道题决定你的城市人格底色',
    options: [
      { label: '喜欢稳定的节奏，变化太多会让我疲惫', weights: { settle: 2.5 }, tagWeights: { '宜居': 2, '安全': 2, '安静': 1 } },
      { label: '享受适度的变化——换个城市住几个月很兴奋但不适合永远漂泊', weights: { sojourn: 2.5 }, tagWeights: { '自由': 2, '探索': 1, '治愈': 1 } },
      { label: '变化就是我的舒适区——每半年换个地方才不无聊', weights: { solo: 2.5 }, tagWeights: { '探索': 3, '自由': 2 } },
      { label: '变化是成长的机会——每次改变都让我学到新东西', weights: { exchange: 2.5 }, tagWeights: { '国际化': 2, '大学': 2, '英语': 1 } }
    ]
  }
];

/**
 * Calculate category scores from user answers
 */
export function calculateScores(answers: Record<string, number>) {
  const scores: Record<ScoreKey, number> = { settle: 0, sojourn: 0, solo: 0, exchange: 0 };

  QUESTIONS.forEach((question) => {
    const selected = answers[question.id];
    if (selected === undefined) return;

    const option = question.options[selected];
    (Object.entries(option.weights) as [ScoreKey, number][]).forEach(([key, value]) => {
      scores[key] += value;
    });
  });

  return scores;
}

/**
 * Calculate tag scores from user answers for personalized matching
 */
export function calculateTagScores(answers: Record<string, number>): Record<string, number> {
  const tagScores: Record<string, number> = {};

  QUESTIONS.forEach((question) => {
    const selected = answers[question.id];
    if (selected === undefined) return;

    const option = question.options[selected];
    Object.entries(option.tagWeights).forEach(([tag, weight]) => {
      tagScores[tag] = (tagScores[tag] || 0) + weight;
    });
  });

  return tagScores;
}

/**
 * Get the dominant category
 */
export function getDominantCategory(scores: Record<ScoreKey, number>): ScoreKey {
  const entries = Object.entries(scores) as [ScoreKey, number][];
  return entries.reduce((best, current) =>
    current[1] > best[1] ? current : best
  , entries[0])[0];
}

/**
 * Calculate the percentage distribution across categories
 */
export function getCategoryDistribution(scores: Record<ScoreKey, number>): Record<ScoreKey, number> {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
  if (total === 0) return { settle: 25, sojourn: 25, solo: 25, exchange: 25 };

  const dist: Record<ScoreKey, number> = { settle: 0, sojourn: 0, solo: 0, exchange: 0 };
  (Object.entries(scores) as [ScoreKey, number][]).forEach(([key, value]) => {
    dist[key] = Math.round((value / total) * 100);
  });

  return dist;
}
