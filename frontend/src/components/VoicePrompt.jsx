import React, { useState, useEffect } from 'react';
import { Volume2, Mic, MicOff, Check } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useI18n } from '../i18n';

export default function VoicePrompt({ text, autoSpeak = true, onVoiceInput = null }) {
  const { getVoiceLocale } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [voiceSpoken, setVoiceSpoken] = useState('');

  useEffect(() => {
    if (autoSpeak && text) {
      voiceService.speak(text, getVoiceLocale());
    }
  }, [text, autoSpeak, getVoiceLocale]);

  const handleSpeak = () => {
    voiceService.speak(text, getVoiceLocale());
  };

  const handleListen = () => {
    if (isListening) {
      voiceService.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setVoiceSpoken('Listening... Speak now');

    const supported = voiceService.listen(
      getVoiceLocale(),
      (transcript) => {
        setIsListening(false);
        setVoiceSpoken(`Heard: "${transcript}"`);
        voiceService.playAudioAlert('success');
        if (onVoiceInput) onVoiceInput(transcript);
      },
      (error) => {
        setIsListening(false);
        setVoiceSpoken(`(Voice unavailable: ${error})`);
        voiceService.playAudioAlert('warning');
      }
    );

    if (!supported) {
      setIsListening(false);
      setVoiceSpoken('Voice input not supported in this browser. Please use button taps.');
    }
  };

  if (!text) return null;

  return (
    <div className="voice-bubble" aria-live="polite" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <button
          onClick={handleSpeak}
          className="voice-bubble-speaker-btn"
          title="Listen to instruction (TTS)"
          aria-label="Listen to instruction"
        >
          <Volume2 size={28} />
        </button>
        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{text}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={handleListen}
          style={{
            background: isListening ? '#DC2626' : 'var(--primary)',
            color: 'white',
            border: '2px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
          title="Speak answer / Voice command (STT)"
          aria-label="Speech to text input"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span>{isListening ? 'Listening...' : 'Voice Activity (STT)'}</span>
        </button>
      </div>

      {voiceSpoken && (
        <div style={{ width: '100%', fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '0.25rem' }}>
          🎙️ {voiceSpoken}
        </div>
      )}
    </div>
  );
}
