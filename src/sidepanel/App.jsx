import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import Tabs from './components/Tabs.jsx';
import Toast from './components/Toast.jsx';
import InspectTab from './features/inspect/InspectTab.jsx';
import CollectionTab from './features/collection/CollectionTab.jsx';
import AnalyzeTab from './features/analyze/AnalyzeTab.jsx';
import ExportTab from './features/export/ExportTab.jsx';
import SettingsModal from './features/settings/SettingsModal.jsx';

import {
  getSettings,
  saveSettings,
  saveProject,
  getRecentSelectors,
  addRecentSelector,
  clearRecentSelectors
} from '../shared/storage/index.js';
import { resolveLanguage, t as translate } from '../shared/i18n/index.js';
import { MESSAGE_TYPES } from '../shared/constants/messages.js';

import './styles/tokens.css';
import './styles/layout.css';
import './styles/inspect.css';
import './styles/collection.css';
import './styles/analyze.css';
import './styles/export.css';
import './styles/modal.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspect');
  const [languageSetting, setLanguageSetting] = useState('system');
  const [effectiveLang, setEffectiveLang] = useState('en');
  const [settings, setSettings] = useState({
    autoHighlight: true,
    absoluteUrls: true,
    maxPreviewRows: 25
  });

  const [activeDomain, setActiveDomain] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [activeTabId, setActiveTabId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Feature states
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectorCandidates, setSelectorCandidates] = useState([]);
  const [collectionCandidates, setCollectionCandidates] = useState([]);
  const [activeCollectionSelector, setActiveCollectionSelector] = useState('');
  const [fields, setFields] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [recentSelectors, setRecentSelectors] = useState([]);

  // Mutable refs to prevent stale closures in browser event listeners
  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;

  const isInspectingRef = useRef(isInspecting);
  isInspectingRef.current = isInspecting;

  // Translation helper bound to current language
  const t = useCallback((key, params) => translate(key, params, effectiveLang), [effectiveLang]);

  const showToast = (message, duration = 2400) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, duration);
  };

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    showToast(t('inspect.copied'));
  };

  // Ensure content script is active in the target tab
  const ensureContentScript = useCallback(async (tabId) => {
    if (!tabId || typeof chrome === 'undefined' || !chrome.tabs) return false;
    try {
      const ping = await chrome.tabs.sendMessage(tabId, {
        type: MESSAGE_TYPES.PING,
        payload: { lang: effectiveLang }
      });
      if (ping && ping.success) return true;
    } catch (e) {
      // Content script not responding, attempt dynamic injection
      if (chrome.scripting && chrome.scripting.executeScript) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content/content.js']
          });
          await new Promise((r) => setTimeout(r, 60));
          return true;
        } catch (injectErr) {
          console.warn('[DOM Scout] Injection failed for tab', tabId, injectErr);
        }
      }
    }
    return false;
  }, [effectiveLang]);

  // Safe tab message sender with auto-injection and retry
  const sendTabMessage = useCallback(async (message) => {
    let tabId = activeTabIdRef.current;
    if (!tabId && typeof chrome !== 'undefined' && chrome.tabs) {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const currentTab = tabs && tabs[0];
      if (currentTab && currentTab.id) {
        tabId = currentTab.id;
        setActiveTabId(tabId);
      }
    }

    if (!tabId) return null;

    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (err) {
      // Script might not be loaded yet in this tab; inject & retry
      const injected = await ensureContentScript(tabId);
      if (injected) {
        try {
          return await chrome.tabs.sendMessage(tabId, message);
        } catch (retryErr) {
          console.warn('[DOM Scout] sendTabMessage retry failed:', retryErr);
        }
      }
      return null;
    }
  }, [ensureContentScript]);

  // Load initial settings and history
  useEffect(() => {
    async function init() {
      const storedSettings = await getSettings();
      setSettings(storedSettings);
      const lang = storedSettings.language || 'system';
      setLanguageSetting(lang);
      setEffectiveLang(resolveLanguage(lang));

      const recents = await getRecentSelectors();
      setRecentSelectors(recents);
    }
    init();
  }, []);

  // Language update handler
  const handleSelectLanguage = async (newLang) => {
    setLanguageSetting(newLang);
    const resolved = resolveLanguage(newLang);
    setEffectiveLang(resolved);
    await saveSettings({ language: newLang });
    sendTabMessage({
      type: 'SET_LANGUAGE',
      payload: { lang: resolved }
    });
    showToast(t('toast.languageUpdated'));
  };

  // Settings update handler
  const handleUpdateSettings = async (partial) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
  };

  // Update active tab information and sync with browser state
  const updateTabInfo = useCallback(async (tabOrId) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      // Dev fallback
      setActiveDomain('example.com');
      setPageUrl('https://example.com/news');
      return;
    }

    try {
      let tab = null;
      if (typeof tabOrId === 'number') {
        tab = await chrome.tabs.get(tabOrId).catch(() => null);
      } else if (tabOrId && typeof tabOrId === 'object') {
        tab = tabOrId;
      }

      if (!tab) {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        tab = tabs && tabs[0];
        if (!tab) {
          const winTabs = await chrome.tabs.query({ active: true, currentWindow: true });
          tab = winTabs && winTabs[0];
        }
      }

      if (!tab || !tab.id) return;

      const previousTabId = activeTabIdRef.current;
      const isTabChanged = previousTabId !== null && previousTabId !== tab.id;

      // If switching tabs while inspector is running, stop it on old tab
      if (isTabChanged && isInspectingRef.current && previousTabId) {
        try {
          chrome.tabs.sendMessage(previousTabId, { type: MESSAGE_TYPES.INSPECTOR_STOP }).catch(() => {});
        } catch (e) {}
        setIsInspecting(false);
      }

      setActiveTabId(tab.id);
      setPageUrl(tab.url || '');

      let domain = '';
      if (tab.url) {
        try {
          const parsed = new URL(tab.url);
          domain = parsed.hostname;
        } catch (e) {
          domain = tab.url;
        }
      }
      setActiveDomain(domain);

      const isRestrictedUrl = tab.url && (
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:')
      );

      // Reset inspection data on tab switch
      if (isTabChanged) {
        setSelectedElement(null);
        setSelectorCandidates([]);
        setCollectionCandidates([]);
        setActiveCollectionSelector('');
        setFields([]);
        setPreviewData(null);
        setAnalysisData(null);
      }

      // Pre-warm content script in the focused tab
      if (!isRestrictedUrl && tab.id) {
        ensureContentScript(tab.id);
      }
    } catch (e) {
      console.warn('[DOM Scout] updateTabInfo error:', e);
    }
  }, [ensureContentScript]);

  // Tab activation, navigation, and window focus tracking
  useEffect(() => {
    updateTabInfo();

    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    const handleActivated = (activeInfo) => {
      if (activeInfo && activeInfo.tabId) {
        updateTabInfo(activeInfo.tabId);
      }
    };

    const handleUpdated = (tabId, changeInfo, tab) => {
      if (tabId === activeTabIdRef.current && (changeInfo.status === 'complete' || changeInfo.url)) {
        updateTabInfo(tab);
      }
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);

    let handleWindowFocus;
    if (chrome.windows && chrome.windows.onFocusChanged) {
      handleWindowFocus = (windowId) => {
        if (windowId !== chrome.windows.WINDOW_ID_NONE) {
          updateTabInfo();
        }
      };
      chrome.windows.onFocusChanged.addListener(handleWindowFocus);
    }

    const handleBeforeUnload = () => {
      const currentTab = activeTabIdRef.current;
      if (isInspectingRef.current && currentTab) {
        try {
          chrome.tabs.sendMessage(currentTab, { type: MESSAGE_TYPES.INSPECTOR_STOP }).catch(() => {});
        } catch (e) {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      if (handleWindowFocus && chrome.windows && chrome.windows.onFocusChanged) {
        chrome.windows.onFocusChanged.removeListener(handleWindowFocus);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateTabInfo]);

  // Listen for runtime messages from content script
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) return;

    const listener = (message) => {
      if (!message || !message.type) return;

      if (message.type === MESSAGE_TYPES.ELEMENT_SELECTED) {
        setIsInspecting(false);
        const { element, candidates } = message.payload || {};
        setSelectedElement(element);
        setSelectorCandidates(candidates || []);

        if (candidates && candidates.length > 0) {
          const best = candidates[0].selector;
          addRecentSelector(best, 'Selector').then(setRecentSelectors);
        }

        // Auto-query collection candidates from this selected element
        sendTabMessage({ type: MESSAGE_TYPES.DETECT_COLLECTION }).then((res) => {
          if (res && res.candidates && res.candidates.length > 0) {
            setCollectionCandidates(res.candidates);
            const bestCol = res.candidates[0].selector;
            setActiveCollectionSelector(bestCol);

            // Auto-detect fields for this collection
            sendTabMessage({ type: 'AUTO_DETECT_FIELDS', payload: { selector: bestCol } }).then((fRes) => {
              if (fRes && fRes.fields && fRes.fields.length > 0) {
                setFields(fRes.fields);
                // Trigger preview
                sendTabMessage({
                  type: MESSAGE_TYPES.EXTRACT_COLLECTION_PREVIEW,
                  payload: {
                    collectionSelector: bestCol,
                    fields: fRes.fields,
                    maxRows: settings.maxPreviewRows || 25
                  }
                }).then((pRes) => {
                  if (pRes && pRes.preview) setPreviewData(pRes.preview);
                });
              }
            });
          }
        });
      } else if (message.type === MESSAGE_TYPES.INSPECTOR_STOP) {
        setIsInspecting(false);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [sendTabMessage, settings.maxPreviewRows]);

  // Toggle Inspect Mode with error handling
  const handleToggleInspect = async () => {
    const nextState = !isInspecting;

    if (pageUrl && (pageUrl.startsWith('chrome://') || pageUrl.startsWith('chrome-extension://') || pageUrl.startsWith('about:'))) {
      showToast(t('errors.restrictedPage'));
      return;
    }

    const res = await sendTabMessage({
      type: nextState ? MESSAGE_TYPES.INSPECTOR_START : MESSAGE_TYPES.INSPECTOR_STOP,
      payload: { lang: effectiveLang }
    });

    if (res && res.success) {
      setIsInspecting(res.active !== undefined ? res.active : nextState);
    } else if (nextState) {
      setIsInspecting(false);
      showToast(t('errors.cannotInspect'));
    } else {
      setIsInspecting(false);
    }
  };

  // Highlight selector candidates
  const handleHighlightSelector = (selector, isXPath = false) => {
    if (!settings.autoHighlight) return;
    sendTabMessage({
      type: MESSAGE_TYPES.HIGHLIGHT_SELECTOR,
      payload: { selector, isXPath }
    });
  };

  const handleClearHighlight = () => {
    sendTabMessage({ type: MESSAGE_TYPES.CLEAR_HIGHLIGHT });
  };

  // Test selector live
  const handleTestSelector = (selector, isXPath, callback) => {
    sendTabMessage({
      type: MESSAGE_TYPES.TEST_SELECTOR,
      payload: { selector, isXPath }
    }).then((res) => {
      if (res && callback) callback(res);
    });
  };

  // Auto detect collection fields
  const handleAutoDetectFields = async () => {
    if (!activeCollectionSelector) return;
    const res = await sendTabMessage({
      type: 'AUTO_DETECT_FIELDS',
      payload: { selector: activeCollectionSelector }
    });

    if (res && res.fields && res.fields.length > 0) {
      setFields(res.fields);
      handleRefreshPreview(activeCollectionSelector, res.fields);
      showToast(t('toast.fieldsDetected'));
    }
  };

  // Refresh collection preview
  const handleRefreshPreview = async (sel = activeCollectionSelector, fList = fields) => {
    if (!sel) return;
    const res = await sendTabMessage({
      type: MESSAGE_TYPES.EXTRACT_COLLECTION_PREVIEW,
      payload: {
        collectionSelector: sel,
        fields: fList,
        maxRows: settings.maxPreviewRows || 25
      }
    });
    if (res && res.preview) {
      setPreviewData(res.preview);
    }
  };

  // Change active collection selector
  const handleSelectCollectionSelector = (sel) => {
    setActiveCollectionSelector(sel);
    addRecentSelector(sel, 'Collection').then(setRecentSelectors);
    handleRefreshPreview(sel, fields);
  };

  // Load page analysis when entering Analyze tab
  useEffect(() => {
    if (activeTab === 'analyze' && !analysisData) {
      sendTabMessage({ type: MESSAGE_TYPES.ANALYZE_PAGE }).then((res) => {
        if (res && res.analysis) {
          setAnalysisData(res.analysis);
        }
      });
    }
  }, [activeTab, analysisData, sendTabMessage]);

  // Save project handler
  const handleSaveProject = async (proj) => {
    await saveProject(activeDomain || 'custom', proj);
    showToast(t('toast.projectSaved'));
  };

  // Clear recents
  const handleClearRecent = async () => {
    await clearRecentSelectors();
    setRecentSelectors([]);
    showToast(t('toast.recentsCleared'));
  };

  const tabList = [
    { id: 'inspect', label: t('tabs.inspect') },
    { id: 'collection', label: t('tabs.collection') },
    { id: 'analyze', label: t('tabs.analyze') },
    { id: 'export', label: t('tabs.export') }
  ];

  return (
    <div className="ds-app">
      <Header
        domain={activeDomain}
        currentLang={effectiveLang}
        onSelectLang={handleSelectLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        t={t}
      />

      <Tabs
        tabs={tabList}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="ds-content">
        {activeTab === 'inspect' && (
          <InspectTab
            isInspecting={isInspecting}
            onToggleInspect={handleToggleInspect}
            selectedElement={selectedElement}
            selectorCandidates={selectorCandidates}
            onHighlightSelector={handleHighlightSelector}
            onClearHighlight={handleClearHighlight}
            onTestSelector={handleTestSelector}
            onCopyText={handleCopyText}
            t={t}
          />
        )}

        {activeTab === 'collection' && (
          <CollectionTab
            collectionCandidates={collectionCandidates}
            activeCollectionSelector={activeCollectionSelector}
            onSelectCollectionSelector={handleSelectCollectionSelector}
            fields={fields}
            onUpdateFields={(newFields) => {
              setFields(newFields);
              handleRefreshPreview(activeCollectionSelector, newFields);
            }}
            previewData={previewData}
            onRefreshPreview={() => handleRefreshPreview(activeCollectionSelector, fields)}
            onAutoDetectFields={handleAutoDetectFields}
            onNavigateToExport={() => setActiveTab('export')}
            onCopyText={handleCopyText}
            t={t}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeTab
            analysisData={analysisData}
            onRefreshAnalysis={() => {
              setAnalysisData(null);
              sendTabMessage({ type: MESSAGE_TYPES.ANALYZE_PAGE }).then((res) => {
                if (res && res.analysis) setAnalysisData(res.analysis);
              });
            }}
            onCopyText={handleCopyText}
            t={t}
          />
        )}

        {activeTab === 'export' && (
          <ExportTab
            domain={activeDomain}
            pageUrl={pageUrl}
            collectionSelector={activeCollectionSelector}
            fields={fields}
            recentSelectors={recentSelectors}
            onClearRecentSelectors={handleClearRecent}
            onSaveProject={handleSaveProject}
            onCopyText={handleCopyText}
            t={t}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        currentLang={languageSetting}
        onSelectLang={handleSelectLanguage}
        t={t}
      />

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
