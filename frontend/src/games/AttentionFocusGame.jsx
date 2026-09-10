import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Award, CheckCircle, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';

const TARGET_ITEM = { id: 'tea_leaf', icon: '🍃', label_en: 'Golden Tea Leaves', label_as: 'সোণালী চাহ পাত', label_hi: 'सोने जैसी चाय पत्ती' };
const DISTRACTORS = [
  { id: 'dry_leaf', icon: '🍂', label: 'Dry Leaf' },
  { id: 'stone', icon: '🪨', label: 'Pebble' },
  { id: 'water', icon: '💧', label: 'Dew Drop' },
  { id: 'twig', icon: '🪵', label: 'Twig' }
];

export default function AttentionFocusGame({ onBack, userId = 'NER-PAT-4821', currentDifficulty = 2 }) {
  const { t, locale } = useI18n();

  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [activeSlot, setActiveSlot] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [targetSpawnTime, setTargetSpawnTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [targetsRemaining, setTargetsRemaining] = useState(8);

  const timerRef = useRef(null);
  const spawnTimeoutRef = useRef(null);

  const getTargetDuration = (diff) => {
    switch (diff) {
      case 1: return 3400;
      case 2: return 2700;
      case 3: return 2100;
      case 4: return 1600;
      case 5: return 1200;
      default: return 2700;
    }
  };

  const startRound = (diff = difficulty) => {
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setActiveSlot(null);
    setActiveItem(null);
    setIsCompleted(false);
    setEvalResult(null);
    setTargetsRemaining(diff >= 3 ? 10 : 8);

    scheduleNextSpawn(diff);
  };

  const scheduleNextSpawn = (diff = difficulty) => {
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    const delay = Math.floor(Math.random() * 800) + 1200;

    spawnTimeoutRef.current = setTimeout(() => {
      // 65% chance of target item, 35% chance of distractor
      const isTarget = Math.random() < 0.65;
      const chosenItem = isTarget
        ? TARGET_ITEM
        : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];

      const randomSlot = Math.floor(Math.random() * 9); // 3x3 grid

      setActiveSlot(randomSlot);
      setActiveItem(chosenItem);

      if (chosenItem.id === TARGET_ITEM.id) {
        setTargetSpawnTime(Date.now());
      } else {
        setTargetSpawnTime(null);
      }

      const lifetime = getTargetDuration(diff);
      timerRef.current = setTimeout(() => {
        // Target disappeared without click
        if (chosenItem.id === TARGET_ITEM.id) {
          setMisses((prev) => prev + 1);
          decrementTargets();
        }
        setActiveSlot(null);
        setActiveItem(null);
        scheduleNextSpawn(diff);
      }, lifetime);

    }, delay);
  };

  const decrementTargets = () => {
    setTargetsRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        finishGame();
      }
      return next;
    });
  };

  const handleSlotClick = (index) => {
    if (isCompleted || activeSlot !== index || !activeItem) return;

    if (activeItem.id === TARGET_ITEM.id) {
      // Target hit!
      const rt = Date.now() - targetSpawnTime;
      setReactionTimes((prev) => [...prev, rt]);
      setHits((prev) => prev + 1);
      voiceService.playGentleTone('success');

      if (timerRef.current) clearTimeout(timerRef.current);
      setActiveSlot(null);
      setActiveItem(null);

      decrementTargets();
      scheduleNextSpawn(difficulty);
    } else {
      // Distractor tapped (false alarm)
      voiceService.playGentleTone('hint');
      setMisses((prev) => prev + 1);
    }
  };

  const finishGame = async () => {
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    setIsCompleted(true);
    confetti({ particleCount: 50, spread: 60 });
    voiceService.playGentleTone('success');

    const totalTargets = hits + misses;
    const accuracy = totalTargets > 0 ? hits / totalTargets : 0.8;
    const avgRt = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 2400;

    try {
      const result = await api.submitGameResult({
        user_id: userId,
        game_type: 'attention_concentration',
        current_difficulty: difficulty,
        accuracy: accuracy,
        response_time_ms: avgRt,
        attempts: hits + misses,
        completed: true,
        hints_used: 0,
        session_duration_s: 45.0,
        adaptation_mode: 'adaptive'
      });
      setEvalResult(result);
    } catch (e) {
      console.warn('API error:', e);
    }
  };

  const switchDifficulty = (lvl) => {
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    setDifficulty(lvl);
    startRound(lvl);
  };

  useEffect(() => {
    startRound(difficulty);
    return () => {
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="game-play-card">
      <div className="game-play-header">
        <button onClick={onBack} className="btn-big btn-secondary" aria-label="Go Back">
          <ArrowLeft size={24} />
          <span>{t('btn_back_home')}</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 className="game-play-title">{t('games.attention_concentration.title')}</h2>
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

        <button onClick={() => switchDifficulty(difficulty)} className="btn-big btn-secondary" aria-label="Restart Activity">
          <RefreshCw size={24} />
          <span>{t('btn_restart')}</span>
        </button>
      </div>

      <VoicePrompt text={t('games.attention_concentration.prompt')} />

      {/* Target indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
          <Eye size={24} />
          <span>Target: <strong>Golden Tea Leaves 🍃</strong></span>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Hits: <strong style={{ color: 'var(--primary)' }}>{hits}</strong> | Remaining: <strong>{targetsRemaining}</strong>
        </div>
      </div>

      {/* 3x3 Garden Field Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.25rem',
        margin: '1.5rem 0',
        background: '#ECFDF5',
        border: '4px solid var(--primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((slotIdx) => {
          const isSlotActive = activeSlot === slotIdx && activeItem;
          return (
            <button
              key={slotIdx}
              onClick={() => handleSlotClick(slotIdx)}
              disabled={isCompleted}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                border: isSlotActive ? '4px solid var(--primary)' : '2px dashed #A7F3D0',
                background: isSlotActive ? '#FFFFFF' : '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4.2rem',
                boxShadow: isSlotActive ? 'var(--shadow-md)' : 'none',
                transform: isSlotActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s ease'
              }}
              aria-label={isSlotActive ? activeItem.label_en || activeItem.label : 'Empty Garden Patch'}
            >
              {isSlotActive ? activeItem.icon : ''}
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
                <span>Speed Score: <strong>{evalResult.speed_score} / 100</strong></span>
                <span>Next Difficulty: <strong style={{ color: 'var(--accent-gold)' }}>Level {evalResult.next_difficulty}</strong></span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                💡 <strong>AI Adaptation Rationale:</strong> {evalResult.adaptation_rationale}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => switchDifficulty(evalResult?.next_difficulty || difficulty)} className="btn-big btn-primary" style={{ flex: 1 }}>
              <Award size={26} />
              <span>Next Attention Exercise</span>
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
