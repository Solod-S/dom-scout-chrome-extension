import React, { useState } from 'react';
import {
  LayoutGrid,
  Plus,
  Wand2,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  GripVertical,
  AlertTriangle
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';

export default function CollectionTab({
  collectionCandidates,
  activeCollectionSelector,
  onSelectCollectionSelector,
  fields,
  onUpdateFields,
  previewData,
  onRefreshPreview,
  onAutoDetectFields,
  onNavigateToExport,
  onCopyText,
  t
}) {
  const [isEditingSelector, setIsEditingSelector] = useState(false);
  const [manualSelector, setManualSelector] = useState(activeCollectionSelector || '');
  const [copiedData, setCopiedData] = useState(false);

  const bestCandidate = collectionCandidates && collectionCandidates.length > 0
    ? collectionCandidates[0]
    : null;

  const currentSelector = activeCollectionSelector || (bestCandidate ? bestCandidate.selector : '');
  const totalItems = previewData ? previewData.totalItems : (bestCandidate ? bestCandidate.matchCount : 0);

  const handleUseCollection = () => {
    if (bestCandidate) {
      onSelectCollectionSelector(bestCandidate.selector);
      setIsEditingSelector(false);
    }
  };

  const handleApplyManualSelector = () => {
    if (manualSelector.trim()) {
      onSelectCollectionSelector(manualSelector.trim());
      setIsEditingSelector(false);
    }
  };

  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      name: `field_${fields.length + 1}`,
      selector: '',
      extractType: 'text',
      attribute: ''
    };
    onUpdateFields([...fields, newField]);
  };

  const handleRemoveField = (id) => {
    onUpdateFields(fields.filter((f) => f.id !== id));
  };

  const handleFieldChange = (id, key, val) => {
    onUpdateFields(
      fields.map((f) => {
        if (f.id === id) {
          const updated = { ...f, [key]: val };
          if (key === 'extractType') {
            if (val === 'href') updated.transform = 'absoluteUrl';
            if (val === 'src') updated.transform = 'absoluteUrl';
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleCopyData = () => {
    if (!previewData || !previewData.rows) return;
    const cleanRows = previewData.rows.map((r) => {
      const { _index, ...rest } = r;
      return rest;
    });
    onCopyText(JSON.stringify(cleanRows, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 1800);
  };

  return (
    <div className="ds-collection-tab">
      {/* 1. Collection Detection / Selection Card */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-collection-header-left">
            <div className="ds-grid-icon-box">
              <LayoutGrid size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="ds-collection-title-box">
              <h3 className="ds-card-title">{t('collection.detectedTitle')}</h3>
              <p className="ds-collection-subtitle">
                {t('collection.detectedSubtitle', { count: totalItems })}{' '}
                <code className="ds-code-pill">{currentSelector || 'none'}</code>
              </p>
            </div>
          </div>
          <Badge variant="success" size="md">
            {t('common.itemsCount', { count: totalItems })}
          </Badge>
        </div>

        {isEditingSelector ? (
          <div className="ds-manual-selector-row">
            <input
              type="text"
              className="ds-input"
              value={manualSelector}
              onChange={(e) => setManualSelector(e.target.value)}
              placeholder={t('collection.manualPlaceholder')}
            />
            <button
              className="ds-btn-primary ds-btn-sm"
              onClick={handleApplyManualSelector}
              type="button"
            >
              {t('common.apply')}
            </button>
            <button
              className="ds-btn-secondary ds-btn-sm"
              onClick={() => setIsEditingSelector(false)}
              type="button"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <div className="ds-collection-actions-row">
            <button
              className="ds-btn-primary"
              onClick={handleUseCollection}
              type="button"
              style={{ flex: 1 }}
            >
              {t('collection.useCollection')}
            </button>
            <button
              className="ds-btn-secondary"
              onClick={() => {
                setManualSelector(currentSelector);
                setIsEditingSelector(true);
              }}
              type="button"
              style={{ flex: 1 }}
            >
              {t('collection.editSelector')}
            </button>
          </div>
        )}
      </div>

      {/* 2. Collection Fields Configuration */}
      <div className="ds-card">
        <div className="ds-card-header">
          <div className="ds-card-title">{t('collection.fields')}</div>
          <div className="ds-fields-header-actions">
            <button
              className="ds-text-btn"
              onClick={onAutoDetectFields}
              type="button"
              title={t('collection.autoDetect')}
            >
              <Wand2 size={13} />
              <span>{t('collection.autoDetect')}</span>
            </button>
            <button
              className="ds-text-btn"
              onClick={handleAddField}
              type="button"
              title={t('collection.addField')}
            >
              <Plus size={13} />
              <span>{t('collection.addField')}</span>
            </button>
          </div>
        </div>

        <div className="ds-fields-list">
          {fields.map((field) => {
            const coverage = previewData && previewData.coverage
              ? previewData.coverage[field.name]
              : null;
            const isFullCoverage = coverage ? coverage.percentage === 100 : true;

            return (
              <div key={field.id} className="ds-field-row">
                <GripVertical size={14} className="ds-grip-icon" />

                {/* Field Name */}
                <input
                  type="text"
                  className="ds-field-input ds-field-name"
                  value={field.name}
                  onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                  placeholder={t('collection.fieldNamePlaceholder')}
                />

                {/* Selector Input */}
                <input
                  type="text"
                  className="ds-field-input ds-field-selector"
                  value={field.selector}
                  onChange={(e) => handleFieldChange(field.id, 'selector', e.target.value)}
                  placeholder={t('collection.selectorPlaceholder')}
                />

                {/* Extract Type Selector */}
                <select
                  className="ds-field-select"
                  value={field.extractType}
                  onChange={(e) => handleFieldChange(field.id, 'extractType', e.target.value)}
                >
                  <option value="text">{t('extractionTypes.text')}</option>
                  <option value="href">{t('extractionTypes.href')}</option>
                  <option value="src">{t('extractionTypes.src')}</option>
                  <option value="attribute">{t('extractionTypes.attribute')}</option>
                  <option value="html">{t('extractionTypes.html')}</option>
                </select>

                {/* Optional Attribute Name */}
                {field.extractType === 'attribute' && (
                  <input
                    type="text"
                    className="ds-field-input ds-field-attr"
                    value={field.attribute || ''}
                    onChange={(e) => handleFieldChange(field.id, 'attribute', e.target.value)}
                    placeholder={t('collection.attrPlaceholder')}
                  />
                )}

                {/* Coverage Pill */}
                {coverage ? (
                  <Badge variant={isFullCoverage ? 'success' : 'warning'} size="sm">
                    {coverage.found}/{coverage.total}
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">—</Badge>
                )}

                {/* Delete button */}
                <button
                  className="ds-field-del-btn"
                  onClick={() => handleRemoveField(field.id)}
                  title={t('collection.removeField')}
                  type="button"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Data Preview Table */}
      {previewData && previewData.rows && previewData.rows.length > 0 && (
        <div className="ds-card">
          <div className="ds-card-header">
            <div className="ds-card-title">{t('collection.dataPreview')}</div>
            <span className="ds-match-count-label">
              {t('collection.showingItems', {
                shown: previewData.rows.length,
                total: previewData.totalItems
              })}
            </span>
          </div>

          <div className="ds-table-scroll-wrapper">
            <table className="ds-preview-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}>#</th>
                  {fields.map((f) => (
                    <th key={f.id}>{f.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row) => (
                  <tr key={row._index}>
                    <td className="ds-td-index">{row._index}</td>
                    {fields.map((f) => {
                      const val = row[f.name];
                      return (
                        <td key={f.id} title={val || ''}>
                          {val !== null && val !== undefined && val !== '' ? (
                            String(val)
                          ) : (
                            <span className="ds-empty-val">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Field Coverage & Duplicates Summary Grid */}
      {previewData && previewData.coverage && (
        <div className="ds-card">
          <div className="ds-card-header">
            <div className="ds-card-title">{t('collection.fieldCoverage')}</div>
          </div>

          <div className="ds-coverage-grid">
            {fields.map((f) => {
              const cov = previewData.coverage[f.name];
              if (!cov) return null;
              const isFull = cov.percentage === 100;
              return (
                <div key={f.id} className="ds-coverage-item">
                  <span className="ds-coverage-name">{f.name}</span>
                  <Badge variant={isFull ? 'success' : 'warning'} size="sm">
                    {cov.found}/{cov.total}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Duplicate warnings */}
          {previewData.duplicates && (
            <div className="ds-duplicate-section">
              {Object.entries(previewData.duplicates).map(([fname, dup]) => {
                if (dup.duplicateCount > 0) {
                  return (
                    <div key={fname} className="ds-duplicate-item">
                      <AlertTriangle size={12} className="ds-warn-icon" />
                      <span>
                        <strong>{fname}</strong>:{' '}
                        {t('collection.duplicateNotice', {
                          unique: dup.unique,
                          total: dup.total,
                          duplicates: dup.duplicateCount
                        })}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Bottom Actions */}
      <div className="ds-collection-bottom-bar">
        <button
          className="ds-btn-secondary"
          onClick={handleCopyData}
          type="button"
          style={{ flex: 1 }}
        >
          {copiedData ? <Check size={14} /> : <Copy size={14} />}
          <span>{copiedData ? t('inspect.copied') : t('collection.copyData')}</span>
        </button>

        <button
          className="ds-btn-primary"
          onClick={onNavigateToExport}
          type="button"
          style={{ flex: 1 }}
        >
          <span>{t('collection.export')}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
