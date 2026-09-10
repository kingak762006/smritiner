import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Award, CheckCircle, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';

const ALL_ROUTINE_STEPS = [
  { id: 'step_water', order: 1, label_en: '1. Morning Warm Water', label_as: '১. ৰাতিপুৱাৰ কুহুমীয়া পানী', label_hi: '1. सुबह का गुनगुना पानी', label_mr: '१. सकाळी कोमट पाणी', icon: '🥛', time: '06:30 AM' },
  { id: 'step_med', order: 2, label_en: '2. Morning Blood Pressure Medicine', label_as: '২. ৰাতিপুৱাৰ ঔষধ সেৱন', label_hi: '2. सुबह की दवा', label_mr: '२. सकाळची रक्तदाबाची औषधे', icon: '💊', time: '07:15 AM' },
  { id: 'step_tea', order: 3, label_en: '3. Assam Tea & Warm Pitha', label_as: '৩. ৰঙা চাহ আৰু পিঠা', label_hi: '3. असम की चाय और नाश्ता', label_mr: '३. चहा आणि नाश्ता', icon: '🍵', time: '08:00 AM' },
  { id: 'step_walk', order: 4, label_en: '4. Courtyard / Garden Walk', label_as: '৪. বাৰীত মুকলি খোজ কঢ়া', label_hi: '4. आंगन में टहलना', label_mr: '४. अंगणात किंवा बागेत फेरफटका', icon: '🚶', time: '09:00 AM' },
  { id: 'step_lunch', order: 5, label_en: '5. Wholesome Lunch & Water', label_as: '৫. দুপৰীয়াৰ পুষ্টিকৰ ভাত', label_hi: '5. दोपहर का भोजन', label_mr: '५. दुपारचे पौष्टिक जेवण', icon: '🍲', time: '01:00 PM' },
  { id: 'step_evening', order: 6, label_en: '6. Evening Lamp & Family Chat', label_as: '৬. সন্ধিয়াৰ বন্তি আৰু কথা-বতৰা', label_hi: '6. शाम का दीया और परिवार', label_mr: '६. संध्याकाळी दिवाबत्ती आणि गप्पा', icon: '🪔', time: '06:30 PM' },
  { id: 'step_rest', order: 7, label_en: '7. Night Medicine & Rest', label_as: '৭. নিশাৰ ঔষধ আৰু শোৱা', label_hi: '7. रात की दवा और आराम', label_mr: '७. रात्रीची औषधे आणि शांत विश्रांती', icon: '🛏️', time: '09:30 PM' }
];

export default function DailyRoutineGame({ onBack, userId = 'NER-PAT-4821', currentDifficulty = 2 }) {
  const { t, locale } = useI18n();

  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [items, setItems] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const getStepCount = (diff) => {
    switch (diff) {
      case 1: return 3;
      case 2: return 4;
      case 3: return 5;
      case 4: return 6;
      case 5: return 7;
      default: return 4;
    }
  };

  const setupRoutineRound = (diff = difficulty) => {
    const count = getStepCount(diff);
    const subset = ALL_ROUTINE_STEPS.slice(0, count);

    // Shuffle subset so user has to arrange them
    let shuffled = [...subset].sort(() => Math.random() - 0.5);
    // Ensure not accidentally already in order
    if (shuffled.every((item, i) => item.order === subset[i].order) && subset.length > 1) {
      shuffled = [shuffled[1], shuffled[0], ...shuffled.slice(2)];
    }

    setItems(shuffled);
    setHintsUsed(0);
    setAttempts(0);
    setIsCompleted(false);
    setEvalResult(null);
    setStartTime(Date.now());
  };

  const switchDifficulty = (lvl) => {
    setDifficulty(lvl);
    setupRoutineRound(lvl);
  };

  useEffect(() => {
    setupRoutineRound(difficulty);
  }, []);

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    voiceService.playGentleTone('chime');
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleCheckOrder = async () => {
    setAttempts(prev => prev + 1);
    const count = getStepCount(difficulty);
    const correctSubset = ALL_ROUTINE_STEPS.slice(0, count);

    const isAllCorrect = items.every((item, idx) => item.order === correctSubset[idx].order);

    if (isAllCorrect) {
      setIsCompleted(true);
      confetti({ particleCount: 50, spread: 60 });
      voiceService.playGentleTone('success');

      const duration = Math.max(5, Math.round((Date.now() - startTime) / 1000));
      const accuracy = attempts === 0 ? 1.0 : Math.max(0.6, 1.0 - (attempts * 0.15));

      try {
        const result = await api.submitGameResult({
          user_id: userId,
          game_type: 'daily_routine',
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
      voiceService.playGentleTone('hint');
      alert("A few steps are not in chronological order yet. Check morning vs evening and try moving them!");
    }
  };

  const handleHint = () => {
    setHintsUsed(prev => prev + 1);
    voiceService.playGentleTone('hint');

    // Automatically place the first misplaced item in its correct position
    const count = getStepCount(difficulty);
    const correctSubset = ALL_ROUTINE_STEPS.slice(0, count);

    for (let i = 0; i < count; i++) {
      if (items[i].order !== correctSubset[i].order) {
        const correctItem = correctSubset[i];
        const currentIdx = items.findIndex(it => it.id === correctItem.id);
        if (currentIdx !== -1) {
          const newItems = [...items];
          newItems.splice(currentIdx, 1);
          newItems.splice(i, 0, correctItem);
          setItems(newItems);
          break;
        }
      }
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
          <h2 className="game-play-title">{t('games.daily_routine.title')}</h2>
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

      <VoicePrompt text={t('games.daily_routine.prompt')} />

      {/* Action Controls & Hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)' }}>
          Use the <strong>Up (▲)</strong> and <strong>Down (▼)</strong> buttons to arrange from earliest morning to night:
        </p>

        <button
          onClick={handleHint}
          className="btn-big btn-accent"
          disabled={isCompleted}
          style={{ minHeight: '52px', fontSize: '1.15rem' }}
        >
          <HelpCircle size={22} />
          <span>Fix One Step (Hint)</span>
        </button>
      </div>

      {/* Routine Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-surface)',
              border: '3px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ fontSize: '3rem' }}>{item.icon}</span>
              <div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {getLabel(item)}
                </h4>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {item.time}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => moveItem(index, -1)}
                disabled={index === 0 || isCompleted}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-strong)',
                  background: index === 0 ? '#E5E7EB' : '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: index === 0 ? 'not-allowed' : 'pointer'
                }}
                aria-label="Move earlier"
              >
                <ArrowUp size={28} />
              </button>

              <button
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1 || isCompleted}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-strong)',
                  background: index === items.length - 1 ? '#E5E7EB' : '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: index === items.length - 1 ? 'not-allowed' : 'pointer'
                }}
                aria-label="Move later"
              >
                <ArrowDown size={28} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isCompleted && (
        <button
          onClick={handleCheckOrder}
          className="btn-big btn-primary"
          style={{ width: '100%', minHeight: '64px', fontSize: '1.4rem' }}
        >
          <CheckCircle size={28} />
          <span>{t('btn_submit')}</span>
        </button>
      )}

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
              <span>Next Schedule Round</span>
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
