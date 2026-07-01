'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { QUESTIONS, type ScoreKey } from './data/questions';
import { type CityCategory } from './data/cities';
import {
  matchCities,
  generateSummary,
  generateKeyChoices,
  generateMatchReasons,
  PERSONALITY_MAP,
  matchFriends,
  saveResult,
  loadResult,
  saveFriendResult,
  loadFriendResult,
  type QuizResult,
  type CityMatch,
  type PersonalityType,
  type KeyChoiceReview,
  type FriendMatchResult
} from './utils/matching';

type Phase = 'quiz' | 'locked' | 'result' | 'friend';

const CATEGORY_ORDER: CityCategory[] = ['settle', 'sojourn', 'solo', 'exchange'];
const MAX_USES = 2;
const STORAGE_KEY_USED = 'fatecity_credits';
const VALID_CODES = ['FATE2025', 'CITY888', 'MINGYUN'];

function getCredits(): number {
  if (typeof window === 'undefined') return 1;
  const v = parseInt(localStorage.getItem(STORAGE_KEY_USED) || '1', 10);
  return isNaN(v) ? 1 : v;
}

function setCredits(n: number) {
  localStorage.setItem(STORAGE_KEY_USED, String(n));
}

function useCredit(): number {
  const c = getCredits() - 1;
  setCredits(Math.max(0, c));
  return Math.max(0, c);
}

function addCredit() {
  setCredits(getCredits() + 1);
}

// ======================== Main Component ========================
export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [friendMode, setFriendMode] = useState(false);
  const [friendResult, setFriendResult] = useState<QuizResult | null>(null);
  const [friendMatch, setFriendMatch] = useState<FriendMatchResult | null>(null);
  const [credits, setCreditsState] = useState(1);
  const [invited, setInvited] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  // Check credits on mount
  useEffect(() => {
    const c = getCredits();
    setCreditsState(c);
    if (c <= 0) {
      setPhase('locked');
      return;
    }
    const saved = loadResult();
    if (saved) {
      setResult(saved);
      setPhase('result');
    }
  }, []);

  const handleSelect = useCallback((questionId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }, []);

  // Complete quiz → use 1 credit
  const handleComplete = () => {
    if (!allAnswered) return;
    if (credits <= 0) {
      setPhase('locked');
      return;
    }
    const matched = matchCities(answers);
    setResult(matched);
    saveResult(matched);
    const remaining = useCredit();
    setCreditsState(remaining);
    setPhase('result');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Invite friend → +1 credit
  const handleInviteFriend = () => {
    addCredit();
    setCreditsState((c) => c + 1);
    setInvited(true);
    const shareText = '🌍 我刚测了命定城市，发现我的城市人格超准！\n64座城市·8种人格·20道题\n你也来测测？ https://fatecity.cn';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('✅ 链接已复制！发给朋友吧～你已获得 +1 次免费测试！');
      }).catch(() => alert(shareText));
    }
  };

  // Unlock code
  const handleUnlockCode = () => {
    const code = prompt('请输入在小红书购买的解锁码：');
    if (!code) return;
    if (VALID_CODES.includes(code.toUpperCase().trim())) {
      setCredits(999);
      setCreditsState(999);
      setPhase('quiz');
      setAnswers({});
      setResult(null);
      alert('✅ 解锁成功！你现在可以无限次测试了！');
    } else {
      alert('❌ 解锁码无效，请确认后重试。如需购买请前往小红书搜索「命定城市」。');
    }
  };

  // Share card
  const handleShare = () => {
    setShowShareCard(true);
  };

  // Friend matching
  const handleStartFriendMatch = () => {
    setFriendMode(true);
    const saved = loadFriendResult();
    if (saved) setFriendResult(saved);
  };

  const handleReset = () => {
    if (credits <= 0) {
      setPhase('locked');
      return;
    }
    setAnswers({});
    setResult(null);
    setPhase('quiz');
    setExpandedCity(null);
    setShowShareCard(false);
    setFriendMode(false);
    setFriendResult(null);
    setFriendMatch(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fate_city_result');
    }
  };

  const personality = result?.personality ?? null;

  return (
    <main className="fate-shell">
      {/* ===== Locked Screen ===== */}
      {phase === 'locked' && <LockedScreen onUnlock={handleUnlockCode} />}

      {/* ===== Hero ===== */}
      {phase !== 'locked' && (
        <HeroSection phase={phase} personality={personality} credits={credits} />
      )}

      {/* ===== Progress Bar ===== */}
      {phase === 'quiz' && (
        <ProgressBar answeredCount={answeredCount} total={QUESTIONS.length} progress={progress} />
      )}

      {/* ===== Questions ===== */}
      {phase === 'quiz' && (
        <section className="fate-questions">
          {QUESTIONS.map((question, qi) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={qi}
              selectedIndex={answers[question.id]}
              onSelect={handleSelect}
            />
          ))}
        </section>
      )}

      {/* ===== Quiz Actions ===== */}
      {phase === 'quiz' && (
        <div className="fate-actions">
          <button
            className="fate-btn primary"
            onClick={handleComplete}
            disabled={!allAnswered}
          >
            {allAnswered ? `✨ 查看我的城市人格（剩余 ${credits} 次）` : `还差 ${QUESTIONS.length - answeredCount} 题`}
          </button>
          {answeredCount > 0 && (
            <button className="fate-btn ghost" onClick={handleReset}>
              重新开始
            </button>
          )}
        </div>
      )}

      {/* ===== Full Result ===== */}
      {phase === 'result' && result && (
        <FullResult
          result={result}
          answers={answers}
          expandedCity={expandedCity}
          setExpandedCity={setExpandedCity}
          showShareCard={showShareCard}
          onShare={handleShare}
          onStartFriendMatch={handleStartFriendMatch}
          onReset={handleReset}
          shareCardRef={shareCardRef}
          resultRef={resultRef}
          credits={credits}
          invited={invited}
          onInviteFriend={handleInviteFriend}
        />
      )}

      {/* ===== Friend Match Phase ===== */}
      {(friendMode || phase === 'friend') && result && (
        <FriendMatchSection
          result={result}
          friendResult={friendResult}
          setFriendResult={setFriendResult}
          friendMatch={friendMatch}
          onComplete={() => {}}
          onClose={() => { setFriendMode(false); setPhase('result'); }}
        />
      )}

      {/* ===== Share Card Overlay ===== */}
      {showShareCard && result && result.topPicks[0] && (
        <ShareCardOverlay
          result={result}
          topPick={result.topPicks[0]}
          shareCardRef={shareCardRef}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </main>
  );
}

// ======================== Sub-Components ========================

function HeroSection({ phase, personality, credits }: { phase: Phase; personality: QuizResult['personality'] | null; credits?: number }) {
  if (phase === 'quiz') {
    return (
      <section className="fate-hero">
        <div className="fate-hero-text">
          <span className="chip">✨ 命定城市 · 人格测试</span>
          <h1 className="fate-title">
            20 道题，
            <br />
            发现你的<span className="text-accent">8种城市人格</span>
          </h1>
          <p className="fate-subtitle">
            你是安稳筑巢者还是冒险独旅者？是数字游牧者还是学术探索者？
            基于生活方式、价值观与旅行偏好，从 64 座全球城市中为你精准匹配。
          </p>
          <div className="fate-hero-stats">
            <div className="hero-stat"><strong>64</strong><span>全球城市</span></div>
            <div className="hero-stat"><strong>8</strong><span>人格类型</span></div>
            <div className="hero-stat"><strong>{(credits ?? 1) > 99 ? '∞' : (credits ?? 1)}次</strong><span>剩余次数</span></div>
          </div>
        </div>
        <div className="fate-hero-visual">
          <div className="hero-float-card card-1">🏡 安稳筑巢者</div>
          <div className="hero-float-card card-2">💻 数字游牧者</div>
          <div className="hero-float-card card-3">🎨 文艺游牧者</div>
          <div className="hero-float-card card-4">🗺️ 冒险独旅者</div>
          <div className="hero-float-card card-5">🔭 探索独旅者</div>
          <div className="hero-float-card card-6">📚 学术探索者</div>
          <div className="hero-float-card card-7">🌐 社交探索者</div>
          <div className="hero-float-card card-8">🏰 品质筑巢者</div>
          <div className="hero-compass">
            <div className="compass-ring" />
            <div className="compass-dot" />
          </div>
        </div>
      </section>
    );
  }

  if (personality && phase === 'result') {
    return (
      <section className="fate-hero fate-hero-result">
        <div className="fate-hero-text">
          <span className="chip large">
            {personality.emoji} 你的城市人格 · {personality.label}
          </span>
          <h1 className="fate-title fate-title-sm">
            你是<span className={`text-accent cat-text-${personality.key}`}>{personality.label}</span>
          </h1>
          <p className="fate-subtitle">{personality.definition}</p>
        </div>
      </section>
    );
  }

  if (phase === 'friend' && personality) {
    return (
      <section className="fate-hero fate-hero-result">
        <div className="fate-hero-text">
          <span className="chip large">🤝 好友匹配度</span>
          <h1 className="fate-title fate-title-sm">你们最适合一起旅行的城市</h1>
        </div>
      </section>
    );
  }

  return null;
}

function ProgressBar({ answeredCount, total, progress }: { answeredCount: number; total: number; progress: number }) {
  return (
    <section className="fate-progress-bar-wrap">
      <div className="fate-progress-info">
        <span>答题进度</span>
        <span>{answeredCount}/{total} · {progress}%</span>
      </div>
      <div className="fate-progress-track">
        <div className="fate-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  index,
  selectedIndex,
  onSelect
}: {
  question: typeof QUESTIONS[0];
  index: number;
  selectedIndex: number | undefined;
  onSelect: (id: string, index: number) => void;
}) {
  return (
    <article className={`fate-question-card ${selectedIndex !== undefined ? 'answered' : ''}`}>
      <div className="fate-q-header">
        <span className="fate-q-num">{index + 1}</span>
        <div>
          <h2 className="fate-q-text">{question.text}</h2>
          {question.subtitle && <p className="fate-q-sub">{question.subtitle}</p>}
        </div>
      </div>
      <div className="fate-options">
        {question.options.map((option, oi) => {
          const selected = selectedIndex === oi;
          return (
            <button
              key={oi}
              className={`fate-option ${selected ? 'picked' : ''}`}
              onClick={() => onSelect(question.id, oi)}
            >
              <span className={`fate-radio ${selected ? 'on' : ''}`}>
                {selected && <span className="fate-radio-dot" />}
              </span>
              <span className="fate-option-text">{option.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}


// ======================== Locked Screen ========================
function LockedScreen({ onUnlock }: { onUnlock: () => void }) {
  const handleCopy = () => {
    const shareText = '🌍 我刚测了命定城市，发现我的城市人格超准！\n64座城市·8种人格·20道题\n你也来测测？ https://fatecity.cn';
    try {
      navigator.clipboard.writeText(shareText);
      alert('✅ 链接已复制！发给朋友一起测吧~');
    } catch { prompt('复制链接：', shareText); }
  };

  return (
    <main className="fate-shell">
      <section className="fate-hero" style={{ textAlign: 'center' as const }}>
        <div className="fate-hero-text" style={{ maxWidth: 520, margin: '0 auto' }}>
          <span className="chip large">{'🔒 次数已用完'}</span>
          <h1 className="fate-title fate-title-sm" style={{ marginTop: 20 }}>
            {'你还想探索更多'}<br /><span className="text-accent">{'命定城市'}</span>{'吗？'}
          </h1>
          <p className="fate-subtitle">
            {'免费次数已用完。前往小红书搜索「命定城市」购买解锁码，即可无限次测试。'}
          </p>
          <div className="fate-locked-box">
            <p className="locked-red-title">{'📕 小红书搜：'}<span>{'命定城市'}</span></p>
            <p className="locked-red-desc">{'购买后获得解锁码，输入即可无限测试'}</p>
            <button className="fate-btn primary" onClick={onUnlock} style={{ marginBottom: 12 }}>
              {'🔑 输入解锁码'}
            </button>
            <button className="fate-btn secondary" onClick={handleCopy}>
              {'📋 复制链接分享给朋友（朋友可免费测）'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

// ======================== Full Result ========================
function FullResult({
  result,
  answers,
  expandedCity,
  setExpandedCity,
  showShareCard,
  onShare,
  onStartFriendMatch,
  onReset,
  shareCardRef,
  credits,
  invited,
  onInviteFriend,
  resultRef
}: {
  result: QuizResult;
  answers: Record<string, number>;
  expandedCity: string | null;
  setExpandedCity: (id: string | null) => void;
  showShareCard: boolean;
  onShare: () => void;
  onStartFriendMatch: () => void;
  onReset: () => void;
  shareCardRef: React.Ref<HTMLDivElement>;
  resultRef: React.Ref<HTMLDivElement>;
  credits: number;
  invited: boolean;
  onInviteFriend: () => void;
}) {
  const { personality, distribution, topPicks, recommendations } = result;
  const summary = generateSummary(result);

  return (
    <div ref={resultRef} className="fate-results">
      {/* Summary Card */}
      <section className="fate-summary-card">
        <div className="fate-summary-header">
          <span className="chip large">{personality.emoji} {personality.label}型人格</span>
          <h2>{summary.split('。')[0]}</h2>
          <p className="fate-summary-body">{summary.split('。').slice(1).join('。')}</p>
        </div>
        <div className="fate-distribution">
          {CATEGORY_ORDER.map((cat) => {
            const prof = PERSONALITY_MAP[cat];
            const isMain = cat === personality.key;
            return (
              <div key={cat} className={`fate-dist-item ${isMain ? 'main' : ''}`}>
                <div className="fate-dist-label">
                  <span>{prof.emoji}</span>
                  <span>{prof.label}{isMain ? ' 👈' : ''}</span>
                </div>
                <div className="fate-dist-bar-wrap">
                  <div className={`fate-dist-bar ${prof.colorClass}`} style={{ width: `${distribution[cat]}%` }} />
                </div>
                <span className="fate-dist-pct">{distribution[cat]}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top 4 City Picks */}
      <section className="fate-top-picks">
        <h2 className="fate-section-title">
          <span className="chip">📍</span> 你的 8 个命定城市
        </h2>
        <div className="fate-top-grid fate-top-grid-8">
          {topPicks.map((cityMatch) => {
            const cityKey = `${cityMatch.id}-${cityMatch.category}`;
            const keyChoices = generateKeyChoices(answers, cityMatch);
            const reasons = generateMatchReasons(answers, cityMatch, cityMatch.category);
            return (
              <FullCityCard
                key={cityKey}
                match={cityMatch}
                expanded={expandedCity === cityKey}
                onToggle={() => setExpandedCity(expandedCity === cityKey ? null : cityKey)}
                keyChoices={keyChoices}
                reasons={reasons}
              />
            );
          })}
        </div>
      </section>

      {/* Social + Invite */}
      <section className="fate-social-section">
        {!invited && credits <= 1 && (
          <div className="fate-share-cta" style={{ marginBottom: 16 }}>
            <h3>🎁 邀请好友，再得一次免费测试</h3>
            <p>复制链接发给朋友，你立即获得 +1 次测试机会</p>
            <button className="fate-btn primary" onClick={onInviteFriend}>
              📋 复制邀请链接（+1次）
            </button>
          </div>
        )}
        <div className="fate-share-cta">
          <h3>📤 分享你的城市人格卡片</h3>
          <p>生成专属卡片发朋友圈，看看朋友是什么人格</p>
          <button className="fate-btn secondary" onClick={onShare}>
            生成分享卡片
          </button>
          <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--muted)' }}>
            🔔 剩余测试次数：<strong>{credits > 99 ? '∞' : credits}</strong>
          </p>
        </div>
      </section>

      {/* Alternative Cities — always visible */}
      <section className="fate-alt-picks">
          <h2 className="fate-section-title">
            <span className="chip">🔍</span> 更多推荐选择
          </h2>
          {CATEGORY_ORDER.map((cat) => {
            const prof = PERSONALITY_MAP[cat];
            const altCities = recommendations[cat].filter(
              (c) => !topPicks.find((t) => t.id === c.id && t.category === c.category)
            );
            if (altCities.length === 0) return null;
            return (
              <div key={cat} className="fate-alt-category">
                <h3 className="fate-alt-cat-title">
                  {prof.emoji} {prof.label} — 备选城市
                </h3>
                <div className="fate-alt-scroll">
                  {altCities.slice(0, 4).map((cm) => (
                    <div key={`${cm.id}-${cat}`} className="fate-alt-card">
                      <div className="fate-alt-img" style={{ backgroundImage: `url(${cm.image})` }}>
                        <div className="fate-alt-img-overlay">
                          <span className="fate-alt-name">{cm.countryFlag} {cm.name}</span>
                          <span className="fate-alt-match">{cm.matchScore}% 匹配</span>
                        </div>
                      </div>
                      <div className="fate-alt-info">
                        <p className="fate-alt-desc">{cm.description.slice(0, 80)}…</p>
                        <div className="fate-alt-tags">
                          {cm.tags.slice(0, 3).map((t) => <span key={t} className="mini-tag">{t}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

      {/* Friend Match CTA */}
      <section className="fate-friend-cta">
        <h2 className="fate-section-title">
          <span className="chip">🤝</span> 看看你和朋友的匹配度
        </h2>
        <p>邀请好友也测一测，系统会对比你们的城市人格，推荐「最适合一起旅行的城市」。</p>
        <button className="fate-btn secondary" onClick={onStartFriendMatch}>
          开始好友匹配
        </button>
      </section>

      {/* Reset */}
      <div className="fate-actions">
        <button className="fate-btn ghost" onClick={onReset}>🔄 重新测试</button>
      </div>
    </div>
  );
}

// ======================== Full City Card ========================
function FullCityCard({
  match,
  expanded,
  onToggle,
  keyChoices,
  reasons
}: {
  match: CityMatch;
  expanded: boolean;
  onToggle: () => void;
  keyChoices: KeyChoiceReview[];
  reasons: string[];
}) {
  const catLabel = PERSONALITY_MAP[match.category];

  return (
    <div className={`city-card ${expanded ? 'expanded' : ''}`}>
      <div className="city-card-img" style={{ backgroundImage: `url(${match.image})` }}>
        <div className="city-card-img-overlay">
          <div className="city-card-badge">
            {catLabel.emoji} {catLabel.label}型
          </div>
          <div className="city-card-match-ring">
            <svg viewBox="0 0 80 80" className="match-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${match.matchScore * 2.14} 214`}
                transform="rotate(-90 40 40)" className="match-circle" />
            </svg>
            <span className="match-pct">{match.matchScore}%</span>
          </div>
        </div>
      </div>

      <div className="city-card-body">
        <div className="city-card-header">
          <div>
            <h3>{match.countryFlag} {match.name}<span className="city-en-name"> {match.nameEn}</span></h3>
            <p className="city-country">{match.country}</p>
          </div>
          <span className={`cost-badge ${match.costLevel}`}>
            {match.costLevel === 'low' ? '💰' : match.costLevel === 'medium' ? '💰💰' : match.costLevel === 'medium-high' ? '💰💰💰' : '💰💰💰💰'}
          </span>
        </div>

        <p className="city-card-desc">{match.description}</p>

        {/* Soul Copy */}
        <div className="city-soul-copy">
          <span>「{match.soulCopy}」</span>
        </div>

        {/* Quick grid */}
        <div className="city-quick-grid">
          <div className="city-quick-item">
            <span className="quick-icon">🌡️</span>
            <div><strong>最佳时间</strong><p>{match.bestTime}</p></div>
          </div>
          <div className="city-quick-item">
            <span className="quick-icon">🏠</span>
            <div><strong>平均房租</strong><p>{match.averageRent}</p></div>
          </div>
          <div className="city-quick-item">
            <span className="quick-icon">🛡️</span>
            <div><strong>安全</strong><p>{match.safety === 'very-high' ? '极高' : match.safety === 'high' ? '高' : '中等'}</p></div>
          </div>
          <div className="city-quick-item">
            <span className="quick-icon">🗣️</span>
            <div><strong>语言</strong><p>{match.language.slice(0, 25)}</p></div>
          </div>
        </div>

        {expanded && (
          <div className="city-detail">
            {/* 3 Reasons */}
            <div className="city-detail-section">
              <h4>💡 为什么适合你</h4>
              {reasons.map((r, i) => (
                <div key={i} className="reason-item">
                  <span className="reason-num">{i + 1}</span>
                  <p>{r}</p>
                </div>
              ))}
            </div>

            {/* Hidden Gems */}
            <div className="city-detail-section">
              <h4>🗺️ 本地人推荐的 3 家隐藏小店</h4>
              {match.hiddenGems.map((gem, i) => (
                <div key={i} className="hidden-gem-item">
                  <span className="gem-icon">{i === 0 ? '☕' : i === 1 ? '🍜' : '🎨'}</span>
                  <span>{gem}</span>
                </div>
              ))}
            </div>

            {/* Landmarks */}
            <div className="city-detail-section">
              <h4>🏛️ 必去地标</h4>
              <div className="detail-tags">
                {match.landmarks.map((l) => <span key={l} className="detail-tag">{l}</span>)}
              </div>
            </div>

            {/* Food */}
            <div className="city-detail-section">
              <h4>🍜 美食推荐</h4>
              <div className="detail-tags">
                {match.food.map((f) => <span key={f} className="detail-tag food">{f}</span>)}
              </div>
            </div>

            {/* Climate */}
            <div className="city-detail-section">
              <h4>🌤️ 气候</h4>
              <p className="detail-text">{match.climate}</p>
            </div>

          </div>
        )}

        <button className="fate-btn text" onClick={onToggle}>
          {expanded ? '收起详情 ▲' : '查看完整城市画像（含隐藏小店） ▼'}
        </button>
      </div>
    </div>
  );
}

// ======================== Share Card ========================
function ShareCardOverlay({
  result,
  topPick,
  shareCardRef,
  onClose
}: {
  result: QuizResult;
  topPick: CityMatch;
  shareCardRef: React.Ref<HTMLDivElement>;
  onClose: () => void;
}) {
  const personality = result.personality;
  const shareText = `我在「命定城市」测试中发现我是${personality.emoji}${personality.label}型人格！\n我的命定城市是 ${topPick.countryFlag} ${topPick.name}，匹配度 ${topPick.matchScore}%。\n「${topPick.soulCopy}」\n\n你也来测测？`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('已复制分享文案！去朋友圈粘贴吧 ✨');
    } catch {
      alert(shareText);
    }
  };

  return (
    <div className="fate-overlay" onClick={onClose}>
      <div className="fate-share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="fate-modal-close" onClick={onClose}>✕</button>

        {/* The share card */}
        <div ref={shareCardRef} className="share-card">
          <div className="share-card-inner">
            <div className="share-card-header">
              <span className="share-card-logo">🌍 命定城市</span>
              <span className="share-card-badge">{personality.emoji} {personality.label}型</span>
            </div>
            <div className="share-card-city-img" style={{ backgroundImage: `url(${topPick.image})` }}>
              <div className="share-card-city-info">
                <h2>{topPick.countryFlag} {topPick.name}</h2>
                <div className="share-card-match-big">
                  <span className="share-big-pct">{topPick.matchScore}%</span>
                  <span className="share-big-label">匹配度</span>
                </div>
              </div>
            </div>
            <div className="share-card-soul">
              「{topPick.soulCopy}」
            </div>
            <div className="share-card-tags">
              {topPick.tags.slice(0, 4).map((t) => (
                <span key={t} className="share-tag">{t}</span>
              ))}
            </div>
            <div className="share-card-footer">
              <span>扫码测测你的命定城市</span>
              <span className="share-card-price">¥0.88</span>
            </div>
          </div>
        </div>

        <div className="share-actions">
          <button className="fate-btn primary" onClick={handleCopyShare}>
            📋 复制分享文案
          </button>
          <button className="fate-btn secondary" onClick={onClose}>
            关闭
          </button>
        </div>
        <p className="share-note">💡 截图这张卡片发朋友圈，朋友扫码就能来测</p>
      </div>
    </div>
  );
}

// ======================== Friend Match Section ========================
function FriendMatchSection({
  result,
  friendResult,
  setFriendResult,
  friendMatch,
  onComplete,
  onClose
}: {
  result: QuizResult;
  friendResult: QuizResult | null;
  setFriendResult: (r: QuizResult) => void;
  friendMatch: FriendMatchResult | null;
  onComplete: () => void;
  onClose: () => void;
}) {
  if (friendMatch) {
    return (
      <section className="fate-friend-result">
        <div className="fate-friend-card">
          <span className="chip large">🤝 匹配完成！</span>
          <h2>你们最适合一起去</h2>
          <div className="friend-city-hero" style={{ backgroundImage: `url(${friendMatch.togetherCity.image})` }}>
            <div className="friend-city-hero-info">
              <h3>{friendMatch.togetherCity.countryFlag} {friendMatch.togetherCity.name}</h3>
              <p className="friend-city-en">{friendMatch.togetherCity.nameEn}</p>
            </div>
          </div>
          <p className="friend-reason">{friendMatch.togetherCity.reason}</p>
          <div className="friend-stats">
            <div className="friend-stat">
              <strong>{friendMatch.compatibility}%</strong>
              <span>旅行匹配度</span>
            </div>
            <div className="friend-stat">
              <strong>{friendMatch.sharedTags.length}</strong>
              <span>共同偏好</span>
            </div>
          </div>
          {friendMatch.sharedTags.length > 0 && (
            <div className="friend-shared-tags">
              {friendMatch.sharedTags.map((t) => <span key={t} className="mini-tag">{t}</span>)}
            </div>
          )}
          <div className="friend-personalities">
            <div className="friend-personality-card">
              <span>你</span>
              <strong>{result.personality.emoji} {result.personality.label}</strong>
              <span>{friendMatch.city1}</span>
            </div>
            <span className="friend-vs">×</span>
            <div className="friend-personality-card">
              <span>好友</span>
              <strong>{friendResult?.personality.emoji} {friendResult?.personality.label}</strong>
              <span>{friendMatch.city2}</span>
            </div>
          </div>
          <button className="fate-btn ghost" onClick={onClose}>返回我的结果</button>
        </div>
      </section>
    );
  }

  // Friend hasn't taken the test yet — show share link popup
  const shareUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] + '?ref=match' : '';
  const shareText = `🤝 来测测你的城市人格！\n我是${result.personality.emoji}${result.personality.label}，想看看我们最适合一起去哪个城市？\n\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('链接已复制！发给微信好友吧 ✨\n\n对方完成测试后，回到此页面查看匹配结果。');
    } catch { alert(shareText); }
  };

  return (
    <section className="fate-friend-cta fate-friend-share-popup">
      <button className="fate-modal-close" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }}>✕</button>
      <span className="chip large">🤝 好友匹配度</span>
      <h2>邀请好友一起测</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: '12px 0' }}>
        你是 <strong>{result.personality.emoji} {result.personality.label}</strong>，
        想知道你和朋友最适合一起去哪个城市吗？
      </p>

      <div className="friend-share-card-preview">
        <div className="friend-share-mini-card">
          <div className="friend-share-mini-top">
            <span className="friend-share-mini-avatar">{result.personality.emoji}</span>
            <div>
              <strong>{result.personality.label}</strong>
              <span>{result.topPicks[0]?.name || '?'} · {result.topPicks[0]?.matchScore || 0}% 匹配</span>
            </div>
          </div>
          <p className="friend-share-mini-soul">「{result.topPicks[0]?.soulCopy || '...'}」</p>
        </div>
        <span className="friend-share-plus">+</span>
        <div className="friend-share-mini-card ghost">
          <div className="friend-share-mini-top">
            <span className="friend-share-mini-avatar">❓</span>
            <div>
              <strong>好友的城市人格</strong>
              <span>等待测试…</span>
            </div>
          </div>
        </div>
      </div>

      <button className="fate-btn primary full" onClick={handleCopyLink}>
        📋 一键复制邀请链接
      </button>
      <p className="fate-dev-note" style={{ marginTop: 12 }}>
        💡 链接已包含测试入口。好友完成测试后，回到此页面即可查看对比结果。（正式版将支持跨设备自动匹配）
      </p>
    </section>
  );
}
