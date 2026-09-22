import React, { useState } from 'react';
import {
  Globe,
  Tag,
  Database,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Badge from '../../components/Badge.jsx';

export default function AnalyzeTab({
  analysisData,
  onRefreshAnalysis,
  onCopyText,
  t
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [sectionsOpen, setSectionsOpen] = useState({
    page: true,
    meta: true,
    openGraph: true,
    structuredData: true,
    detectedContent: true
  });
  const [expandedJsonId, setExpandedJsonId] = useState(null);

  const toggleSection = (sec) => {
    setSectionsOpen((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    onCopyText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  if (!analysisData) {
    return (
      <div className="ds-card ds-empty-card">
        <RefreshCw size={24} className="ds-spin" style={{ color: 'var(--accent-primary)' }} />
        <h3 className="ds-empty-title">{t('analyze.analyzing')}</h3>
      </div>
    );
  }

  const { page, meta, structuredData, detectedContent } = analysisData;

  return (
    <div className="ds-analyze-tab">
      {/* 1. Page Information Section */}
      <div className="ds-card">
        <div className="ds-card-header" onClick={() => toggleSection('page')} style={{ cursor: 'pointer' }}>
          <div className="ds-card-title">
            <Globe size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{t('analyze.page')}</span>
          </div>
          <button className="ds-icon-btn" type="button">
            {sectionsOpen.page ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {sectionsOpen.page && (
          <div className="ds-key-val-list">
            <div className="ds-key-val-row">
              <span className="ds-kv-key">{t('analyze.pageUrl')}</span>
              <span className="ds-kv-val" title={page.url}>{page.url}</span>
              <button
                className="ds-icon-btn ds-kv-copy"
                onClick={() => handleCopy(page.url, 'pageUrl')}
                title="Copy"
                type="button"
              >
                {copiedKey === 'pageUrl' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>

            <div className="ds-key-val-row">
              <span className="ds-kv-key">{t('analyze.canonicalUrl')}</span>
              <span className="ds-kv-val" title={page.canonicalUrl}>{page.canonicalUrl}</span>
              <button
                className="ds-icon-btn ds-kv-copy"
                onClick={() => handleCopy(page.canonicalUrl, 'canonicalUrl')}
                title="Copy"
                type="button"
              >
                {copiedKey === 'canonicalUrl' ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>

            <div className="ds-key-val-row">
              <span className="ds-kv-key">{t('analyze.contentType')}</span>
              <span className="ds-kv-val">{page.contentType}</span>
            </div>

            <div className="ds-key-val-row">
              <span className="ds-kv-key">{t('analyze.statusCode')}</span>
              <span className="ds-kv-val">
                <Badge variant="success" size="sm">200</Badge>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Meta Tags Section */}
      <div className="ds-card">
        <div className="ds-card-header" onClick={() => toggleSection('meta')} style={{ cursor: 'pointer' }}>
          <div className="ds-card-title">
            <Tag size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{t('analyze.meta')}</span>
          </div>
          <button className="ds-icon-btn" type="button">
            {sectionsOpen.meta ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {sectionsOpen.meta && (
          <div className="ds-key-val-list">
            <div className="ds-key-val-row">
              <span className="ds-kv-key">{t('analyze.title')}</span>
              <span className="ds-kv-val" title={meta.title}>{meta.title || '—'}</span>
              {meta.title && (
                <button
                  className="ds-icon-btn ds-kv-copy"
                  onClick={() => handleCopy(meta.title, 'metaTitle')}
                  type="button"
                >
                  {copiedKey === 'metaTitle' ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
            </div>

            <div className="ds-key-val-row">
              <span className="ds-kv-key">{t('analyze.description')}</span>
              <span className="ds-kv-val" title={meta.description}>{meta.description || '—'}</span>
              {meta.description && (
                <button
                  className="ds-icon-btn ds-kv-copy"
                  onClick={() => handleCopy(meta.description, 'metaDesc')}
                  type="button"
                >
                  {copiedKey === 'metaDesc' ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
            </div>

            {/* Nested Open Graph Box */}
            {meta.openGraph && meta.openGraph.length > 0 && (
              <div className="ds-nested-box">
                <div
                  className="ds-nested-header"
                  onClick={() => toggleSection('openGraph')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="ds-nested-title">
                    {t('analyze.openGraph', { count: meta.openGraph.length })}
                  </span>
                  <button className="ds-icon-btn" type="button">
                    {sectionsOpen.openGraph ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>

                {sectionsOpen.openGraph && (
                  <div className="ds-nested-content">
                    {meta.openGraph.map((og, idx) => (
                      <div key={idx} className="ds-key-val-row">
                        <span className="ds-kv-key ds-kv-prop">{og.property}</span>
                        <span className="ds-kv-val" title={og.content}>{og.content}</span>
                        <button
                          className="ds-icon-btn ds-kv-copy"
                          onClick={() => handleCopy(og.content, `og_${idx}`)}
                          type="button"
                        >
                          {copiedKey === `og_${idx}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Structured Data (JSON-LD) Section */}
      <div className="ds-card">
        <div className="ds-card-header" onClick={() => toggleSection('structuredData')} style={{ cursor: 'pointer' }}>
          <div className="ds-card-title">
            <Database size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{t('analyze.structuredData')}</span>
          </div>
          <button className="ds-icon-btn" type="button">
            {sectionsOpen.structuredData ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {sectionsOpen.structuredData && (
          <div className="ds-structured-list">
            <div className="ds-structured-subtitle">
              {t('analyze.jsonLdTitle', { count: structuredData.length })}
            </div>

            {structuredData.length === 0 ? (
              <p className="ds-empty-val" style={{ fontSize: '11px', padding: '4px 0' }}>
                {t('analyze.noStructuredData')}
              </p>
            ) : (
              structuredData.map((schema) => {
                const isExpanded = expandedJsonId === schema.id;
                return (
                  <div key={schema.id} className="ds-schema-card">
                    <div
                      className="ds-schema-row"
                      onClick={() => setExpandedJsonId(isExpanded ? null : schema.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="ds-schema-type">{schema.type}</span>
                      <div className="ds-schema-right">
                        <Badge variant="default" size="sm">{t('analyze.oneItem')}</Badge>
                        <ChevronDown size={14} className={`ds-chevron ${isExpanded ? 'open' : ''}`} />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ds-schema-details">
                        <div className="ds-schema-actions">
                          <button
                            className="ds-btn-secondary ds-btn-sm"
                            onClick={() => handleCopy(JSON.stringify(schema.data, null, 2), `json_${schema.id}`)}
                            type="button"
                          >
                            {copiedKey === `json_${schema.id}` ? <Check size={11} /> : <Copy size={11} />}
                            <span>{t('analyze.copyJson')}</span>
                          </button>
                        </div>
                        <pre className="ds-json-tree">
                          {JSON.stringify(schema.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 4. Detected Content Heuristics */}
      {detectedContent && (
        <div className="ds-card">
          <div className="ds-card-header" onClick={() => toggleSection('detectedContent')} style={{ cursor: 'pointer' }}>
            <div className="ds-card-title">
              <FileText size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>{t('analyze.detectedContent')}</span>
            </div>
            <button className="ds-icon-btn" type="button">
              {sectionsOpen.detectedContent ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {sectionsOpen.detectedContent && (
            <div className="ds-key-val-list">
              {detectedContent.headline && (
                <div className="ds-key-val-row">
                  <span className="ds-kv-key">{t('analyze.headline')}</span>
                  <span className="ds-kv-val" title={detectedContent.headline}>
                    {detectedContent.headline}
                  </span>
                  <button
                    className="ds-icon-btn ds-kv-copy"
                    onClick={() => handleCopy(detectedContent.headline, 'dcHeadline')}
                    type="button"
                  >
                    {copiedKey === 'dcHeadline' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {detectedContent.publicationDate && (
                <div className="ds-key-val-row">
                  <span className="ds-kv-key">{t('analyze.publicationDate')}</span>
                  <span className="ds-kv-val">{detectedContent.publicationDate}</span>
                  <button
                    className="ds-icon-btn ds-kv-copy"
                    onClick={() => handleCopy(detectedContent.publicationDate, 'dcDate')}
                    type="button"
                  >
                    {copiedKey === 'dcDate' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {detectedContent.author && (
                <div className="ds-key-val-row">
                  <span className="ds-kv-key">{t('analyze.author')}</span>
                  <span className="ds-kv-val">{detectedContent.author}</span>
                  <button
                    className="ds-icon-btn ds-kv-copy"
                    onClick={() => handleCopy(detectedContent.author, 'dcAuthor')}
                    type="button"
                  >
                    {copiedKey === 'dcAuthor' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {detectedContent.articleBodyLength > 0 && (
                <div className="ds-key-val-row">
                  <span className="ds-kv-key">{t('analyze.articleBody')}</span>
                  <span className="ds-kv-val">
                    {t('analyze.chars', { count: detectedContent.articleBodyLength.toLocaleString() })}
                  </span>
                </div>
              )}

              {detectedContent.mainImage && (
                <div className="ds-key-val-row">
                  <span className="ds-kv-key">{t('analyze.mainImage')}</span>
                  <div className="ds-image-preview-cell">
                    <img
                      src={detectedContent.mainImage}
                      alt="Main"
                      className="ds-thumb-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="ds-kv-val" title={detectedContent.mainImage}>
                      {detectedContent.mainImage}
                    </span>
                  </div>
                  <button
                    className="ds-icon-btn ds-kv-copy"
                    onClick={() => handleCopy(detectedContent.mainImage, 'dcImg')}
                    type="button"
                  >
                    {copiedKey === 'dcImg' ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
