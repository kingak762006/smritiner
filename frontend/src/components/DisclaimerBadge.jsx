import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';

export default function DisclaimerBadge() {
  const { t } = useI18n();
  return (
    <div className="disclaimer-banner" role="alert">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        <AlertCircle size={20} />
        <span>{t('disclaimer_text')}</span>
      </div>
    </div>
  );
}
