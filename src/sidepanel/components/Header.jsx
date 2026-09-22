import React, { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, X, ChevronDown, Check } from 'lucide-react';

export default function Header({ domain, currentLang, onSelectLang, onOpenSettings, t }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'ru', label: 'RU', fullName: 'Русский' },
    { code: 'uk', label: 'UK', fullName: 'Українська' }
  ];

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0];

  const handleClose = () => {
    window.close();
  };

  const domainDisplay = domain || t('header.activeTab');

  return (
    <header className="ds-header">
      <div className="ds-header-left">
        {/* DOM Scout Diamond Logo */}
        <div className="ds-logo-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L21 12L12 22L3 12L12 2Z"
              fill="url(#logo_grad)"
              stroke="#4338CA"
              strokeWidth="1.5"
            />
            {/* Code symbol < > */}
            <path
              d="M9.5 9.5L7 12L9.5 14.5M14.5 9.5L17 12L14.5 14.5"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="logo_grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#2563EB" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="ds-title-container">
          <h1 className="ds-brand-name">DOM Scout</h1>
          <span className="ds-domain-badge" title={domainDisplay}>
            {domainDisplay}
          </span>
        </div>
      </div>

      <div className="ds-header-right">
        {/* Language selector dropdown */}
        <div className="ds-lang-dropdown" ref={menuRef}>
          <button
            className="ds-lang-btn"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            title={t('header.switchLanguage')}
            type="button"
          >
            <span>{activeLangObj.label}</span>
            <ChevronDown size={13} className={`ds-chevron ${langMenuOpen ? 'open' : ''}`} />
          </button>

          {langMenuOpen && (
            <div className="ds-lang-menu">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`ds-lang-option ${currentLang === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    onSelectLang(lang.code);
                    setLangMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>{lang.fullName}</span>
                  {currentLang === lang.code && <Check size={13} className="ds-lang-check" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          className="ds-icon-btn"
          onClick={onOpenSettings}
          title={t('settings.title')}
          type="button"
          aria-label={t('settings.title')}
        >
          <SettingsIcon size={16} />
        </button>

        {/* Close panel button */}
        <button
          className="ds-icon-btn"
          onClick={handleClose}
          title={t('header.closePanel')}
          type="button"
          aria-label={t('header.closePanel')}
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
}
