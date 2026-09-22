import React, { useState } from 'react';
import {
  Save,
  Copy,
  Check,
  Download,
  Clock,
  Trash2,
  Code2,
  Terminal,
  FileCode2,
  Sparkles
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import { EXPORT_FORMATS, generateScraperCode } from '../../../shared/exporters/index.js';

export default function ExportTab({
  domain,
  pageUrl,
  collectionSelector,
  fields,
  recentSelectors,
  onClearRecentSelectors,
  onSaveProject,
  onCopyText,
  t
}) {
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS.CHEERIO);
  const [copiedCode, setCopiedCode] = useState(false);
  const [projectName, setProjectName] = useState(
    t('export.defaultProjectName', { domain: domain || t('common.custom') })
  );

  React.useEffect(() => {
    setProjectName(t('export.defaultProjectName', { domain: domain || t('common.custom') }));
  }, [domain, t]);

  const codeOutput = generateScraperCode(selectedFormat, {
    domain,
    url: pageUrl,
    collectionSelector: collectionSelector || 'article',
    fields: fields || []
  });

  const handleCopyCode = () => {
    onCopyText(codeOutput);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleDownloadConfig = () => {
    const jsonStr = generateScraperCode(EXPORT_FORMATS.JSON, {
      domain,
      url: pageUrl,
      collectionSelector: collectionSelector || 'article',
      fields: fields || []
    });

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedDomain = (domain || 'export').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${sanitizedDomain}-dom-scout-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSaveProject({
      id: `proj_${Date.now()}`,
      name: projectName,
      collectionSelector,
      fields
    });
  };

  const formats = [
    { id: EXPORT_FORMATS.JSON, label: 'JSON' },
    { id: EXPORT_FORMATS.VANILLA, label: 'Vanilla JS' },
    { id: EXPORT_FORMATS.CHEERIO, label: 'Cheerio' },
    { id: EXPORT_FORMATS.PUPPETEER, label: 'Puppeteer' },
    { id: EXPORT_FORMATS.PLAYWRIGHT, label: 'Playwright' }
  ];

  return (
    <div className="ds-export-tab">
      {/* 1. Project Info Card */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-project-header-left">
            <div className="ds-save-icon-box">
              <Save size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="ds-project-title-box">
              <input
                type="text"
                className="ds-project-name-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t('export.projectNamePlaceholder')}
              />
              <span className="ds-project-subtitle">
                {domain || t('header.activeTab')} • {fields.length} {t('collection.fields').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Collection & Fields Pills */}
        <div className="ds-export-meta-pills">
          <div className="ds-pill-group">
            <span className="ds-pill-label">{t('export.collectionLabel')}</span>
            <code className="ds-code-pill">{collectionSelector || 'article'}</code>
          </div>

          <div className="ds-pill-group">
            <span className="ds-pill-label">{t('export.fieldsLabel')}</span>
            <div className="ds-fields-pills-row">
              {fields.map((f) => (
                <span key={f.id} className="ds-field-pill">
                  <strong>{f.name}</strong> <code>{f.selector || '.'}</code>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Format Selector Tabs */}
      <div className="ds-format-segmented-nav">
        {formats.map((fmt) => (
          <button
            key={fmt.id}
            className={`ds-format-btn ${selectedFormat === fmt.id ? 'active' : ''}`}
            onClick={() => setSelectedFormat(fmt.id)}
            type="button"
          >
            {fmt.label}
          </button>
        ))}
      </div>

      {/* 3. Generated Code Box (Dark theme as in mockups) */}
      <div className="ds-code-editor-card">
        <div className="ds-code-editor-header">
          <span className="ds-code-editor-title">{selectedFormat}</span>
          <button
            className="ds-icon-btn ds-code-copy-btn"
            onClick={handleCopyCode}
            title={t('export.copyCode')}
            type="button"
          >
            {copiedCode ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <pre className="ds-code-block">
          <code>{codeOutput}</code>
        </pre>
      </div>

      {/* 4. Action Buttons Row */}
      <div className="ds-export-actions-row">
        <button
          className="ds-btn-secondary"
          onClick={handleCopyCode}
          type="button"
          style={{ flex: 1 }}
        >
          {copiedCode ? <Check size={14} /> : <Copy size={14} />}
          <span>{copiedCode ? t('inspect.copied') : t('export.copyCode')}</span>
        </button>

        <button
          className="ds-btn-secondary"
          onClick={handleDownloadConfig}
          type="button"
          style={{ flex: 1 }}
        >
          <Download size={14} />
          <span>{t('export.downloadConfig')}</span>
        </button>

        <button
          className="ds-btn-primary"
          onClick={handleSave}
          type="button"
          style={{ flex: 1 }}
        >
          <Save size={14} />
          <span>{t('export.saveProject')}</span>
        </button>
      </div>

      {/* 5. Recent Selectors History */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">
            <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
            <span>{t('export.recentSelectors')}</span>
          </div>
          {recentSelectors && recentSelectors.length > 0 && (
            <button
              className="ds-text-btn"
              onClick={onClearRecentSelectors}
              type="button"
            >
              {t('export.clearAll')}
            </button>
          )}
        </div>

        <div className="ds-recent-list">
          {(!recentSelectors || recentSelectors.length === 0) ? (
            <p className="ds-empty-val" style={{ fontSize: '11px', padding: '4px 0' }}>
              {t('export.noRecentSelectors')}
            </p>
          ) : (
            recentSelectors.map((item) => {
              const timeAgo = formatTimeAgo(item.timestamp, t);
              return (
                <div key={item.id} className="ds-recent-row">
                  <Clock size={12} className="ds-recent-clock" />
                  <code className="ds-recent-selector">{item.selector}</code>
                  <Badge variant="primary" size="sm">
                    {t(`recentTypes.${(item.type || 'selector').toLowerCase()}`) || item.type}
                  </Badge>
                  <span className="ds-recent-time">{timeAgo}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp, t) {
  if (!timestamp) return t('time.justNow');
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return t('time.secondsAgo', { sec });
  const min = Math.floor(sec / 60);
  if (min < 60) return t('time.minutesAgo', { min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('time.hoursAgo', { hr });
  return t('time.daysAgo', { days: Math.floor(hr / 24) });
}
