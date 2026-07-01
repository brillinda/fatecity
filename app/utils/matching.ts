import { CITIES, type City, type CityCategory } from '../data/cities';
import {
  calculateScores,
  calculateTagScores,
  getDominantCategory,
  getCategoryDistribution,
  QUESTIONS,
  type ScoreKey
} from '../data/questions';

// ======================== Personality Types (8 subtypes) ========================
export type PersonalityType = 'settle' | 'sojourn' | 'solo' | 'exchange';
export type PersonalitySubType =
  | 'settle_stable' | 'settle_quality'
  | 'sojourn_digital' | 'sojourn_cultural'
  | 'solo_adventurer' | 'solo_explorer'
  | 'exchange_academic' | 'exchange_social';

export interface PersonalityProfile {
  key: PersonalityType;
  subKey: PersonalitySubType;
  label: string;
  emoji: string;
  definition: string;
  colorClass: string;
}

export const SUBTYPE_MAP: Record<PersonalitySubType, { label: string; emoji: string; definition: string }> = {
  settle_stable: {
    label: '安稳筑巢者',
    emoji: '🏡',
    definition: '你追求的不是轰轰烈烈，而是把日子过成诗。熟悉的街道、靠谱的邻居、安心的生活——这是你心中的完美城市。'
  },
  settle_quality: {
    label: '品质筑巢者',
    emoji: '🏰',
    definition: '你对生活有审美要求。定居不只是安家，更是打造一个有质感的生活方式。好的设计、美的环境、高品质的日常，缺一不可。'
  },
  sojourn_digital: {
    label: '数字游牧者',
    emoji: '💻',
    definition: '你的办公室在咖啡馆、共享空间和海滩边。远程工作给了你自由，你用它来环游世界。'
  },
  sojourn_cultural: {
    label: '文艺游牧者',
    emoji: '🎨',
    definition: '你被文化和美驱动。每个城市对你来说不是景点打卡，而是深度沉浸——在老城小巷迷路、在独立书店淘书、在艺术馆发呆。'
  },
  solo_adventurer: {
    label: '冒险独旅者',
    emoji: '🗺️',
    definition: '你追求心跳加速的体验。跳伞、潜水、火山徒步——一个人的冒险让故事更精彩。'
  },
  solo_explorer: {
    label: '探索独旅者',
    emoji: '🔭',
    definition: '你是城市的解谜者。喜欢一个人穿梭于街头巷尾，发现那些旅行攻略不会写的地方。'
  },
  exchange_academic: {
    label: '学术探索者',
    emoji: '📚',
    definition: '你为知识和学术而来。顶尖的实验室、经典的图书馆、和大师对话——这是你选择的交换生活。'
  },
  exchange_social: {
    label: '社交探索者',
    emoji: '🌐',
    definition: '交换对你来说不只是学习，更是融入全球社群。交世界各地的朋友、参加文化节、在多元碰撞中成长。'
  }
};

/** Determine the subtype based on tag scores within a dominant category */
export function getPersonalitySubType(
  dominant: PersonalityType,
  tagScores: Record<string, number>
): PersonalitySubType {
  switch (dominant) {
    case 'settle': {
      const stable = (tagScores['安全'] || 0) + (tagScores['传统'] || 0) + (tagScores['宜居'] || 0);
      const quality = (tagScores['设计'] || 0) + (tagScores['品质生活'] || 0) + (tagScores['美学'] || 0);
      return stable >= quality ? 'settle_stable' : 'settle_quality';
    }
    case 'sojourn': {
      const digital = (tagScores['数字游民'] || 0) + (tagScores['性价比'] || 0) + (tagScores['咖啡'] || 0);
      const cultural = (tagScores['艺术'] || 0) + (tagScores['文化底蕴'] || 0) + (tagScores['美学'] || 0) + (tagScores['复古'] || 0);
      return digital >= cultural ? 'sojourn_digital' : 'sojourn_cultural';
    }
    case 'solo': {
      const adventurer = (tagScores['冒险'] || 0) + (tagScores['户外'] || 0) + (tagScores['自然'] || 0);
      const explorer = (tagScores['探索'] || 0) + (tagScores['艺术'] || 0) + (tagScores['夜生活'] || 0) + (tagScores['美食'] || 0);
      return adventurer >= explorer ? 'solo_adventurer' : 'solo_explorer';
    }
    case 'exchange': {
      const academic = (tagScores['学术'] || 0) + (tagScores['教育'] || 0) + (tagScores['大学'] || 0);
      const social = (tagScores['国际化'] || 0) + (tagScores['多元文化'] || 0) + (tagScores['节庆'] || 0);
      return academic >= social ? 'exchange_academic' : 'exchange_social';
    }
  }
}

/** Get the full personality profile */
export function getPersonality(
  dominant: PersonalityType,
  tagScores: Record<string, number>
): PersonalityProfile {
  const subKey = getPersonalitySubType(dominant, tagScores);
  const sub = SUBTYPE_MAP[subKey];
  return {
    key: dominant,
    subKey,
    label: sub.label,
    emoji: sub.emoji,
    definition: sub.definition,
    colorClass: `cat-${dominant}`
  };
}

// Simple category info for display purposes
export const CATEGORY_INFO: Record<PersonalityType, { label: string; emoji: string; colorClass: string }> = {
  settle: { label: '筑巢者', emoji: '🏡', colorClass: 'cat-settle' },
  sojourn: { label: '游牧者', emoji: '🌿', colorClass: 'cat-sojourn' },
  solo: { label: '独旅者', emoji: '🎒', colorClass: 'cat-solo' },
  exchange: { label: '探索者', emoji: '🎓', colorClass: 'cat-exchange' }
};

// Legacy compatibility alias
export const PERSONALITY_MAP = CATEGORY_INFO;

// ======================== Key Choice Review Mapping ========================
// Maps specific questions to city features for "why this city suits you"
export interface KeyChoiceReview {
  questionText: string;
  userChoice: string;
  cityFeature: string;
  matchReason: string;
}

const KEY_QUESTION_IDS = ['q1', 'q2', 'q7', 'q8', 'q10', 'q11', 'q15'];

const CITY_FEATURE_MAPPING: Record<string, (city: City) => string> = {
  q1: (city) => {
    // Weekend vibe → city atmosphere
    if (city.tags.some(t => ['慢生活', '安静', '咖啡'].includes(t))) return '悠闲的生活节奏与你的周末理想完美契合';
    if (city.tags.some(t => ['探索', '自由'].includes(t))) return '充满探索感的街区满足你的好奇心';
    if (city.tags.some(t => ['国际化', '多元文化'].includes(t))) return '国际化的社交场景让每个周末都有新鲜事';
    return '丰富的城市体验让你每个周末都有新玩法';
  },
  q2: (city) => {
    // Heart-fluttering moment → city mood
    if (city.tags.some(t => ['包容', '宜居'].includes(t))) return '充满人情味的社区氛围让你感受到家的温暖';
    if (city.tags.some(t => ['阳光', '美学', '复古'].includes(t))) return '慢时光的美学让你的每一天都有电影感';
    if (city.tags.some(t => ['夜生活', '自由'].includes(t))) return '夜晚的城市灯火让你感到无限自由';
    return '多元文化碰撞出的火花让你每天都心动';
  },
  q7: (city) => {
    // Food → food scene
    if (city.tags.includes('美食')) return '丰富到令人选择困难的美食版图等你来探索';
    if (city.tags.includes('夜市')) return '街头美食和夜市文化让你从早吃到晚';
    return '独特的地方味道让每一餐都是文化体验';
  },
  q8: (city) => {
    // Transportation
    if (city.tags.includes('公共交通')) return '高效便捷的交通系统让你畅行无阻';
    if (city.tags.includes('步行城市') || city.tags.includes('自行车')) return '步行/骑行友好的城市设计让你零距离感受城市';
    return '灵活的出行方式契合你的探索节奏';
  },
  q10: (city) => {
    // Nighttime
    if (city.tags.includes('夜生活')) return '丰富的夜间文化让你的城市之夜精彩纷呈';
    if (city.tags.includes('安全')) return '安全可靠的夜间环境让你安心享受夜晚';
    return '夜晚的安全感让你可以尽情沉浸在城市的夜色中';
  },
  q11: (city) => {
    // Nature
    if (city.tags.some(t => ['自然', '海滩', '山景', '公园城市'].includes(t))) return '触手可及的自然风光让你随时充电';
    return '城市中的绿意空间平衡了都市与自然';
  },
  q15: (city) => {
    // Ultimate goal → overall match
    return '这座城市与你的生活理想高度契合，是你此刻的最佳选择';
  }
};

export function generateKeyChoices(
  answers: Record<string, number>,
  city: City
): KeyChoiceReview[] {
  const reviews: KeyChoiceReview[] = [];

  KEY_QUESTION_IDS.forEach((qId) => {
    const answerIndex = answers[qId];
    if (answerIndex === undefined) return;

    const question = QUESTIONS.find((q) => q.id === qId);
    if (!question) return;

    const userChoice = question.options[answerIndex].label;
    const featureFn = CITY_FEATURE_MAPPING[qId];
    const matchReason = featureFn ? featureFn(city) : '与你的选择完美匹配';

    reviews.push({
      questionText: question.text,
      userChoice,
      cityFeature: matchReason,
      matchReason
    });
  });

  return reviews;
}

// ======================== Why This City (3 personalized reasons) ========================
export function generateMatchReasons(
  answers: Record<string, number>,
  city: City,
  category: CityCategory
): string[] {
  const reasons: string[] = [];
  const tagScores = calculateTagScores(answers);
  const userTags = Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  // Reason 1: Tag overlap
  const matchingTags = city.tags.filter((t) => userTags.includes(t));
  if (matchingTags.length >= 3) {
    reasons.push(
      `气质契合：你对「${matchingTags.slice(0, 2).join('」和「')}」的偏爱，正是${city.name}的城市底色。这里有${matchingTags.length}个与你共鸣的城市标签。`
    );
  } else {
    reasons.push(
      `气质契合：${city.name}的生活方式与你高度一致，你的选择透露了你对${city.tags.slice(0, 2).join('和')}的向往。`
    );
  }

  // Reason 2: Category-specific
  const categoryReasons: Record<CityCategory, string> = {
    settle: `${city.name}拥有稳定的公共服务、优质的医疗教育资源，以及让${PERSONALITY_MAP.settle.label}感到安心的社区氛围。`,
    sojourn: `${city.name}是数字游民和慢旅行者的理想目的地——适中的生活成本、丰富的文化体验和舒适的节奏。`,
    solo: `${city.name}以安全便利著称，一人食、一人游、一人探索——独自旅行在这里不是妥协而是享受。`,
    exchange: `${city.name}拥有国际化的学术环境和活跃的学生社群，让你在学习和探索中快速成长。`
  };
  reasons.push(categoryReasons[category]);

  // Reason 3: Hidden gem tease
  reasons.push(
    `隐藏宝藏：${city.name}有本地人才知道的秘密——比如${city.hiddenGems[0].split('——')[0]}，这些是旅行攻略不会告诉你的惊喜。`
  );

  return reasons;
}

// ======================== Main Matching Engine ========================
export interface CityMatch extends City {
  matchScore: number;
  categoryScore: number;
  tagMatchCount: number;
  category: CityCategory;
}

export interface QuizResult {
  scores: Record<ScoreKey, number>;
  distribution: Record<ScoreKey, number>;
  personality: PersonalityProfile;
  userTags: string[];
  recommendations: {
    settle: CityMatch[];
    sojourn: CityMatch[];
    solo: CityMatch[];
    exchange: CityMatch[];
  };
  topPicks: CityMatch[];
}

export function matchCities(answers: Record<string, number>): QuizResult {
  const scores = calculateScores(answers);
  const tagScores = calculateTagScores(answers);
  const distribution = getCategoryDistribution(scores);
  const dominantCategory = getDominantCategory(scores);
  const personality = getPersonality(dominantCategory, tagScores);

  const userTags = Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  const recommendations: Record<ScoreKey, CityMatch[]> = {
    settle: [],
    sojourn: [],
    solo: [],
    exchange: []
  };

  const categories: ScoreKey[] = ['settle', 'sojourn', 'solo', 'exchange'];

  // Each city goes to exactly ONE category (its highest affinity)
  const cityBestCategory = new Map<string, ScoreKey>();
  CITIES.forEach((city) => {
    let bestCat: ScoreKey = 'settle';
    let bestAff = 0;
    categories.forEach((cat) => {
      if (city.affinity[cat] > bestAff) {
        bestAff = city.affinity[cat];
        bestCat = cat;
      }
    });
    cityBestCategory.set(city.id, bestCat);
  });

  // Add each city only to its best category
  CITIES.forEach((city) => {
    const bestCat = cityBestCategory.get(city.id)!;
    if (city.affinity[bestCat] >= 4) {
      const match = calculateCityMatch(city, bestCat, scores[bestCat], tagScores);
      recommendations[bestCat].push(match);
    }
  });

  categories.forEach((cat) => {
    recommendations[cat].sort((a, b) => b.matchScore - a.matchScore);
  });

  const topPicks = selectTopPicks(recommendations);

  return {
    scores,
    distribution,
    personality,
    userTags,
    recommendations,
    topPicks
  };
}

function calculateCityMatch(
  city: City,
  category: CityCategory,
  categoryScore: number,
  tagScores: Record<string, number>
): CityMatch {
  const maxCategoryScore = 44;
  const categoryNormalized = Math.min(categoryScore / Math.max(maxCategoryScore, 1), 1);
  const affinityScore = city.affinity[category] / 10;
  const categoryMatch = (categoryNormalized * 0.6 + affinityScore * 0.4) * 50;

  let tagMatchScore = 0;
  let tagMatchCount = 0;
  const maxTagScore = Math.max(...Object.values(tagScores), 1);

  city.tags.forEach((tag) => {
    if (tagScores[tag]) {
      tagMatchScore += Math.min(tagScores[tag] / maxTagScore, 1);
      tagMatchCount++;
    }
  });

  const tagDensity = Math.min(tagMatchCount / 5, 1);
  const tagScore = (tagMatchScore / Math.max(city.tags.length / 4, 1)) * 50;
  const finalTagScore = tagScore * 0.5 + tagDensity * 25;
  const matchScore = Math.round(categoryMatch + finalTagScore);

  return {
    ...city,
    matchScore: Math.min(matchScore, 100),
    categoryScore: Math.round(affinityScore * 100),
    tagMatchCount,
    category
  };
}

/** Pick top 2 unique cities per category, then sort globally by matchScore */
function selectTopPicks(recommendations: Record<ScoreKey, CityMatch[]>): CityMatch[] {
  const usedCityIds = new Set<string>();
  const picks: CityMatch[] = [];
  const categories: ScoreKey[] = ['settle', 'sojourn', 'solo', 'exchange'];

  categories.forEach((cat) => {
    const available = recommendations[cat].filter((c) => !usedCityIds.has(c.id));
    const topTwo = available.slice(0, 2);
    topTwo.forEach((c) => {
      picks.push(c);
      usedCityIds.add(c.id);
    });
  });

  // Sort globally by matchScore descending
  picks.sort((a, b) => b.matchScore - a.matchScore);
  return picks;
}

export function generateSummary(result: QuizResult): string {
  const { personality, distribution } = result;
  const traitLabels = result.userTags
    .slice(0, 3)
    .map((t) => `「${t}」`)
    .join('');

  return `你的城市人格是${personality.emoji}「${personality.label}」${traitLabels}。` +
    `${personality.definition}`;
}

// ======================== Friend Matching ========================
export interface FriendMatchResult {
  city1: string;       // user's top city name
  city2: string;       // friend's top city name
  sharedTags: string[];
  compatibility: number;  // 0-100
  togetherCity: {
    name: string;
    nameEn: string;
    countryFlag: string;
    image: string;
    reason: string;
  };
}

export function matchFriends(
  result1: QuizResult,
  result2: QuizResult
): FriendMatchResult {
  const tags1 = new Set(result1.userTags);
  const tags2 = new Set(result2.userTags);
  const sharedTags = [...tags1].filter((t) => tags2.has(t));

  // Compatibility based on shared tags + personality adjacency
  const tagScore = sharedTags.length / Math.max(tags1.size, tags2.size, 1);
  const personalityCompatibility = result1.personality.key === result2.personality.key ? 0.3 : 0.1;
  const compatibility = Math.round((tagScore * 0.7 + personalityCompatibility) * 100);

  // Find a city both might enjoy
  const city1Top = result1.topPicks[0];
  const city2Top = result2.topPicks[0];

  // Find a city that ranks high for both
  let togetherCity = city1Top;

  // Try all cities and find one with the highest combined match
  let bestCombined = 0;
  CITIES.forEach((city) => {
    // Find this city in both users' top picks
    const inResult1 = [
      ...result1.recommendations.settle,
      ...result1.recommendations.sojourn,
      ...result1.recommendations.solo,
      ...result1.recommendations.exchange
    ].find((m) => m.id === city.id);

    const inResult2 = [
      ...result2.recommendations.settle,
      ...result2.recommendations.sojourn,
      ...result2.recommendations.solo,
      ...result2.recommendations.exchange
    ].find((m) => m.id === city.id);

    if (inResult1 && inResult2) {
      const combined = inResult1.matchScore + inResult2.matchScore;
      if (combined > bestCombined) {
        bestCombined = combined;
        togetherCity = inResult1;
      }
    }
  });

  return {
    city1: city1Top.name,
    city2: city2Top.name,
    sharedTags,
    compatibility: Math.min(compatibility, 100),
    togetherCity: {
      name: togetherCity.name,
      nameEn: togetherCity.nameEn,
      countryFlag: togetherCity.countryFlag,
      image: togetherCity.image,
      reason: `${togetherCity.name}兼容了${result1.personality.label}和${result2.personality.label}的特质——${sharedTags.length > 0 ? `你们共享${sharedTags.length}个城市偏好标签，` : ''}在这里你们都能找到自己的节奏。`
    }
  };
}

// ======================== Storage Helpers ========================
const STORAGE_KEY = 'fate_city_result';
const FRIEND_KEY = 'fate_city_friend';

export function saveResult(result: QuizResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch { /* quota exceeded, ignore */ }
}

export function loadResult(): QuizResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveFriendResult(result: QuizResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FRIEND_KEY, JSON.stringify(result));
  } catch { /* ignore */ }
}

export function loadFriendResult(): QuizResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FRIEND_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
