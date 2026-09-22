import { highlighter } from './highlighter.js';
import { getElementDescriptor } from './element-info.js';
import { generateSelectorCandidates } from './selector-generator.js';
import { MESSAGE_TYPES } from '../shared/constants/messages.js';

function isContextValid() {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
}

function safeSendMessage(message) {
  if (!isContextValid()) return;
  try {
    chrome.runtime.sendMessage(message).catch(() => {});
  } catch (err) {
    // Suppress errors when context is invalidated
  }
}

class DOMScoutInspector {
  constructor() {
    this.isActive = false;
    this.selectedElement = null;

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Attach listeners with capture to precede page scripts
    window.addEventListener('mousemove', this.onPointerMove, { capture: true, passive: true });
    window.addEventListener('click', this.onClick, { capture: true, passive: false });
    window.addEventListener('keydown', this.onKeyDown, { capture: true });

    document.body.style.cursor = 'crosshair';
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    window.removeEventListener('mousemove', this.onPointerMove, { capture: true });
    window.removeEventListener('click', this.onClick, { capture: true });
    window.removeEventListener('keydown', this.onKeyDown, { capture: true });

    document.body.style.cursor = '';
    highlighter.clearHover();
  }

  onPointerMove(e) {
    if (!this.isActive) return;

    if (!isContextValid()) {
      this.stop();
      return;
    }

    // Retrieve element under cursor
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === document.body || el === document.documentElement) {
      highlighter.clearHover();
      return;
    }

    // Ignore overlay element itself
    if (el.id === 'dom-scout-inspector-overlay' || el.closest('#dom-scout-inspector-overlay')) {
      return;
    }

    highlighter.highlightHover(el);
  }

  onClick(e) {
    if (!this.isActive) return;

    if (!isContextValid()) {
      this.stop();
      return;
    }

    // Prevent page navigation, form submissions, and site handlers
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = e.target;
    if (!target || target === document.body || target === document.documentElement) {
      return;
    }

    this.stop();
    this.selectedElement = target;

    // Highlight the selected element
    highlighter.highlightSelected(target);

    // Build serialized descriptor & selector candidates
    const descriptor = getElementDescriptor(target);
    const candidates = generateSelectorCandidates(target);

    // Notify runtime / side panel safely
    safeSendMessage({
      type: MESSAGE_TYPES.ELEMENT_SELECTED,
      payload: {
        element: descriptor,
        candidates
      }
    });
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.stop();
      safeSendMessage({
        type: MESSAGE_TYPES.INSPECTOR_STOP
      });
    }
  }

  selectElement(el) {
    this.selectedElement = el;
    if (el) {
      highlighter.highlightSelected(el);
    } else {
      highlighter.clearSelected();
    }
  }

  getSelectedElement() {
    return this.selectedElement;
  }
}

export const inspector = new DOMScoutInspector();
