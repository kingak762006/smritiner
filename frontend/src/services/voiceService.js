/**
 * Voice Assistance & Audio Alerts Service for SmritiNER
 * Features:
 * - Elderly-attuned Text-To-Speech (slower pacing 0.85x, clear articulation)
 * - Browser Web Speech API Speech-To-Text (STT) SpeechRecognition
 * - Audio Alerts Synthesizer (reminder chime, success fanfare, gentle nudge, warning chime)
 * - Graceful fallbacks for unsupported browsers/devices
 */

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.enabled = true;
    this.audioCtx = null;
    this.recognition = null;
    this.isListening = false;
    this._initSpeechRecognition();
  }

  _initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
      } catch (err) {
        console.warn('[VoiceService] SpeechRecognition init error:', err);
      }
    }
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

  /**
   * Audio Alerts Synthesizer
   * Distinct, soothing auditory alerts for elderly patients
   */
  playAudioAlert(type = 'chime') {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'reminder' || type === 'alarm') {
        // High-low-high alert chime for medication / health reminders
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880.00, now + 0.2); // A5
        osc1.frequency.setValueAtTime(1174.66, now + 0.4); // D6

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.8);
      } else if (type === 'success' || type === 'victory') {
        // Uplifting major triad arpeggio (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.18, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.45);
        });
      } else if (type === 'hint') {
        // Gentle dual bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.setValueAtTime(493.88, now + 0.18); // B4
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'warning' || type === 'incorrect') {
        // Soft low vibration to signal retry without causing distress
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.setValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Standard pleasant chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio context silently handled
    }
  }

  // Compatibility alias
  playGentleTone(type = 'chime') {
    this.playAudioAlert(type);
  }

  /**
   * Text-To-Speech (TTS)
   */
  speak(text, locale = 'as-IN', onEndCallback = null) {
    if (!this.enabled || !text) return;
    this.playAudioAlert('chime');

    if (!this.synth) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slower, calmer speech rate tailored for elderly comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = this.synth.getVoices();
      const langPrefix = locale.split('-')[0];
      const match = voices.find(v => v.lang.startsWith(langPrefix) || v.lang.includes(langPrefix));
      if (match) {
        utterance.voice = match;
      } else {
        utterance.lang = locale;
      }

      if (onEndCallback) {
        utterance.onend = () => onEndCallback();
        utterance.onerror = () => onEndCallback();
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[VoiceService] Speech synthesis error:', err);
      if (onEndCallback) onEndCallback();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  toggleVoice() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  /**
   * Speech-To-Text (STT) Activity Listener
   */
  listen(locale = 'en-IN', onResult, onError) {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported on this browser. Please use button inputs.');
      return false;
    }

    try {
      this.stop();
      this.recognition.lang = locale;
      this.isListening = true;

      this.recognition.onstart = () => {
        this.playAudioAlert('hint');
      };

      this.recognition.onresult = (event) => {
        this.isListening = false;
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript.trim());
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event.error || 'Voice input error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err.message);
      return false;
    }
  }

  isSpeechRecognitionSupported() {
    return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  }
}

export const voiceService = new VoiceService();
