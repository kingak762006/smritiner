import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Award, CheckCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';

const MOTIFS = [
  { id: 'rhino', label_en: 'Kaziranga One-Horned Rhino', label_as: 'কাজিৰঙাৰ এশিঙীয়া গঁড়', label_hi: 'काजीरंगा का एक सींग वाला गैंडा', label_mr: 'काझीरंगा एक शिंगी गेंडा', icon: '🦏', category: 'fauna' },
  { id: 'hornbill', label_en: 'Great Indian Hornbill', label_as: 'পাহাৰৰ ধনেশ পক্ষী', label_hi: 'धनेश पक्षी', label_mr: 'धनेश पक्षी (हॉर्नबिल)', icon: '🦜', category: 'fauna' },
  { id: 'jaapi', label_en: 'Woven Jaapi Motif', label_as: 'ফুলাম বাঁহৰ জাপী', label_hi: 'पारंपरिक जापी', label_mr: 'पारंपरिक बांबूची जापी', icon: '👒', category: 'craft' },
  { id: 'xorai', label_en: 'Bell-Metal Xorai', label_as: 'কাঁহ-পিতলৰ শৰাই', label_hi: 'पारंपरिक शराई', label_mr: 'पितळी शराई तबक', icon: '🏆', category: 'craft' },
  { id: 'tea_leaf', label_en: 'Golden Tea Bud', label_as: 'সোণালী চাহৰ দুটি পাত', label_hi: 'चाय की कोमल पत्ती', label_mr: 'सोनेरी चहाचे कोवळे पान', icon: '🍃', category: 'flora' },
  { id: 'muga_loom', label_en: 'Muga Silk Loom Lozenge', label_as: 'মুগা ৰেচমৰ তাঁতৰ ফুল', label_hi: 'मूगा सिल्क का नमूना', label_mr: 'मूगा सिल्क हातमाग नमुना', icon: '🧵', category: 'handloom' }
];

export default function PatternRecognizeGame({ onBack, userId = 'NER-PAT-4821', currentDifficulty = 2 }) {
  const { t, locale } = useI18n();

  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [targetMotif, setTargetMotif] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [evalResult, setEvalResult] = useState(null);

  const getOptionsCount = (diff) => {
    switch (diff) {
      case 1: return 2;
      case 2: return 3;
      case 3: return 4;
      case 4: return 4;
      case 5: return 6;
      default: return 3;
    }
  };

  const setupRound = (diff = difficulty) => {
    const target = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
    const count = getOptionsCount(diff);

    // Pick distractors
    const otherMotifs = MOTIFS.filter(m => m.id !== target.id).sort(() => Math.random() - 0.5);
    const chosenDistractors = otherMotifs.slice(0, count - 1);

    const candidates = [target, ...chosenDistractors].sort(() => Math.random() - 0.5);

    setTargetMotif(target);
    setOptions(candidates);
    setSelectedId(null);
    setIsCorrect(null);
    setEvalResult(null);
    setStartTime(Date.now());
  };

  const switchDifficulty = (lvl) => {
    setDifficulty(lvl);
    setupRound(lvl);
  };

  useEffect(() => {
    setupRound(difficulty);
  }, []);

  const handleSelect = async (motif) => {
    if (isCorrect) return;

    voiceService.playGentleTone('chime');
    setSelectedId(motif.id);
    setAttempts(prev => prev + 1);

    if (motif.id === targetMotif.id) {
      // Correct match!
      setIsCorrect(true);
      confetti({ particleCount: 50, spread: 60 });
      voiceService.playGentleTone('success');

      const duration = Math.max(3, Math.round((Date.now() - startTime) / 1000));
      const accuracy = attempts === 0 ? 1.0 : 0.65;

      try {
        const result = await api.submitGameResult({
          user_id: userId,
          game_type: 'pattern_recognition',
          current_difficulty: difficulty,
          accuracy: accuracy,
          response_time_ms: duration * 1000,
          attempts: attempts + 1,
          completed: true,
          hints_used: hintsUsed,
          session_duration_s: duration,
          adaptation_mode: 'adaptive'
        });
        setEvalResult(result);
      } catch (e) {
        console.warn('API error:', e);
      }
    } else {
      // Gentle incorrect notification
      voiceService.playGentleTone('hint');
      setIsCorrect(false);
      setTimeout(() => {
        setIsCorrect(null);
        setSelectedId(null);
      }, 900);
    }
  };

  const handleHint = () => {
    if (isCorrect) return;
    setHintsUsed(prev => prev + 1);
    voiceService.playGentleTone('hint');

    // Eliminate one incorrect distractor
    const incorrect = options.filter(o => o.id !== targetMotif.id);
    if (incorrect.length > 0 && options.length > 2) {
      setOptions(prev => prev.filter(o => o.id !== incorrect[0].id));
    }
  };

  const getLabel = (item) => {
    if (!item) return '';
    if (locale === 'as') return item.label_as;
    if (locale === 'hi') return item.label_hi;
    if (locale === 'mr') return item.label_mr || item.label_hi;
    return item.label_en;
  };

  return (
    <div className="game-play-card">
      <div className="game-play-header">
        <button onClick={onBack} className="btn-big btn-secondary" aria-label="Go Back">
          <ArrowLeft size={24} />
          <span>{t('btn_back_home')}</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 className="game-play-title">{t('games.pattern_recognition.title')}</h2>
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

      <VoicePrompt text={t('games.pattern_recognition.prompt')} />

      {/* Target Motif Display */}
      {targetMotif && (
        <div style={{
          background: 'var(--accent-gold-subtle)',
          border: '4px solid var(--accent-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          textAlign: 'center',
          margin: '1.5rem 0',
          boxShadow: 'var(--shadow-md)'
        }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Target Cultural Motif to Match
          </p>
          <div style={{ fontSize: '5.5rem', margin: '0.5rem 0' }}>{targetMotif.icon}</div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {getLabel(targetMotif)}
          </h3>
        </div>
      )}

      {/* Action Controls & Hint */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button
          onClick={handleHint}
          className="btn-big btn-accent"
          disabled={isCorrect || options.length <= 2}
          style={{ minHeight: '52px', fontSize: '1.15rem' }}
        >
          <HelpCircle size={22} />
          <span>{t('btn_hint')} (Eliminate Distractor)</span>
        </button>
      </div>

      {/* Candidates Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, options.length)}, 1fr)`, gap: '1.5rem', marginBottom: '2rem' }}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              disabled={isCorrect}
              style={{
                aspectRatio: '1',
                background: isSelected && isCorrect ? 'var(--primary-subtle)' : isSelected && isCorrect === false ? 'var(--danger-subtle)' : 'var(--bg-surface)',
                border: isSelected && isCorrect ? '5px solid var(--primary)' : isSelected && isCorrect === false ? '5px solid var(--danger)' : '4px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.15s ease'
              }}
              aria-label={getLabel(opt)}
            >
              <span style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{opt.icon}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>
                {getLabel(opt)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completion & AI Adaptation Panel */}
      {isCorrect && (
        <div style={{ marginTop: '2rem', padding: '1.75rem', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-lg)', border: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            <CheckCircle size={36} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('encouragement_great')}</h3>
          </div>

          {evalResult && (
            <div style={{ marginTop: '1rem', background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 700 }}>
                <span>{t('score_label')}: <strong style={{ color: 'var(--primary)' }}>{evalResult.performance_score} / 100</strong></span>
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
              <span>Next Pattern Round</span>
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
