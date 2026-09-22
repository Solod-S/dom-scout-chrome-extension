import React from 'react';
import { X, ShieldCheck, Info } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentLang,
  onSelectLang,
  t
}) {
  if (!isOpen) return null;

  const handleCheckbox = (key) => {
    onUpdateSettings({ [key]: !settings[key] });
  };

  const languages = [
    { code: 'system', label: t('settings.langSystem') },
    { code: 'en', label: t('settings.langEn') },
    { code: 'ru', label: t('settings.langRu') },
    { code: 'uk', label: t('settings.langUk') }
  ];

  return (
    <div className="ds-modal-backdrop" onClick={onClose}>
      <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ds-modal-header">
          <h2 className="ds-modal-title">{t('settings.title')}</h2>
          <button className="ds-icon-btn" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="ds-modal-body">
          {/* 1. Language Setting */}
          <div className="ds-setting-group">
            <label className="ds-setting-label">{t('settings.language')}</label>
            <div className="ds-radio-list">
              {languages.map((l) => (
                <label key={l.code} className="ds-radio-label">
                  <input
                    type="radio"
                    name="ds_lang"
                    value={l.code}
                    checked={settings.language === l.code}
                    onChange={() => onSelectLang(l.code)}
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Preferences */}
          <div className="ds-setting-group">
            <label className="ds-checkbox-label">
              <input
                type="checkbox"
                checked={!!settings.autoHighlight}
                onChange={() => handleCheckbox('autoHighlight')}
              />
              <span>{t('settings.autoHighlight')}</span>
            </label>

            <label className="ds-checkbox-label">
              <input
                type="checkbox"
                checked={!!settings.absoluteUrls}
                onChange={() => handleCheckbox('absoluteUrls')}
              />
              <span>{t('settings.absoluteUrls')}</span>
            </label>
          </div>

          {/* 3. Max preview rows */}
          <div className="ds-setting-group">
            <label className="ds-setting-label">{t('settings.maxPreview')}</label>
            <select
              className="ds-field-select"
              value={settings.maxPreviewRows || 25}
              onChange={(e) => onUpdateSettings({ maxPreviewRows: Number(e.target.value) })}
              style={{ width: '100%', height: '32px' }}
            >
              <option value="10">{t('settings.rows10')}</option>
              <option value="25">{t('settings.rows25')}</option>
              <option value="50">{t('settings.rows50')}</option>
              <option value="0">{t('settings.rowsAll')}</option>
            </select>
          </div>

          {/* 4. Privacy & About */}
          <div className="ds-about-box">
            <div className="ds-about-header">
              <ShieldCheck size={16} style={{ color: 'var(--success-color)' }} />
              <strong>{t('settings.privacy')}</strong>
            </div>
            <p className="ds-about-text">{t('settings.privacyDesc')}</p>
            <div className="ds-about-version">
              <span>{t('appName')} • {t('settings.version')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
