import { MESSAGE_TYPES } from '../shared/constants/messages.js';
import { inspector } from './inspector.js';
import { highlighter } from './highlighter.js';
import { testCSSSelector, testXPath, generateSelectorCandidates } from './selector-generator.js';
import { detectCollectionCandidates, autoDetectFields } from './collection-detector.js';
import { extractCollectionPreview } from './extraction.js';
import { analyzePage } from './page-analyzer.js';

// Clean up any previously injected instance in this tab
if (window.__DOM_SCOUT_CLEANUP__) {
  try {
    window.__DOM_SCOUT_CLEANUP__();
  } catch (e) {}
}

window.__DOM_SCOUT_CLEANUP__ = () => {
  highlighter.destroy();
  inspector.stop();
};

console.log('[DOM Scout] Content Script initialized');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    return false;
  }
  if (!message || !message.type) return false;

  switch (message.type) {
    case 'SET_LANGUAGE':
      if (message.payload && message.payload.lang) {
        highlighter.setLanguage(message.payload.lang);
      }
      sendResponse({ success: true });
      return true;

    case MESSAGE_TYPES.PING:
      if (message.payload && message.payload.lang) {
        highlighter.setLanguage(message.payload.lang);
      }
      sendResponse({
        success: true,
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname
      });
      return true;

    case MESSAGE_TYPES.INSPECTOR_START:
      if (message.payload && message.payload.lang) {
        highlighter.setLanguage(message.payload.lang);
      }
      inspector.start();
      sendResponse({ success: true, active: true });
      return true;

    case MESSAGE_TYPES.INSPECTOR_STOP:
      inspector.stop();
      sendResponse({ success: true, active: false });
      return true;

    case MESSAGE_TYPES.HIGHLIGHT_SELECTOR:
      if (message.payload && message.payload.selector) {
        const sel = message.payload.selector;
        const isXp = message.payload.isXPath || sel.startsWith('//');
        const test = isXp ? testXPath(sel) : testCSSSelector(sel);
        if (test.valid && test.elements.length > 0) {
          highlighter.highlightMatches(test.elements);
        }
      }
      sendResponse({ success: true });
      return true;

    case MESSAGE_TYPES.CLEAR_HIGHLIGHT:
      highlighter.clearMatches();
      sendResponse({ success: true });
      return true;

    case MESSAGE_TYPES.TEST_SELECTOR: {
      const sel = message.payload ? message.payload.selector : '';
      const isXp = message.payload ? message.payload.isXPath : false;
      const test = isXp ? testXPath(sel) : testCSSSelector(sel);
      if (test.valid && test.elements.length > 0) {
        highlighter.highlightMatches(test.elements);
      } else {
        highlighter.clearMatches();
      }
      sendResponse(test);
      return true;
    }

    case MESSAGE_TYPES.DETECT_COLLECTION: {
      const selected = inspector.getSelectedElement();
      if (selected) {
        const candidates = detectCollectionCandidates(selected);
        sendResponse({ success: true, candidates });
      } else {
        sendResponse({ success: false, error: 'No element selected' });
      }
      return true;
    }

    case MESSAGE_TYPES.EXTRACT_COLLECTION_PREVIEW: {
      const { collectionSelector, fields, maxRows } = message.payload || {};
      if (!collectionSelector) {
        sendResponse({ success: false, error: 'Missing collection selector' });
        return true;
      }
      const preview = extractCollectionPreview(collectionSelector, fields || [], maxRows || 25);
      sendResponse({ success: true, preview });
      return true;
    }

    case MESSAGE_TYPES.ANALYZE_PAGE: {
      const analysis = analyzePage();
      sendResponse({ success: true, analysis });
      return true;
    }

    case 'AUTO_DETECT_FIELDS': {
      const sel = message.payload ? message.payload.selector : '';
      const fields = autoDetectFields(sel);
      sendResponse({ success: true, fields });
      return true;
    }

    default:
      return false;
  }
});
