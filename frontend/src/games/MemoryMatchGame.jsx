import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, HelpCircle, CheckCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';

const CULTURAL_ITEMS = [
  { id: 'jaapi', label_en: 'Jaapi', label_as: 'জাপী', label_hi: 'जापी', label_mr: 'जापी (बांबूची टोपी)', icon: '👒' },
  { id: 'gamosa', label_en: 'Gamosa', label_as: 'গামোচা', label_hi: 'गमोसा', label_mr: 'गमोसा (पारंपरिक शेला)', icon: '🧣' },
  { id: 'dhol', label_en: 'Bihu Dhol', label_as: 'ঢোল', label_hi: 'ढोल', label_mr: 'बिहू ढोल', icon: '🥁' },
  { id: 'pepa', label_en: 'Pepa Horn', label_as: 'পেঁপা', label_hi: 'पेपा', label_mr: 'पेपा (शिंगाचे वाद्य)', icon: '🎺' },
  { id: 'kaji_nemu', label_en: 'Kaji Nemu', label_as: 'কাজী নেমু', label_hi: 'काजी नेमु', label_mr: 'काजी नेमु (सुगंधी लिंबू)', icon: '🍋' },
  { id: 'tea_leaves', label_en: 'Tea Leaves', label_as: 'সোণালী চাহ', label_hi: 'चाय पत्ती', label_mr: 'सोनेरी चहाची पाने', icon: '🍃' },
  { id: 'xorai', label_en: 'Xorai Tray', label_as: 'শৰাই', label_hi: 'शराई', label_mr: 'शराई (पितळी तबक)', icon: '🏆' },
  { id: 'rhino', label_en: 'Kaziranga Rhino', label_as: 'এশিঙীয়া গঁড়', label_hi: 'गेंडा', label_mr: 'काझीरंगा एक शिंगी गेंडा', icon: '🦏' }
];

export default function MemoryMatchGame({ onBack, userId = 'NER-PAT-4821', currentDifficulty = 2 }) {
  const { t, locale } = useI18n();

  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [cards, setCards] = useState([]);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [previewActive, setPreviewActive] = useState(true);
  const previewTimerRef = useRef(null);

  const getPairsCount = (diff) => {
    switch (diff) {
      case 1: return 2; // 4 cards (2x2)
      case 2: return 3; // 6 cards (2x3)
      case 3: return 4; // 8 cards (2x4)
      case 4: return 6; // 12 cards (3x4)
      case 5: return 8; // 16 cards (4x4)
      default: return 3;
    }
  };

  const getGridClass = (diff) => {
    switch (diff) {
      case 1: return 'cards-grid-2x2';
      case 2: return 'cards-grid-2x3';
      case 3: return 'cards-grid-2x4';
      case 4: return 'cards-grid-3x4';
      case 5: return 'cards-grid-4x4';
      default: return 'cards-grid-2x3';
    }
  };

  const initGame = (targetDiff = difficulty) => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    const pairsCount = getPairsCount(targetDiff);
    const selected = CULTURAL_ITEMS.slice(0, pairsCount);
    const deck = [];

    selected.forEach((item, idx) => {
      deck.push({ ...item, cardKey: `${item.id}_a_${idx}` });
      deck.push({ ...item, cardKey: `${item.id}_b_${idx}` });
    });

    // Shuffle deck
    const shuffled = deck.sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setRevealedIndices([]);
    setMatchedIds([]);
    setAttempts(0);
    setHintsUsed(0);
    setIsCompleted(false);
    setEvalResult(null);
    setStartTime(Date.now());

    setPreviewActive(true);
    const revealTime = targetDiff === 1 ? 1600 : targetDiff === 2 ? 1200 : 800;
    previewTimerRef.current = setTimeout(() => {
      setPreviewActive(false);
      previewTimerRef.current = null;
    }, revealTime);
  };

  const switchDifficulty = (lvl) => {
    setDifficulty(lvl);
    initGame(lvl);
  };

  useEffect(() => {
    initGame(difficulty);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const handleCardClick = (index) => {
    if (previewActive || isCompleted) return;
    if (revealedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].id)) return;
    if (revealedIndices.length >= 2) return;

    voiceService.playGentleTone('chime');
    const newRevealed = [...revealedIndices, index];
    setRevealedIndices(newRevealed);

    if (newRevealed.length === 2) {
      setAttempts((prev) => prev + 1);
      const card1 = cards[newRevealed[0]];
      const card2 = cards[newRevealed[1]];

      if (card1.id === card2.id) {
        // Match found!
        voiceService.playGentleTone('success');
        const newMatched = [...matchedIds, card1.id];
        setMatchedIds(newMatched);
        setRevealedIndices([]);

        // Check if all pairs matched
        const totalPairs = getPairsCount(difficulty);
        if (newMatched.length === totalPairs) {
          handleGameCompletion(newMatched.length, attempts + 1);
        }
      } else {
        // No match -> flip back after 1.1s
        setTimeout(() => {
          setRevealedIndices([]);
        }, 1100);
      }
    }
  };

  const handleGameCompletion = async (pairsMatched, finalAttempts) => {
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    voiceService.playGentleTone('success');

    const durationSeconds = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    const expectedAttempts = pairsMatched;
    const accuracy = Math.max(0.4, Math.min(1.0, expectedAttempts / Math.max(1, finalAttempts)));
    const responseTimeMs = Math.round((durationSeconds * 1000) / (finalAttempts * 2));

    try {
      const result = await api.submitGameResult({
        user_id: userId,
        game_type: 'memory_matching',
        current_difficulty: difficulty,
        accuracy: accuracy,
        response_time_ms: responseTimeMs,
        attempts: finalAttempts,
        completed: true,
        hints_used: hintsUsed,
        session_duration_s: durationSeconds,
        adaptation_mode: 'adaptive'
      });
      setEvalResult(result);
    } catch (e) {
      console.warn('Evaluation submission fallback:', e);
    }
  };

  const handleHint = () => {
    if (previewActive || isCompleted) return;
    setHintsUsed((prev) => prev + 1);
    voiceService.playGentleTone('hint');

    // Find an unmatched pair and briefly reveal it
    const unmatched = cards.filter((c) => !matchedIds.includes(c.id));
    if (unmatched.length >= 2) {
      const targetId = unmatched[0].id;
      const targetIndices = cards
        .map((c, i) => (c.id === targetId ? i : null))
        .filter((i) => i !== null);

      setRevealedIndices(targetIndices);
      setTimeout(() => {
        setRevealedIndices([]);
      }, 1600);
    }
  };

  const handleNextLevel = () => {
    const nextDiff = (evalResult && evalResult.next_difficulty) ? evalResult.next_difficulty : Math.min(5, difficulty + 1);
    switchDifficulty(nextDiff);
  };

  const getItemLabel = (item) => {
    if (locale === 'as') return item.label_as;
    if (locale === 'hi') return item.label_hi;
    if (locale === 'mr') return item.label_mr || item.label_hi;
    return item.label_en;
  };

  return (
    <div className="game-play-card">
      {/* Header */}
      <div className="game-play-header">
        <button onClick={onBack} className="btn-big btn-secondary" aria-label="Go Back">
          <ArrowLeft size={24} />
          <span>{t('btn_back_home')}</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 className="game-play-title">{t('games.memory_matching.title')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>{t('difficulty_level')}:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => switchDifficulty(lvl)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: '2px solid var(--border-strong)',
                  background: difficulty === lvl ? 'var(--primary)' : '#F3EFE6',
                  color: difficulty === lvl ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer',
                  boxShadow: difficulty === lvl ? '0 2px 6px rgba(12, 97, 61, 0.4)' : 'none'
                }}
                aria-label={`Select Level ${lvl}`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => initGame(difficulty)} className="btn-big btn-secondary" aria-label="Restart Activity">
          <RefreshCw size={24} />
          <span>{t('btn_restart')}</span>
        </button>
      </div>

      {/* Voice Prompt & Instructions */}
      <VoicePrompt text={t('games.memory_matching.prompt')} />

      {/* Action Controls & Hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Pairs Matched: <strong style={{ color: 'var(--primary)' }}>{matchedIds.length} / {getPairsCount(difficulty)}</strong>
        </div>

        <button
          onClick={handleHint}
          className="btn-big btn-accent"
          disabled={isCompleted || previewActive}
          style={{ minHeight: '52px', fontSize: '1.15rem' }}
        >
          <HelpCircle size={22} />
          <span>{t('btn_hint')}</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className={`cards-grid ${getGridClass(difficulty)}`}>
        {cards.map((card, index) => {
          const isRevealed = previewActive || revealedIndices.includes(index) || matchedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);

          return (
            <button
              key={card.cardKey}
              onClick={() => handleCardClick(index)}
              className={`memory-card ${isRevealed ? 'revealed' : ''} ${isMatched ? 'matched' : ''}`}
              aria-label={isRevealed ? getItemLabel(card) : 'Hidden Card'}
              disabled={isRevealed || previewActive || isCompleted}
            >
              {isRevealed ? (
                <>
                  <span>{card.icon}</span>
                  <span className="memory-card-label">{getItemLabel(card)}</span>
                </>
              ) : (
                <span style={{ color: 'var(--border-subtle)', fontSize: '2rem' }}>🌿</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Completion & AI Adaptation Panel */}
      {isCompleted && (
        <div style={{ marginTop: '2rem', padding: '1.75rem', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-lg)', border: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            <CheckCircle size={36} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('encouragement_great')}</h3>
          </div>

          {evalResult && (
            <div style={{ marginTop: '1rem', background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 700 }}>
                <span>{t('score_label')}: <strong style={{ color: 'var(--primary)' }}>{evalResult.performance_score} / 100</strong></span>
                <span>Accuracy: <strong>{evalResult.accuracy_percent}%</strong></span>
                <span>Next Difficulty: <strong style={{ color: 'var(--accent-gold)' }}>Level {evalResult.next_difficulty}</strong></span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                💡 <strong>AI Adaptation Rationale:</strong> {evalResult.adaptation_rationale}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleNextLevel} className="btn-big btn-primary" style={{ flex: 1 }}>
              <Award size={26} />
              <span>Continue to Level {evalResult?.next_difficulty || difficulty}</span>
            </button>
            <button onClick={onBack} className="btn-big btn-secondary" style={{ flex: 1 }}>
              <span>{t('btn_back_home')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
