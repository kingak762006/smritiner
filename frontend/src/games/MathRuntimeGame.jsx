import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Award, CheckCircle, HelpCircle, Clock, Calculator, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';

export default function MathRuntimeGame({ onBack, userId = 'NER-PAT-4821', currentDifficulty = 2 }) {
  const { t, locale } = useI18n();

  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [problem, setProblem] = useState({ num1: 7, num2: 5, operator: '+', answer: 12 });
  const [options, setOptions] = useState([10, 11, 12, 13]);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct', 'wrong', null

  const timerRef = useRef(null);

  const getTimerForDifficulty = (diff) => {
    switch (diff) {
      case 1: return 25; // Gentle pacing for elderly
      case 2: return 20;
      case 3: return 18;
      case 4: return 15;
      case 5: return 12;
      default: return 20;
    }
  };

  const generateProblem = (diff, roundNum) => {
    // For Round 1, always feature the classic 7 + 5 prompt as requested!
    if (roundNum === 1) {
      const p = { num1: 7, num2: 5, operator: '+', answer: 12 };
      const opts = [10, 11, 12, 13].sort(() => Math.random() - 0.5);
      return { p, opts };
    }

    let n1, n2, op, ans;
    const maxVal = diff === 1 ? 10 : diff === 2 ? 15 : diff === 3 ? 25 : 40;

    if (diff === 1) {
      // Simple addition
      n1 = Math.floor(Math.random() * 8) + 2;
      n2 = Math.floor(Math.random() * 8) + 1;
      op = '+';
      ans = n1 + n2;
    } else if (diff === 2) {
      // Addition and simple subtraction
      if (Math.random() > 0.4) {
        n1 = Math.floor(Math.random() * 10) + 3;
        n2 = Math.floor(Math.random() * 8) + 2;
        op = '+';
        ans = n1 + n2;
      } else {
        n1 = Math.floor(Math.random() * 10) + 5;
        n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
        op = '-';
        ans = n1 - n2;
      }
    } else {
      // Levels 3-5: Mixed operations
      const pickOp = Math.random();
      if (pickOp < 0.5) {
        n1 = Math.floor(Math.random() * maxVal) + 5;
        n2 = Math.floor(Math.random() * maxVal) + 3;
        op = '+';
        ans = n1 + n2;
      } else if (pickOp < 0.8) {
        n1 = Math.floor(Math.random() * maxVal) + 10;
        n2 = Math.floor(Math.random() * (n1 - 2)) + 2;
        op = '-';
        ans = n1 - n2;
      } else {
        // Simple multiplication like 3x4
        n1 = Math.floor(Math.random() * 5) + 2;
        n2 = Math.floor(Math.random() * 5) + 2;
        op = '×';
        ans = n1 * n2;
      }
    }

    // Generate 4 plausible distinct choice candidates
    const dists = new Set([ans]);
    while (dists.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const val = ans + delta;
      if (val >= 0) dists.add(val);
    }

    const opts = Array.from(dists).sort(() => Math.random() - 0.5);
    return { p: { num1: n1, num2: n2, operator: op, answer: ans }, opts };
  };

  const startRound = (diff = difficulty, rNum = 1) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const { p, opts } = generateProblem(diff, rNum);
    setProblem(p);
    setOptions(opts);
    setSelectedAnswer(null);
    setFeedbackState(null);
    setTimeLeft(getTimerForDifficulty(diff));

    // Announce arithmetic problem clearly via TTS
    const speakText = `${p.num1} ${p.operator === '+' ? 'plus' : p.operator === '-' ? 'minus' : 'times'} ${p.num2} equals what?`;
    voiceService.speak(speakText);

    // Runtime countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut(diff, rNum, p);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = (diff, curRound, curProblem) => {
    voiceService.playAudioAlert('warning');
    setFeedbackState('timeout');
    setAttempts((prev) => prev + 1);

    setTimeout(() => {
      if (curRound >= maxRounds) {
        finishGame(score, attempts + 1);
      } else {
        setRound((r) => r + 1);
        startRound(diff, curRound + 1);
      }
    }, 1500);
  };

  const initGame = (targetDiff = difficulty) => {
    setDifficulty(targetDiff);
    setRound(1);
    setMaxRounds(5);
    setScore(0);
    setAttempts(0);
    setHintsUsed(0);
    setIsCompleted(false);
    setEvalResult(null);
    setStartTime(Date.now());
    startRound(targetDiff, 1);
  };

  useEffect(() => {
    initGame(difficulty);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleOptionSelect = (optionVal) => {
    if (selectedAnswer !== null || isCompleted) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(optionVal);
    setAttempts((prev) => prev + 1);

    if (optionVal === problem.answer) {
      // Correct!
      voiceService.playAudioAlert('success');
      setFeedbackState('correct');
      const newScore = score + 1;
      setScore(newScore);

      setTimeout(() => {
        if (round >= maxRounds) {
          finishGame(newScore, attempts + 1);
        } else {
          setRound((r) => r + 1);
          startRound(difficulty, round + 1);
        }
      }, 1000);
    } else {
      // Wrong answer
      voiceService.playAudioAlert('warning');
      setFeedbackState('wrong');

      setTimeout(() => {
        if (round >= maxRounds) {
          finishGame(score, attempts + 1);
        } else {
          setRound((r) => r + 1);
          startRound(difficulty, round + 1);
        }
      }, 1400);
    }
  };

  const handleVoiceInput = (text) => {
    if (!text || selectedAnswer !== null || isCompleted) return;
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && options.includes(num)) {
      handleOptionSelect(num);
      return;
    }

    // Check word numbers (e.g. twelve, ten)
    const wordsMap = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
    };
    const lower = text.toLowerCase().trim();
    for (const [w, val] of Object.entries(wordsMap)) {
      if (lower.includes(w) && options.includes(val)) {
        handleOptionSelect(val);
        return;
      }
    }
  };

  const handleHint = () => {
    if (selectedAnswer !== null || isCompleted) return;
    setHintsUsed((prev) => prev + 1);
    voiceService.playAudioAlert('hint');

    // Remove one wrong option
    const wrongOptions = options.filter((o) => o !== problem.answer);
    if (wrongOptions.length > 0 && options.length > 2) {
      setOptions((prev) => prev.filter((o) => o !== wrongOptions[0]));
    }
  };

  const finishGame = async (finalScore, finalAttempts) => {
    setIsCompleted(true);
    if (finalScore >= 3) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      voiceService.playAudioAlert('victory');
    }

    const durationSeconds = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    const accuracy = maxRounds > 0 ? finalScore / maxRounds : 0.8;
    const responseTimeMs = Math.round((durationSeconds * 1000) / maxRounds);

    try {
      const result = await api.submitGameResult({
        user_id: userId,
        game_type: 'math_runtime',
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
      console.warn('API submission error:', e);
    }
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
          <h2 className="game-play-title">7+5 Mathematical Runtime Game</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>{t('difficulty_level')}:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => initGame(lvl)}
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

      <VoicePrompt
        text={`Solve: ${problem.num1} ${problem.operator} ${problem.num2}. Speak or tap your answer.`}
        onVoiceInput={handleVoiceInput}
      />

      {/* Progress & Live Runtime Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem', fontWeight: 800 }}>
          <Calculator size={26} color="var(--primary)" />
          <span>Round {round} of {maxRounds}</span>
          <span style={{ marginLeft: '1rem', color: 'var(--accent-gold)' }}>Score: {score}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: timeLeft <= 5 ? '#FEE2E2' : '#E6F3EC',
          border: `2px solid ${timeLeft <= 5 ? '#DC2626' : 'var(--primary)'}`,
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: timeLeft <= 5 ? '#DC2626' : 'var(--primary)'
        }}>
          <Clock size={22} />
          <span>Runtime: {timeLeft}s</span>
        </div>
      </div>

      {/* Problem Display Card */}
      {!isCompleted ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '4px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          margin: '1.5rem 0'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Mental Arithmetic & Cognitive Speed
          </div>

          <div style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            color: 'var(--text-main)',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem'
          }}>
            <span>{problem.num1}</span>
            <span style={{ color: 'var(--primary)' }}>{problem.operator}</span>
            <span>{problem.num2}</span>
            <span style={{ color: 'var(--accent-gold)' }}>=</span>
            <span style={{ color: 'var(--primary)' }}>?</span>
          </div>

          {feedbackState === 'correct' && (
            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.5rem', marginTop: '1rem' }}>
              ✓ Excellent! Correct Answer!
            </div>
          )}
          {feedbackState === 'wrong' && (
            <div style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.5rem', marginTop: '1rem' }}>
              ✗ Good attempt! Answer was {problem.answer}.
            </div>
          )}
          {feedbackState === 'timeout' && (
            <div style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.5rem', marginTop: '1rem' }}>
              ⏰ Time expired! Next problem coming up...
            </div>
          )}

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.25rem',
            marginTop: '2rem',
            maxWidth: '650px',
            margin: '2rem auto 0 auto'
          }}>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleOptionSelect(opt)}
                disabled={selectedAnswer !== null}
                style={{
                  background: selectedAnswer === opt
                    ? (opt === problem.answer ? '#10B981' : '#EF4444')
                    : 'var(--bg-surface-subtle)',
                  color: selectedAnswer === opt ? 'white' : 'var(--text-main)',
                  border: '3px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 0.5rem',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  boxShadow: 'var(--shadow-sm)',
                  cursor: selectedAnswer === null ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleHint}
              disabled={selectedAnswer !== null}
              className="btn-big btn-accent"
              style={{ fontSize: '1.15rem', padding: '0.6rem 1.5rem' }}
            >
              <HelpCircle size={22} />
              <span>Eliminate Wrong Option (Hint)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion & Adaptation Results Card */
        <div style={{
          background: 'var(--bg-surface)',
          border: '4px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          margin: '2rem 0'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🎯</div>
          <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Mathematical Runtime Session Complete!
          </h3>
          <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            You scored {score} out of {maxRounds} problems correct!
          </p>

          {evalResult && (
            <div style={{
              background: 'var(--primary-subtle)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              margin: '1.75rem auto',
              maxWidth: '650px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
                <Zap size={24} />
                <span>AI Adaptive Engine Calibration</span>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                <div>Performance Score: <strong>{evalResult.performance_score} / 100</strong></div>
                <div>Reaction Speed Score: <strong>{evalResult.speed_score} / 100</strong></div>
                <div>Next Personalized Level: <strong>Level {evalResult.next_difficulty}</strong> ({evalResult.adaptation_direction})</div>
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  "{evalResult.adaptation_rationale}"
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={() => initGame(difficulty)} className="btn-big btn-primary">
              <RefreshCw size={24} />
              <span>Play Again</span>
            </button>
            <button onClick={onBack} className="btn-big btn-secondary">
              <ArrowLeft size={24} />
              <span>{t('btn_back_home')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}