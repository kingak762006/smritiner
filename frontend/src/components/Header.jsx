import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Volume2, VolumeX, User, Activity, FileText } from 'lucide-react';
import { useI18n } from '../i18n';
import { offlineStorage } from '../services/offlineStorage';
import { voiceService } from '../services/voiceService';

export default function Header({ currentRole, setCurrentRole, onHomeClick }) {
  const { locale, setLocale, t } = useI18n();
  const [isOnline, setIsOnline] = useState(offlineStorage.isOnline());
  const [isSimulated, setIsSimulated] = useState(offlineStorage.isSimulatedOffline());
  const [queueCount, setQueueCount] = useState(offlineStorage.getQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const updateStatus = () => {
    setIsOnline(offlineStorage.isOnline());
    setIsSimulated(offlineStorage.isSimulatedOffline());
    setQueueCount(offlineStorage.getQueue().length);
  };

  useEffect(() => {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    window.addEventListener('smriti_connectivity_change', updateStatus);
    window.addEventListener('smriti_queue_updated', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('smriti_connectivity_change', updateStatus);
      window.removeEventListener('smriti_queue_updated', updateStatus);
    };
  }, []);

  const handleToggleOffline = (e) => {
    offlineStorage.setSimulatedOffline(e.target.checked);
    updateStatus();
  };

  const handleManualSync = async () => {
    if (queueCount === 0 || !isOnline) return;
    setIsSyncing(true);
    await offlineStorage.syncQueue();
    setIsSyncing(false);
    updateStatus();
  };

  const handleVoiceToggle = () => {
    const newState = voiceService.toggleVoice();
    setVoiceEnabled(newState);
  };

  return (
    <header className="header-bar">
      <div className="brand-badge" style={{ cursor: 'pointer' }} onClick={onHomeClick}>
        <span className="brand-logo" role="img" aria-label="brain">🧠</span>
        <div>
          <h1 className="brand-title">{t('app_name')}</h1>
          <p className="brand-subtitle">{t('app_subtitle')}</p>
        </div>
      </div>

      <nav className="header-controls" aria-label="Main Navigation">
        {/* Role Selectors */}
        <button
          className={`role-btn ${currentRole === 'elderly' ? 'active' : ''}`}
          onClick={() => setCurrentRole('elderly')}
          aria-pressed={currentRole === 'elderly'}
        >
          <User size={22} />
          <span>{t('role_elderly')}</span>
        </button>

        <button
          className={`role-btn ${currentRole === 'caregiver' ? 'active' : ''}`}
          onClick={() => setCurrentRole('caregiver')}
          aria-pressed={currentRole === 'caregiver'}
        >
          <Activity size={22} />
          <span>{t('role_caregiver')}</span>
        </button>

        <button
          className={`role-btn ${currentRole === 'research' ? 'active' : ''}`}
          onClick={() => setCurrentRole('research')}
          aria-pressed={currentRole === 'research'}
        >
          <FileText size={22} />
          <span>{t('role_research')}</span>
        </button>

        {/* Language Selector */}
        <select
          className="lang-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          aria-label="Select Language"
        >
          <option value="as">অসমীয়া (Assamese)</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="mr">मराठी (Marathi)</option>
          <option value="en">English</option>
        </select>

        {/* Voice Guidance Toggle */}
        <button
          className="role-btn"
          onClick={handleVoiceToggle}
          title="Toggle Voice Guidance"
          aria-label="Toggle Voice Guidance"
        >
          {voiceEnabled ? <Volume2 size={22} color="var(--primary)" /> : <VolumeX size={22} color="var(--danger)" />}
          <span>{voiceEnabled ? t('voice_on') : t('voice_off')}</span>
        </button>

        {/* Connectivity Status Pill */}
        <div className={`status-pill ${isSyncing ? 'status-syncing' : isOnline ? 'status-online' : 'status-offline'}`}>
          {isSyncing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>{t('status_syncing')}</span>
            </>
          ) : isOnline ? (
            <>
              <Wifi size={18} />
              <span>{t('status_online')}</span>
            </>
          ) : (
            <>
              <WifiOff size={18} />
              <span>{t('status_offline')}</span>
            </>
          )}
          {queueCount > 0 && (
            <span style={{ marginLeft: '4px', background: '#92400E', color: 'white', borderRadius: '12px', padding: '0 6px', fontSize: '0.8rem' }}>
              {queueCount}
            </span>
          )}
        </div>

        {/* Sync button if queue pending and online */}
        {isOnline && queueCount > 0 && (
          <button
            onClick={handleManualSync}
            className="role-btn"
            style={{ background: 'var(--accent-gold)', color: 'white', borderColor: 'var(--border-strong)' }}
          >
            <RefreshCw size={18} />
            <span>Sync ({queueCount})</span>
          </button>
        )}

        {/* Offline Simulator Switch for Research Demonstrations */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isSimulated}
            onChange={handleToggleOffline}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>{t('offline_mode_toggle')}</span>
        </label>
      </nav>
    </header>
  );
}
