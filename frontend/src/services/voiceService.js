/**
 * Voice Assistance Service for SmritiNER
 * Features:
 * - Elderly-attuned Text-To-Speech (slower pacing 0.85x, clear articulation)
 * - Browser Web Speech API with automatic multi-lingual voice selection
 * - Web Audio API gentle synthesizer chimes as audio fallbacks
 * - Speech-to-Text listener where supported
 */

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.enabled = true;
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  // Soft pleasant chime sound when TTS is unavailable or to accompany prompts
  playGentleTone(type = 'chime') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'hint') {
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.setValueAtTime(493.88, now + 0.2); // B4
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Standard gentle notification chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio context silently ignored on strict policy
    }
  }

  speak(text, locale = 'as-IN') {
    if (!this.enabled || !text) return;
    this.playGentleTone('chime');

    if (!this.synth) {
      return;
    }

    try {
      this.synth.cancel(); // Cancel any ongoing utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slower, calmer speech rate tailored for elderly comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select voice matching language if available
      const voices = this.synth.getVoices();
      const langPrefix = locale.split('-')[0];
      const match = voices.find(v => v.lang.startsWith(langPrefix) || v.lang.includes(langPrefix));
      if (match) {
        utterance.voice = match;
      } else {
        utterance.lang = locale;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[VoiceService] Speech synthesis error:', err);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  toggleVoice() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }
}

export const voiceService = new VoiceService();
