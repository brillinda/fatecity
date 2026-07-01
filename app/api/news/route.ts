import { NextResponse } from 'next/server';

type ReferenceEntry = {
  id: string;
  author: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  accessedAt: string;
};

type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  body: string;
  author: string;
  location: string;
  keywords: string[];
  link: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaCaption?: string;
  dateKey: string;
  citation: string;
  references: ReferenceEntry[];
};

const FALLBACK_IMAGES = {
  politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80',
  law: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
  science: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  business: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80',
  technology: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
  health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80',
  culture: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80',
  environment: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
  default: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80'
};

const WORD_TARGET = 660;
const WORD_MIN = 520;
const FEED_URL = 'https://feeds.bbci.co.uk/news/world/rss.xml';

const CATEGORY_CONTEXT: Record<string, string[]> = {
  politics: [
    'This article is useful for discussing policy, diplomacy, and public accountability in a contemporary setting.',
    'The reporting also helps learners compare factual information with the wider political context.'
  ],
  law: [
    'This article is useful for discussing legal process, institutional checks, and public accountability.',
    'The reporting also helps learners compare legal language with the practical consequences of policy change.'
  ],
  science: [
    'This article is useful for discussing evidence, research methods, and the relationship between data and public life.',
    'The reporting also helps learners examine how scientific findings are translated into everyday language.'
  ],
  business: [
    'This article is useful for discussing markets, trade, investment, and decision-making under uncertainty.',
    'The reporting also helps learners connect economic vocabulary to broader developments in society.'
  ],
  technology: [
    'This article is useful for discussing digital systems, innovation, regulation, and everyday consequences of technological change.',
    'The reporting also helps learners connect institutional language with practical examples in daily life.'
  ],
  health: [
    'This article is useful for discussing public health, medical advice, and risk communication in a changing environment.',
    'The reporting also helps learners compare scientific language with everyday explanations of health issues.'
  ],
  culture: [
    'This article is useful for discussing cultural institutions, public discourse, and the social meaning of current events.',
    'The reporting also helps learners connect language study with broader questions of identity and community.'
  ],
  environment: [
    'This article is useful for discussing climate, resource management, and the social impact of environmental change.',
    'The reporting also helps learners connect scientific data with policy and public action.'
  ],
  default: [
    'This article is useful for discussing current events, evidence, and the wider social context surrounding the story.',
    'The reporting also helps learners connect formal vocabulary with an accessible academic explanation.'
  ]
};

function stripHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(value: string) {
  return stripHtml(value).replace(/\s+/g, ' ').trim();
}

function extractTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? cleanText(match[1]) : '';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function truncateToWords(value: string, target: number) {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length <= target) {
    return value.trim();
  }
  return words.slice(0, target).join(' ').trim();
}

function splitSentences(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function dedupeSentences(sentences: string[]) {
  const seen = new Set<string>();
  return sentences.filter((sentence) => {
    const key = sentence.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return sentence.length >= 12;
  });
}

function extractPreview(value: string, limit = 22) {
  const clean = cleanText(value);
  if (!clean) {
    return clean;
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= limit) {
    return clean;
  }

  return words.slice(0, limit).join(' ');
}

function toDateKey(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function getYear(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().getFullYear();
  }
  return parsed.getFullYear();
}

function seededRandom(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return function next() {
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return (hash >>> 0) / 4294967296;
  };
}

function shuffleItems<T>(items: T[], seed: string) {
  const copy = [...items];
  const random = seededRandom(seed);

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }

  return copy;
}

function classifyArticle(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  if (/(iran|pakistan|ukraine|nato|diplomat|minister|president|government|policy|election|sanction|war|ceasefire|peace|treaty|security)/.test(text)) {
    return 'politics';
  }
  if (/(court|law|justice|legal|judge|regulation|policy|government|constitutional|congress)/.test(text)) {
    return 'law';
  }
  if (/(science|research|study|climate|energy|ocean|planet|medical|health|virus|hospital|disease|vaccine)/.test(text)) {
    return 'science';
  }
  if (/(business|market|economy|bank|company|trade|investment|finance|stock|cost|inflation|industry)/.test(text)) {
    return 'business';
  }
  if (/(tech|technology|ai|artificial intelligence|software|app|platform|digital|internet|algorithm|robot)/.test(text)) {
    return 'technology';
  }
  if (/(health|hospital|doctor|medicine|care|vaccin|patient|mental|wellbeing|nutrition)/.test(text)) {
    return 'health';
  }
  if (/(culture|music|film|festival|art|museum|language|heritage|fashion|society|community)/.test(text)) {
    return 'culture';
  }
  if (/(environment|climate|wildlife|flood|storm|emissions|carbon|pollution|ocean|forest|energy)/.test(text)) {
    return 'environment';
  }
  return 'default';
}

function getImageForCategory(category: string) {
  return FALLBACK_IMAGES[category as keyof typeof FALLBACK_IMAGES] ?? FALLBACK_IMAGES.default;
}

function buildReferenceEntry(title: string, author: string, source: string, publishedAt: string, url: string) {
  const accessedAt = new Date().toISOString();
  return {
    id: `ref-${slugify(title)}-${Date.parse(publishedAt) || Date.now()}`,
    author,
    title,
    source,
    publishedAt,
    url,
    accessedAt
  };
}

function buildAcademicCitation(title: string, source: string, author: string, publishedAt: string, url: string) {
  const year = getYear(publishedAt);
  return `${author || source}. (${year}). ${title}. ${source}. Available at: ${url}`;
}

function buildAcademicBody(title: string, summary: string, description: string, category: string, sourceName: string, authorName: string) {
  const safeTitle = cleanText(title);
  const safeSummary = cleanText(summary || description || safeTitle);
  const descriptionSentences = dedupeSentences(splitSentences(cleanText(description || safeSummary)));
  const contextSentences = CATEGORY_CONTEXT[category] ?? CATEGORY_CONTEXT.default;

  const bodySentences = [
    `${safeTitle} can be examined as a contemporary case study in how narratives, policy, and public response interact in real time.`,
    `The article reports that ${safeSummary.toLowerCase().startsWith('the') ? safeSummary : `the central issue is ${safeSummary}`}.`,
    `For a learner, the most useful elements are the main claim, the key actors, the evidence used, and the wider consequences that follow from the event.`,
    `The source material also helps readers notice how news writing moves from headline information to explanation, interpretation, and consequence.`,
    `According to ${sourceName}, this report is especially relevant because it connects specific developments with broader social, political, or economic trends.`,
    ...descriptionSentences.slice(0, 3).map((sentence) => `The report further states that ${sentence.toLowerCase()}`),
    ...contextSentences,
    `In academic terms, the article offers a clear example of how current affairs writing combines factual reporting with structured interpretation for a broad audience.`,
    `This makes it a strong study text for vocabulary acquisition, pronunciation practice, and discussion of complex ideas in English.`,
    `A careful reader should identify the central argument, separate evidence from opinion, and then reflect on the relevance of the story for public life.`,
    `The article therefore supports both comprehension practice and analytical reading, because it requires attention to detail, context, and the relationship between headline and implication.`
  ];

  let body = cleanText(bodySentences.join(' '));

  if (countWords(body) < WORD_MIN) {
    body = cleanText(`${body} ${bodySentences.join(' ')} ${authorName || sourceName} frames the story in a way that is useful for both close reading and guided discussion.`);
  }

  if (countWords(body) > WORD_TARGET) {
    body = truncateToWords(body, WORD_TARGET);
  }

  if (countWords(body) < WORD_MIN) {
    body = truncateToWords(`${body} ${safeTitle} is a strong learning text because it invites learners to examine the event, its significance, and the language used to describe it.`, WORD_TARGET);
  }

  return body;
}

function buildFallbackBody(title: string, summary: string, category: string, dateKey: string) {
  const safeTitle = cleanText(title);
  const safeSummary = extractPreview(summary, 18);
  const context = CATEGORY_CONTEXT[category] ?? CATEGORY_CONTEXT.default;
  const dailySignal = `The daily study version for ${dateKey} highlights a distinct perspective on current events.`;

  const bodySentences = [
    `${safeTitle} can be treated as a timely case study in how public issues are framed for a broad audience.`,
    `${safeSummary}.`,
    dailySignal,
    context[0],
    context[1],
    `For learners, the passage is valuable because it combines clear subject matter, formal vocabulary, and a strong discussion focus.`,
    `A useful study strategy is to identify the main claim, the key actors, and the most important evidence before discussing the wider implications.`,
    `This kind of text also supports note-taking, shadowing, and short reflections that connect current events to academic language.`
  ];

  let body = cleanText(bodySentences.join(' '));
  if (countWords(body) < WORD_MIN) {
    body = truncateToWords(`${body} The daily version is designed to remain distinct from previous study materials so that learners meet a fresh reading experience each day.`, WORD_TARGET);
  }

  return truncateToWords(body, WORD_TARGET);
}

function createFallbackArticles(dateKey: string) {
  const titles = [
    'Global climate talks shift toward stricter transport targets',
    'New legal guidance aims to protect workers in fast-growing gig platforms',
    'Researchers report a rise in urban heat stress among older residents',
    'A new AI tool helps hospitals triage emergency cases faster',
    'Trade ministers discuss a new customs pact to reduce shipping delays',
    'Local governments expand school programs on media literacy and digital safety',
    'A surge in offshore wind investment sparks a new round of maritime planning',
    'Public health teams warn about the spread of misinformation during seasonal outbreaks',
    'Cultural institutions launch partnerships to preserve endangered languages',
    'New data shows a modest improvement in global food security in coastal regions',
    'Central banks weigh a slower pace of interest-rate changes after recent inflation data',
    'A major science consortium publishes fresh research on marine biodiversity',
    'Newsrooms experiment with shorter video formats to improve audience retention',
    'Transport agencies test smarter traffic systems to reduce commute delays',
    'A regional agreement aims to strengthen emergency coordination after extreme weather',
    'Artists and policymakers debate the role of public spaces in modern cities',
    'Small businesses report stronger confidence after a drop in energy costs',
    'Experts call for stronger protections around personal data in education apps',
    'A new public campaign encourages citizens to report local infrastructure problems',
    'Analysts say the next decade will depend on clean energy and climate resilience'
  ];

  const shuffled = shuffleItems(titles, dateKey);

  return shuffled.map((title, index) => {
    const category = index % 5 === 0 ? 'politics' : index % 5 === 1 ? 'law' : index % 5 === 2 ? 'science' : index % 5 === 3 ? 'technology' : 'business';
    const summary = `${title} is a current example of how local and global decisions are affecting communities, institutions, and readers.`;
    const publishedAt = new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString();
    const reference = buildReferenceEntry(title, 'Renews Editorial Team', 'Daily News Desk', publishedAt, '#');

    return {
      id: `fallback-${index + 1}-${dateKey}`,
      title,
      summary,
      source: 'Daily News Desk',
      publishedAt,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      body: buildFallbackBody(title, summary, category, dateKey),
      author: 'Renews Editorial Team',
      location: 'Global',
      keywords: [category, 'current affairs', 'education'],
      link: '#',
      mediaUrl: getImageForCategory(category),
      mediaType: 'image',
      mediaCaption: 'A visual summary connected to the story.',
      dateKey: toDateKey(publishedAt),
      citation: `Renews Editorial Team. (${getYear(publishedAt)}). ${title}. Daily News Desk. Available at: #`,
      references: [reference]
    } satisfies NewsArticle;
  });
}

function extractMediaMetadata(itemXml: string, category: string) {
  const thumbnailUrl = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] ?? '';
  const contentUrl = itemXml.match(/<media:content[^>]*url="([^"]+)"/i)?.[1] ?? '';
  const mediaUrl = thumbnailUrl || contentUrl || getImageForCategory(category);

  return {
    mediaUrl,
    mediaCaption: mediaUrl === getImageForCategory(category)
      ? 'A visual summary connected to the story.'
      : 'Original image from BBC News • Source: BBC News'
  };
}

function parseFeed(xml: string, dateKey: string) {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));

  return items
    .map((item) => {
      const itemXml = item[1];
      const title = extractTag(itemXml, 'title');
      const description = extractTag(itemXml, 'description');
      const link = extractTag(itemXml, 'link');
      const pubDate = extractTag(itemXml, 'pubDate') || new Date().toISOString();
      const summary = extractPreview(description || title, 24);

      if (!title || !link) {
        return null;
      }

      const category = classifyArticle(title, summary);
      const sourceName = 'BBC World';
      const authorName = 'BBC World Desk';
      const { mediaUrl, mediaCaption } = extractMediaMetadata(itemXml, category);
      const reference = buildReferenceEntry(title, authorName, sourceName, pubDate, link);
      const citation = buildAcademicCitation(title, sourceName, authorName, pubDate, link);

      return {
        id: `rss-${slugify(title)}-${Date.parse(pubDate) || Date.now()}-${dateKey}`,
        title,
        summary,
        source: sourceName,
        publishedAt: pubDate,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        body: buildAcademicBody(title, summary, description, category, sourceName, authorName),
        author: authorName,
        location: 'World',
        keywords: ['international', 'world news'],
        link,
        mediaUrl,
        mediaType: 'image',
        mediaCaption,
        dateKey: toDateKey(pubDate),
        citation,
        references: [reference]
      } satisfies NewsArticle;
    })
    .filter(Boolean)
    .filter((article, index, list) => {
      const key = `${article?.title.toLowerCase()}-${article?.publishedAt}`;
      return list.findIndex((item) => item?.title.toLowerCase() === article?.title.toLowerCase()) === index;
    })
    .slice(0, 25);
}

export async function GET() {
  const dateKey = new Date().toISOString().slice(0, 10);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ articles: createFallbackArticles(dateKey), fetchedAt: new Date().toISOString() });
    }

    const xml = await response.text();
    const parsed = parseFeed(xml, dateKey);

    if (!parsed.length) {
      return NextResponse.json({ articles: createFallbackArticles(dateKey), fetchedAt: new Date().toISOString() });
    }

    const shuffled = shuffleItems(parsed, `${dateKey}-${parsed.length}`);

    return NextResponse.json({ articles: shuffled, fetchedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ articles: createFallbackArticles(dateKey), fetchedAt: new Date().toISOString() });
  }
}
