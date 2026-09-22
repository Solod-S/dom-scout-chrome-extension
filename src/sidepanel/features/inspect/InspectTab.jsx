import React, { useState } from 'react';
import {
  Crosshair,
  Copy,
  Check,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import ScoreCircle from '../../components/ScoreCircle.jsx';

export default function InspectTab({
  isInspecting,
  onToggleInspect,
  selectedElement,
  selectorCandidates,
  onHighlightSelector,
  onClearHighlight,
  onTestSelector,
  onCopyText,
  t
}) {
  const [attributesExpanded, setAttributesExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [testerInput, setTesterInput] = useState('');
  const [testerResult, setTesterResult] = useState(null);

  const handleCopy = (text, key) => {
    onCopyText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleTesterChange = (val) => {
    setTesterInput(val);
    if (!val.trim()) {
      setTesterResult(null);
      onClearHighlight();
      return;
    }
    const isXPath = val.trim().startsWith('//');
    onTestSelector(val.trim(), isXPath, (res) => {
      setTesterResult(res);
    });
  };

  const recommendedCandidate = selectorCandidates && selectorCandidates.length > 0
    ? selectorCandidates[0]
    : null;

  const alternativeCandidate = selectorCandidates && selectorCandidates.length > 1
    ? selectorCandidates[1]
    : null;

  return (
    <div className="ds-inspect-tab">
      {/* 1. Main Action Button & Shortcut Hint */}
      <div className="ds-inspect-action-bar">
        <button
          className={`ds-btn-primary ${isInspecting ? 'ds-btn-inspecting' : ''}`}
          onClick={onToggleInspect}
          type="button"
          style={{ width: '100%', height: '38px' }}
        >
          <Crosshair size={16} />
          <span>{isInspecting ? t('inspect.stopInspecting') : t('inspect.inspectElement')}</span>
        </button>

        <div className="ds-inspect-hint-text">
          <span>{t('inspect.inspectHint')}</span>
          <kbd className="ds-kbd">⌥⇧I</kbd>
        </div>
      </div>

      {/* 2. Empty State (When no element selected) */}
      {!selectedElement && (
        <div className="ds-card ds-empty-card">
          <div className="ds-empty-icon-box">
            <Crosshair size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h3 className="ds-empty-title">{t('inspect.noElementSelected')}</h3>
          <p className="ds-empty-desc">{t('inspect.noElementHint')}</p>
        </div>
      )}

      {/* 3. Selected Element Overview Card */}
      {selectedElement && (
        <div className="ds-card">
          <div className="ds-card-header">
            <div className="ds-card-title">
              <span style={{ color: 'var(--text-secondary)' }}>{t('inspect.selectedElement')}</span>
            </div>
            <button
              className="ds-icon-btn"
              onClick={() => setAttributesExpanded(!attributesExpanded)}
              title={t('inspect.toggleAttributes')}
              type="button"
            >
              {attributesExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          <div className="ds-element-summary">
            <div className="ds-element-icon-box">
              <span className="ds-code-brackets">&lt;/&gt;</span>
            </div>
            <div className="ds-element-meta">
              <div className="ds-element-tag-row">
                <span className="ds-tag-name">&lt;{selectedElement.tagName}&gt;</span>
                {selectedElement.semanticType && (
                  <Badge variant="primary" size="sm">
                    {t(`semanticTypes.${selectedElement.semanticType.toLowerCase()}`) || selectedElement.semanticType}
                  </Badge>
                )}
              </div>
              <div className="ds-element-class-name">
                {selectedElement.id ? `#${selectedElement.id}` : ''}
                {selectedElement.classes && selectedElement.classes.length > 0
                  ? `.${selectedElement.classes.join('.')}`
                  : ''}
              </div>
            </div>
          </div>

          {selectedElement.textPreview && (
            <div className="ds-element-quote">
              "{selectedElement.textPreview}"
            </div>
          )}

          {/* Collapsible Attributes */}
          {attributesExpanded && selectedElement.attributes && (
            <div className="ds-attributes-table">
              <div className="ds-attributes-title">{t('inspect.attributes')}</div>
              {Object.entries(selectedElement.attributes).map(([attr, val]) => (
                <div key={attr} className="ds-attribute-row">
                  <span className="ds-attr-name">{attr}</span>
                  <span className="ds-attr-val" title={val}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Selector Candidates Section */}
      {selectedElement && selectorCandidates && selectorCandidates.length > 0 && (
        <div className="ds-card">
          <div className="ds-card-header">
            <div className="ds-card-title">
              <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>{t('inspect.candidates')}</span>
            </div>
            <span className="ds-match-count-label">
              {t('inspect.matchCount', { count: recommendedCandidate?.matchCount || 0 })}
            </span>
          </div>

          <div className="ds-candidates-list">
            {/* Recommended Selector */}
            {recommendedCandidate && (
              <div
                className="ds-candidate-card ds-candidate-recommended"
                onMouseEnter={() => onHighlightSelector(recommendedCandidate.selector, recommendedCandidate.type === 'xpath')}
                onMouseLeave={onClearHighlight}
              >
                <div className="ds-candidate-top">
                  <div className="ds-candidate-badge">
                    <Star size={12} fill="#16A34A" stroke="#16A34A" />
                    <span>{t('inspect.recommended')}</span>
                  </div>
                  <div className="ds-candidate-score-row">
                    <ScoreCircle score={recommendedCandidate.score} size={32} />
                    <Badge variant={recommendedCandidate.quality === 'stable' ? 'success' : 'warning'} size="sm">
                      {t(`inspect.${recommendedCandidate.quality}`)}
                    </Badge>
                  </div>
                </div>

                <div className="ds-candidate-selector-row">
                  <code className="ds-code-selector">{recommendedCandidate.selector}</code>
                  <button
                    className="ds-btn-secondary ds-btn-sm"
                    onClick={() => handleCopy(recommendedCandidate.selector, 'recommended')}
                    type="button"
                    title={t('inspect.copy')}
                  >
                    {copiedKey === 'recommended' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'recommended' ? t('inspect.copied') : t('inspect.copy')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Alternative Selector */}
            {alternativeCandidate && (
              <div
                className="ds-candidate-card"
                onMouseEnter={() => onHighlightSelector(alternativeCandidate.selector, alternativeCandidate.type === 'xpath')}
                onMouseLeave={onClearHighlight}
              >
                <div className="ds-candidate-top">
                  <div className="ds-candidate-badge" style={{ color: 'var(--text-secondary)' }}>
                    <Layers size={12} />
                    <span>{t('inspect.alternative')}</span>
                  </div>
                </div>

                <div className="ds-candidate-selector-row">
                  <code className="ds-code-selector">{alternativeCandidate.selector}</code>
                  <button
                    className="ds-btn-secondary ds-btn-sm"
                    onClick={() => handleCopy(alternativeCandidate.selector, 'alternative')}
                    type="button"
                    title={t('inspect.copy')}
                  >
                    {copiedKey === 'alternative' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'alternative' ? t('inspect.copied') : t('inspect.copy')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Selector Quality Metrics */}
      {recommendedCandidate && (
        <div className="ds-card">
          <div className="ds-card-header">
            <div className="ds-card-title">{t('inspect.quality')}</div>
          </div>

          <div className="ds-quality-grid">
            {/* Score box */}
            <div className="ds-quality-metric-box">
              <ScoreCircle score={recommendedCandidate.score} size={42} />
              <div className="ds-quality-text">
                <Badge variant={recommendedCandidate.quality === 'stable' ? 'success' : 'warning'} size="sm">
                  {t(`inspect.${recommendedCandidate.quality}`)}
                </Badge>
                <p className="ds-quality-desc">{t(`inspect.${recommendedCandidate.quality}Desc`)}</p>
              </div>
            </div>

            {/* Matches count box */}
            <div className="ds-quality-metric-box">
              <div className="ds-matches-big-count">{recommendedCandidate.matchCount}</div>
              <div className="ds-quality-text">
                <span className="ds-matches-sub">{t('inspect.matches')}</span>
                <p className="ds-quality-desc">{t('inspect.matchesDesc')}</p>
              </div>
            </div>
          </div>

          {/* Why this selector checklist */}
          {recommendedCandidate.reasons && recommendedCandidate.reasons.length > 0 && (
            <div className="ds-why-section">
              <div className="ds-why-title">{t('inspect.whyTitle')}</div>
              <ul className="ds-why-list">
                {recommendedCandidate.reasons.map((r, idx) => (
                  <li key={idx} className={`ds-why-item ${r.type}`}>
                    {r.type === 'positive' && <Check size={13} className="ds-why-icon positive" />}
                    {r.type === 'negative' && <AlertCircle size={13} className="ds-why-icon negative" />}
                    {r.type === 'neutral' && <span className="ds-why-dot" />}
                    <span>{r.key ? t(`whyReasons.${r.key}`, r.params) : r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. Live Selector Tester */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">
            <Search size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{t('inspect.testerTitle')}</span>
          </div>
          {testerResult && (
            <Badge variant={testerResult.valid ? (testerResult.matchCount > 0 ? 'success' : 'warning') : 'error'} size="sm">
              {testerResult.valid ? `${testerResult.matchCount} ${t('inspect.matches')}` : t('inspect.invalid')}
            </Badge>
          )}
        </div>

        <div className="ds-tester-input-wrapper">
          <input
            type="text"
            className="ds-input ds-tester-input"
            placeholder={t('inspect.testerPlaceholder')}
            value={testerInput}
            onChange={(e) => handleTesterChange(e.target.value)}
          />
        </div>

        {testerResult && !testerResult.valid && (
          <div className="ds-tester-error">
            <AlertCircle size={12} />
            <span>{t('inspect.invalidSyntax')}: {testerResult.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
