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

type Phase = 'quiz' | 'preview' | 'payment' | 'result' | 'friend';

const CATEGORY_ORDER: CityCategory[] = ['settle', 'sojourn', 'solo', 'exchange'];

// ======================== Main Component ========================
export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [unlockedAlt, setUnlockedAlt] = useState(false);
  const [friendMode, setFriendMode] = useState(false);
  const [friendResult, setFriendResult] = useState<QuizResult | null>(null);
  const [friendMatch, setFriendMatch] = useState<FriendMatchResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUESTIONS.length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  // Restore saved result on mount
  useEffect(() => {
    const saved = loadResult();
    if (saved) {
      setResult(saved);
      setPhase('result');
    }
  }, []);

  const handleSelect = useCallback((questionId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }, []);

  // Complete quiz → go to preview
  const handleComplete = () => {
    if (!allAnswered) return;
    const matched = matchCities(answers);
    setResult(matched);
    saveResult(matched);
    setPhase('preview');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Payment
  const handleUnlock = () => {
    setShowPayModal(true);
  };

  const handlePayment = async () => {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPaying(false);
    setShowPayModal(false);
    setPhase('result');
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Share → unlock alternative cities
  const handleShare = () => {
    setShowShareCard(true);
    // Simulate share - in production, use Web Share API or generate image
    setTimeout(() => {
      setUnlockedAlt(true);
    }, 800);
  };

  // Friend matching
  const handleStartFriendMatch = () => {
    setFriendMode(true);
    const saved = loadFriendResult();
    if (saved) {
      setFriendResult(saved);
    }
  };

  const handleFriendTestComplete = () => {
    if (!result || !friendResult) return;
    const match = matchFriends(result, friendResult);
    setFriendMatch(match);
    setPhase('friend');
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setPhase('quiz');
    setExpandedCity(null);
    setShowShareCard(false);
    setUnlockedAlt(false);
    setFriendMode(false);
    setFriendResult(null);
    setFriendMatch(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fate_city_result');
      localStorage.removeItem('fate_city_friend');
    }
  };

  const personality = result?.personality ?? null;

  return (
    <main className="fate-shell">
      {/* ===== Hero ===== */}
      <HeroSection phase={phase} personality={personality} />

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
            {allAnswered ? '✨ 查看我的城市人格' : `还差 ${QUESTIONS.length - answeredCount} 题`}
          </button>
          {answeredCount > 0 && (
            <button className="fate-btn ghost" onClick={handleReset}>
              重新开始
            </button>
          )}
        </div>
      )}

      {/* ===== Preview Phase (Free) ===== */}
      {phase === 'preview' && result && (
        <PreviewPhase
          result={result}
          onUnlock={handleUnlock}
          onShare={handleShare}
          resultRef={resultRef}
        />
      )}

      {/* ===== Payment Modal ===== */}
      {showPayModal && (
        <PaymentModal
          paying={paying}
          onPay={handlePayment}
          onClose={() => setShowPayModal(false)}
        />
      )}

      {/* ===== Full Result Phase (Paid) ===== */}
      {phase === 'result' && result && (
        <FullResult
          result={result}
          answers={answers}
          expandedCity={expandedCity}
          setExpandedCity={setExpandedCity}
          unlockedAlt={unlockedAlt}
          showShareCard={showShareCard}
          onShare={handleShare}
          onStartFriendMatch={handleStartFriendMatch}
          onReset={handleReset}
          shareCardRef={shareCardRef}
          resultRef={resultRef}
        />
      )}

      {/* ===== Friend Match Phase ===== */}
      {(friendMode || phase === 'friend') && result && (
        <FriendMatchSection
          result={result}
          friendResult={friendResult}
          setFriendResult={setFriendResult}
          friendMatch={friendMatch}
          onComplete={handleFriendTestComplete}
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

function HeroSection({ phase, personality }: { phase: Phase; personality: QuizResult['personality'] | null }) {
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
            <div className="hero-stat"><strong>1.23元</strong><span>解锁完整报告</span></div>
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

  if (personality && (phase === 'preview' || phase === 'result')) {
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

// ======================== Preview Phase ========================
function PreviewPhase({
  result,
  onUnlock,
  onShare,
  resultRef
}: {
  result: QuizResult;
  onUnlock: () => void;
  onShare: () => void;
  resultRef: React.Ref<HTMLDivElement>;
}) {
  const topPick = result.topPicks[0];
  const personality = result.personality;

  return (
    <div ref={resultRef} className="fate-preview">
      {/* Personality reveal first */}
      <section className="fate-preview-card">
        <div className="preview-personality">
          <span className="chip large">{personality.emoji} {personality.label}型人格</span>
          <h2>{personality.definition}</h2>
        </div>

        <div className="preview-teaser">
          <div className="preview-city-img" style={{ backgroundImage: `url(${topPick.image})` }}>
            <div className="preview-img-blur-info">
              <h3>{topPick.countryFlag} {topPick.name}</h3>
              <div className="preview-tags">
                {topPick.tags.slice(0, 3).map((t) => (
                  <span key={t} className="preview-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="preview-blur-overlay">
            <div className="preview-lock-content">
              <span className="lock-icon">🔐</span>
              <p className="lock-title">你已经完成了 90%</p>
              <p className="lock-desc">
                想知道<strong>哪座城市最懂你</strong>吗？
                <br />
                解锁完整答案：3 个私人定制理由、隐藏小店推荐、
                <br />
                最佳出行月份、深度城市画像。
              </p>
              <button className="fate-btn primary" onClick={onUnlock}>
                ¥1.23 解锁完整报告
              </button>
              <button className="fate-btn text" onClick={onShare}>
                📤 先分享卡片，免费解锁备选城市
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Personality distribution sneak peek */}
      <section className="fate-mini-dist">
        <h3>你的城市人格分布</h3>
        <div className="fate-distribution">
          {CATEGORY_ORDER.map((cat) => {
            const prof = PERSONALITY_MAP[cat];
            return (
              <div key={cat} className="fate-dist-item">
                <div className="fate-dist-label">
                  <span>{prof.emoji}</span>
                  <span>{prof.label}</span>
                </div>
                <div className="fate-dist-bar-wrap">
                  <div className={`fate-dist-bar ${prof.colorClass}`} style={{ width: `${result.distribution[cat]}%` }} />
                </div>
                <span className="fate-dist-pct">{result.distribution[cat]}%</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ======================== Payment Modal ========================
function PaymentModal({
  paying,
  onPay,
  onClose
}: {
  paying: boolean;
  onPay: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fate-overlay" onClick={onClose}>
      <div className="fate-modal" onClick={(e) => e.stopPropagation()}>
        <button className="fate-modal-close" onClick={onClose}>✕</button>
        <div className="fate-modal-header">
          <span className="chip">🔐 解锁完整报告</span>
          <h2>你的命定城市分析</h2>
          <p className="fate-modal-desc">
            包含「为什么适合你」的 3 点理由、本地人推荐的 3 家隐藏小店、最佳出行月份、深度城市画像
          </p>
        </div>
        <div className="fate-price-row">
          <span className="fate-price">¥1.23</span>
          <span className="fate-price-note">一次购买，永久查看</span>
        </div>
        <div className="fate-pay-options">
          <button className="fate-pay-btn active"><span className="pay-icon">💚</span><span>微信支付</span></button>
          <button className="fate-pay-btn"><span className="pay-icon">💙</span><span>支付宝</span></button>
        </div>
        <div className="fate-qr-box">
          {paying ? (
            <div className="fate-paying-anim">
              <div className="spinner" />
              <p>支付处理中…</p>
            </div>
          ) : (
            <div className="fate-qr-placeholder">
              <div className="qr-code-sim"><div className="qr-pattern" /></div>
              <p className="qr-note">扫码支付 ¥1.23</p>
            </div>
          )}
        </div>
        <button className="fate-btn primary full" onClick={onPay} disabled={paying}>
          {paying ? '处理中…' : '✅ 模拟支付（开发模式）'}
        </button>
        <p className="fate-dev-note">💡 正式上线时替换为真实微信/支付宝支付接口</p>
      </div>
    </div>
  );
}

// ======================== Full Result ========================
function FullResult({
  result,
  answers,
  expandedCity,
  setExpandedCity,
  unlockedAlt,
  showShareCard,
  onShare,
  onStartFriendMatch,
  onReset,
  shareCardRef,
  resultRef
}: {
  result: QuizResult;
  answers: Record<string, number>;
  expandedCity: string | null;
  setExpandedCity: (id: string | null) => void;
  unlockedAlt: boolean;
  showShareCard: boolean;
  onShare: () => void;
  onStartFriendMatch: () => void;
  onReset: () => void;
  shareCardRef: React.Ref<HTMLDivElement>;
  resultRef: React.Ref<HTMLDivElement>;
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

      {/* Share card button */}
      <section className="fate-social-section">
        <div className="fate-share-cta">
          <h3>📤 分享你的城市人格卡片</h3>
          <p>生成专属卡片发朋友圈，看看朋友是什么人格</p>
          <button className="fate-btn primary" onClick={onShare}>
            生成分享卡片
          </button>
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
              <span className="share-card-price">¥1.23</span>
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
