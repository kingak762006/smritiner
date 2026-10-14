import React, { useState, useEffect } from 'react';
import { Play, Bell, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';
import ReminderModal from '../components/ReminderModal';

export default function ElderlyHome({ onSelectGame, userId = 'NER-PAT-4821' }) {
  const { t, locale } = useI18n();
  const [reminders, setReminders] = useState([]);
  const [activeModalReminder, setActiveModalReminder] = useState(null);
  const [storyLanguage, setStoryLanguage] = useState(locale || 'mr');

  useEffect(() => {
    if (locale) setStoryLanguage(locale);
  }, [locale]);

  useEffect(() => {
    async function loadReminders() {
      const data = await api.getReminders(userId);
      setReminders(data);
      // Auto-prompt the first unacknowledged morning medication reminder
      const unack = data.find(r => r.is_active && !r.last_acknowledged);
      if (unack) {
        setTimeout(() => {
          setActiveModalReminder(unack);
        }, 1200);
      }
    }
    loadReminders();
  }, [userId]);

  const games = [
    {
      id: 'memory_matching',
      icon: '👑',
      title: t('games.memory_matching.title'),
      subtitle: t('games.memory_matching.subtitle'),
      desc: t('games.memory_matching.desc')
    },
    {
      id: 'sequence_recall',
      icon: '🥁',
      title: t('games.sequence_recall.title'),
      subtitle: t('games.sequence_recall.subtitle'),
      desc: t('games.sequence_recall.desc')
    },
    {
      id: 'pattern_recognition',
      icon: '🦚',
      title: t('games.pattern_recognition.title'),
      subtitle: t('games.pattern_recognition.subtitle'),
      desc: t('games.pattern_recognition.desc')
    },
    {
      id: 'attention_concentration',
      icon: '🥭',
      title: t('games.attention_concentration.title'),
      subtitle: t('games.attention_concentration.subtitle'),
      desc: t('games.attention_concentration.desc')
    },
    {
      id: 'daily_routine',
      icon: '🥛',
      title: t('games.daily_routine.title'),
      subtitle: t('games.daily_routine.subtitle'),
      desc: t('games.daily_routine.desc')
    },
    {
      id: 'math_runtime',
      icon: '🧮',
      title: t('games.math_runtime.title'),
      subtitle: t('games.math_runtime.subtitle'),
      desc: t('games.math_runtime.desc')
    }
  ];

  const GRANDSON_SCRIPTS = {
    mr: "नमस्कार आजोबा, नमस्कार आजी! मी तुमचा लाडका नातू बोलतोय. कसे आहात तुम्ही? आठवतंय का, लहानपणी संध्याकाळी तुम्ही मंडईतून माझ्यासाठी गरमागरम बटाटेवडे आणि चिवडा-चिप्स आणायचात? घरातले सगळेजण तुमची खूप आठवण काढतात आणि तुमच्यावर खूप प्रेम करतात. वेळेवर कोमट पाणी आणि औषधे घ्या, आणि छान आराम करा!",
    hi: "नमस्ते दादाजी, नमस्ते दादीजी! मैं आपका पोता बोल रहा हूँ। आप कैसे हैं? क्या आपको याद है बचपन में आप शाम को बाज़ार से मेरे लिए गरमागरम बटाटा वड़ा और कुरकुरे चिप्स लाते थे? घर में सब लोग आपको बहुत याद करते हैं। समय पर गुनगुना पानी और दवाइयां लीजिए, और आराम कीजिए!",
    en: "Hey Grandpa, Hey Grandma! It's your grandson speaking. How are you doing today? Do you remember the tasty batata vadas and crunchy chips you used to bring me after school from the bazaar? Everyone at home misses you and loves you so much. Take your warm water, and rest peacefully today!"
  };

  const FAMILY_STORIES = {
    mr: "आजी, आठवतंय का आपण सगळे मिळून गणपती बाप्पाच्या उत्सवाला कशी धमाल करायचो? तुम्ही स्वतःच्या हाताने बनवलेले गरमागरम उकडीचे मोदक आपण सगळ्यांनी एकत्र बसून खाल्ले होते, आणि ढोल-ताशाच्या गजरात आपण नाचलो होतो. आम्ही नेहमी तुमच्यासोबत आहोत, काळजी घ्या!",
    hi: "दादीजी, क्या आपको याद है जब हम सब गणेशोत्सव में साथ मिलकर आनंद लेते थे? आपके हाथ के बने गरमागरम उकडीचे मोदक का स्वाद आज भी सबको याद है, और ढोल-ताशा की गूंज में हम खुश होते थे। पूरा परिवार आपके साथ है, अपना ख्याल रखिए!",
    en: "Grandma, do you remember when we all celebrated the grand Ganesh festival together? You made the most delicious homemade steaming ukdiche modaks for the whole family, and we danced to the joyful dhol tasha beats together. We are always thinking of you and sending you warm hugs!"
  };

  const getVoiceLocale = (lang) => {
    if (lang === 'mr') return 'mr-IN';
    if (lang === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  const handlePlayGrandsonNote = () => {
    const lang = storyLanguage || 'mr';
    const script = GRANDSON_SCRIPTS[lang] || GRANDSON_SCRIPTS.mr;
    voiceService.speak(script, getVoiceLocale(lang));
  };

  const handlePlayFamilyStory = () => {
    const lang = storyLanguage || 'mr';
    const script = FAMILY_STORIES[lang] || FAMILY_STORIES.mr;
    voiceService.speak(script, getVoiceLocale(lang));
  };

  const handleReminderDone = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, last_acknowledged: new Date().toISOString() } : r));
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {t('welcome_elderly')}
        </h2>
      </div>

      <VoicePrompt text={t('welcome_elderly')} />

      {/* Comfort Voice Note & Family Memory Player for Elderly Citizens */}
      {/* Comfort Voice Note & Family Memory Player for Elderly Citizens (Maharashtra 3-Language Audio) */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        border: '3px solid #D97706',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 1.75rem',
        margin: '1.5rem 0 2rem 0',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
          <div style={{
            fontSize: '3.2rem',
            background: 'white',
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #D97706',
            boxShadow: 'var(--shadow-sm)'
          }}>
            🏡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#D97706', color: 'white', fontSize: '0.85rem', fontWeight: 900, padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
                {storyLanguage === 'mr' ? 'कौटुंबिक आठवणी व सांत्वन' : storyLanguage === 'hi' ? 'पारिवारिक यादें व सांत्वना' : 'Family Reminiscence & Comfort'}
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400E' }}>
                {storyLanguage === 'mr' ? 'शांत विश्रांती व स्मृतीसाठी' : storyLanguage === 'hi' ? 'शांत आराम और स्मृति हेतु' : 'For Rest & Memory'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350F', marginTop: '0.2rem' }}>
              {storyLanguage === 'mr' ? '"आजोबा / आजी, मी तुमचा नातू बोलतोय!"' : storyLanguage === 'hi' ? '"दादाजी / दादीजी, मैं आपका पोता बोल रहा हूँ!"' : '"Hey Grandpa / Grandma, it\'s your Grandson!"'}
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#92400E', fontWeight: 600, marginTop: '0.15rem' }}>
              {storyLanguage === 'mr'
                ? 'मंडईतील बटाटेवडे आणि चिप्स, गणेशोत्सवातील उकडीचे मोदक आणि घरच्यांच्या प्रेमळ आठवणी ऐका.'
                : storyLanguage === 'hi'
                ? 'बाज़ार के गरमागरम बटाटा वड़ा और चिप्स, गणेशोत्सव के मोदक और परिवार की प्यारी यादें सुनें।'
                : 'Listen to warm family memories of batata vadas and chips from the bazaar, Ganesh utsav modaks, and loving messages from home.'}
            </p>
          </div>
        </div>

        {/* Audio Language Selection & Play Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FDE68A', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#78350F' }}>Audio Voice:</span>
            {[
              { id: 'mr', label: 'मराठी' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'en', label: 'English' }
            ].map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setStoryLanguage(l.id)}
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: storyLanguage === l.id ? '2px solid #78350F' : '1px solid #D97706',
                  background: storyLanguage === l.id ? '#78350F' : 'white',
                  color: storyLanguage === l.id ? 'white' : '#78350F',
                  cursor: 'pointer'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handlePlayGrandsonNote}
              className="btn-big btn-primary"
              style={{ minHeight: '52px', fontSize: '1.15rem', background: '#D97706', borderColor: '#78350F' }}
              aria-label="Play Grandson Voice Note"
            >
              <span>🎙️ {storyLanguage === 'mr' ? 'नातवाची प्रेमळ ऑडिओ नोट' : storyLanguage === 'hi' ? 'पोते का वॉयस संदेश' : 'Play Grandson Note'}</span>
            </button>
            <button
              onClick={handlePlayFamilyStory}
              className="btn-big btn-secondary"
              style={{ minHeight: '52px', fontSize: '1.15rem' }}
              aria-label="Play Family Story"
            >
              <span>📖 {storyLanguage === 'mr' ? 'गणेशोत्सव व मोदक कथा' : storyLanguage === 'hi' ? 'गणेशोत्सव व मोदक कहानी' : 'Play Ganesh Story'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reminders Bar */}
      {reminders.length > 0 && (
        <div style={{
          background: 'var(--accent-gold-subtle)',
          border: '3px solid var(--accent-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.3rem' }}>
              <Bell size={26} />
              <span>{t('reminders_heading')}</span>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tap to acknowledge</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {reminders.map((rem) => {
              const isAcknowledged = !!rem.last_acknowledged;
              return (
                <button
                  key={rem.id}
                  onClick={() => setActiveModalReminder(rem)}
                  style={{
                    flex: '0 0 auto',
                    background: isAcknowledged ? '#E5E7EB' : 'white',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: isAcknowledged ? 0.7 : 1
                  }}
                  aria-label={rem.title}
                >
                  <span style={{ fontSize: '1.5rem' }}>{rem.category === 'medication' ? '💊' : rem.category === 'hydration' ? '🥛' : '⏰'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{rem.title}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{rem.time_str}</div>
                  </div>
                  {isAcknowledged ? <CheckCircle size={22} color="var(--primary)" /> : <Clock size={22} color="var(--accent-gold)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cognitive Activities Large Tiles */}
      <div className="games-grid">
        {games.map((g) => (
          <div key={g.id} className="game-tile">
            <div>
              <div className="game-tile-icon">{g.icon}</div>
              <h3 className="game-tile-title">{g.title}</h3>
              <p className="game-tile-subtitle">{g.subtitle}</p>
              <p className="game-tile-desc">{g.desc}</p>
            </div>

            <button
              onClick={() => onSelectGame(g.id)}
              className="game-tile-play-btn"
              aria-label={`${t('btn_play')}: ${g.title}`}
            >
              <Play size={24} fill="currentColor" />
              <span>{t('btn_play')}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Reminder Pop-up Modal */}
      {activeModalReminder && (
        <ReminderModal
          reminder={activeModalReminder}
          onClose={() => setActiveModalReminder(null)}
          onAcknowledge={handleReminderDone}
        />
      )}
    </div>
  );
}
