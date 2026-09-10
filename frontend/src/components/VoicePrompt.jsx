import React, { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useI18n } from '../i18n';

export default function VoicePrompt({ text, autoSpeak = true }) {
  const { getVoiceLocale } = useI18n();

  useEffect(() => {
    if (autoSpeak && text) {
      voiceService.speak(text, getVoiceLocale());
    }
  }, [text, autoSpeak, getVoiceLocale]);

  const handleSpeak = () => {
    voiceService.speak(text, getVoiceLocale());
  };

  if (!text) return null;

  return (
    <div className="voice-bubble" aria-live="polite">
      <button
        onClick={handleSpeak}
        className="voice-bubble-speaker-btn"
        title="Listen to instruction"
        aria-label="Listen to instruction"
      >
        <Volume2 size={28} />
      </button>
      <span>{text}</span>
    </div>
  );
}
