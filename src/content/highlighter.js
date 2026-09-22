/**
 * DOM Scout Highlighter
 * Non-intrusive overlay rendering using Shadow DOM and pointer-events: none
 */

import { t, resolveLanguage } from '../shared/i18n/index.js';

class DOMScoutHighlighter {
  constructor() {
    this.container = null;
    this.shadowRoot = null;
    this.hoverBox = null;
    this.hoverTooltip = null;
    this.selectedBox = null;
    this.selectedBadge = null;
    this.multiBoxes = [];
    this.currentHoverElement = null;
    this.currentSelectedElement = null;
    this.rafId = null;
    this.currentLang = resolveLanguage('system');

    this.onScrollOrResize = this.onScrollOrResize.bind(this);
  }

  setLanguage(lang) {
    this.currentLang = resolveLanguage(lang);
    this.updateBadgeText();
  }

  updateBadgeText() {
    if (this.selectedBadge) {
      this.selectedBadge.textContent = `✓ ${t('inspect.selectedBadge', {}, this.currentLang)}`;
    }
  }

  ensureContainer() {
    if (this.container && this.container.isConnected) return;

    this.container = document.createElement('div');
    this.container.id = 'dom-scout-inspector-overlay';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
      overflow: hidden;
      margin: 0;
      padding: 0;
    `;

    this.shadowRoot = this.container.attachShadow({ mode: 'open' });
    
    // Inject overlay styles inside Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      .highlight-box {
        position: fixed;
        pointer-events: none;
        box-sizing: border-box;
        transition: all 0.05s ease-out;
      }

      /* Выбираемый элемент (Hover) — ярко-небесный пунктир с подсветкой и свечением */
      .hover-box {
        background-color: rgba(14, 165, 233, 0.14);
        border: 2px dashed #0284C7;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.75), 0 0 10px rgba(14, 165, 233, 0.35);
        border-radius: 3px;
        z-index: 2147483645;
      }

      /* Выбранный элемент (Selected) — уверенный фирменный индиго с двойным кольцом */
      .selected-box {
        background-color: rgba(79, 70, 229, 0.09);
        border: 2.5px solid #4F46E5;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.35), inset 0 0 0 1px rgba(99, 102, 241, 0.2);
        border-radius: 2px;
        z-index: 2147483646;
      }

      /* Маркеры по углам выбранного элемента */
      .corner-handle {
        position: absolute;
        width: 7px;
        height: 7px;
        background-color: #FFFFFF;
        border: 1.5px solid #4F46E5;
        border-radius: 1.5px;
        box-sizing: border-box;
        pointer-events: none;
      }
      .corner-tl { top: -4px; left: -4px; }
      .corner-tr { top: -4px; right: -4px; }
      .corner-bl { bottom: -4px; left: -4px; }
      .corner-br { bottom: -4px; right: -4px; }

      /* Закрепленный бейдж выбранного элемента */
      .selected-badge {
        position: absolute;
        top: -22px;
        right: -2px;
        background: #4F46E5;
        color: #FFFFFF;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.02em;
        padding: 2px 7px;
        border-radius: 3px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        pointer-events: none;
        user-select: none;
      }

      /* Совпадения селектора (Matches) — зеленый пунктир */
      .match-box {
        background-color: rgba(16, 185, 129, 0.12);
        border: 1.5px dashed #10B981;
        border-radius: 2px;
        z-index: 2147483644;
      }

      /* Тултип выбираемого элемента */
      .tooltip {
        position: fixed;
        pointer-events: none;
        background-color: #0F172A;
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #F8FAFC;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        line-height: 1.3;
        padding: 4px 8px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        white-space: nowrap;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .tooltip-aim {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #38BDF8;
        box-shadow: 0 0 6px #38BDF8;
      }
      .tooltip-tag {
        color: #38BDF8;
        font-weight: 600;
      }
      .tooltip-dim {
        color: #94A3B8;
        font-size: 10px;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Create hover box
    this.hoverBox = document.createElement('div');
    this.hoverBox.className = 'highlight-box hover-box';
    this.hoverBox.style.display = 'none';

    // Create hover tooltip
    this.hoverTooltip = document.createElement('div');
    this.hoverTooltip.className = 'tooltip';
    this.hoverTooltip.style.display = 'none';

    // Create selected box with corner handles and badge
    this.selectedBox = document.createElement('div');
    this.selectedBox.className = 'highlight-box selected-box';
    this.selectedBox.style.display = 'none';

    ['tl', 'tr', 'bl', 'br'].forEach((corner) => {
      const handle = document.createElement('div');
      handle.className = `corner-handle corner-${corner}`;
      this.selectedBox.appendChild(handle);
    });

    this.selectedBadge = document.createElement('div');
    this.selectedBadge.className = 'selected-badge';
    this.selectedBadge.textContent = `✓ ${t('inspect.selectedBadge', {}, this.currentLang)}`;
    this.selectedBox.appendChild(this.selectedBadge);

    this.shadowRoot.appendChild(this.hoverBox);
    this.shadowRoot.appendChild(this.selectedBox);
    this.shadowRoot.appendChild(this.hoverTooltip);

    document.documentElement.appendChild(this.container);

    window.addEventListener('scroll', this.onScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', this.onScrollOrResize, { passive: true });
  }

  onScrollOrResize() {
    if (typeof chrome !== 'undefined' && !chrome.runtime?.id) {
      this.destroy();
      return;
    }
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.updatePositions();
        this.rafId = null;
      });
    }
  }

  updatePositions() {
    if (this.currentHoverElement && this.currentHoverElement.isConnected) {
      this.highlightHover(this.currentHoverElement);
    } else {
      this.clearHover();
    }

    if (this.currentSelectedElement && this.currentSelectedElement.isConnected) {
      this.highlightSelected(this.currentSelectedElement);
    } else if (this.currentSelectedElement && !this.currentSelectedElement.isConnected) {
      this.clearSelected();
    }
  }

  highlightHover(element) {
    if (!element || !element.getBoundingClientRect) return;
    this.ensureContainer();
    this.currentHoverElement = element;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    this.hoverBox.style.display = 'block';
    this.hoverBox.style.top = `${rect.top}px`;
    this.hoverBox.style.left = `${rect.left}px`;
    this.hoverBox.style.width = `${rect.width}px`;
    this.hoverBox.style.height = `${rect.height}px`;

    // Tooltip formatting: tag.class  W × H
    const tag = element.tagName.toLowerCase();
    const className = element.className && typeof element.className === 'string'
      ? '.' + element.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    this.hoverTooltip.innerHTML = `
      <span class="tooltip-aim"></span>
      <span class="tooltip-tag">${tag}${className}</span>
      <span class="tooltip-dim">${width} × ${height}</span>
    `;
    this.hoverTooltip.style.display = 'flex';

    // Position tooltip: prefer top-left, or bottom if top out of viewport
    let tooltipTop = rect.top - 28;
    if (tooltipTop < 4) {
      tooltipTop = rect.bottom + 6;
    }
    let tooltipLeft = Math.max(4, rect.left);
    this.hoverTooltip.style.top = `${tooltipTop}px`;
    this.hoverTooltip.style.left = `${tooltipLeft}px`;
  }

  clearHover() {
    this.currentHoverElement = null;
    if (this.hoverBox) this.hoverBox.style.display = 'none';
    if (this.hoverTooltip) this.hoverTooltip.style.display = 'none';
  }

  highlightSelected(element) {
    if (!element || !element.getBoundingClientRect) return;
    this.ensureContainer();
    this.currentSelectedElement = element;

    const rect = element.getBoundingClientRect();
    this.selectedBox.style.display = 'block';
    this.selectedBox.style.top = `${rect.top}px`;
    this.selectedBox.style.left = `${rect.left}px`;
    this.selectedBox.style.width = `${rect.width}px`;
    this.selectedBox.style.height = `${rect.height}px`;

    // Position badge: if close to top edge of viewport, place inside
    if (this.selectedBadge) {
      this.selectedBadge.textContent = `✓ ${t('inspect.selectedBadge', {}, this.currentLang)}`;
      if (rect.top < 24) {
        this.selectedBadge.style.top = '3px';
        this.selectedBadge.style.right = '3px';
      } else {
        this.selectedBadge.style.top = '-22px';
        this.selectedBadge.style.right = '-2px';
      }
    }
  }

  clearSelected() {
    this.currentSelectedElement = null;
    if (this.selectedBox) this.selectedBox.style.display = 'none';
  }

  highlightMatches(elements) {
    this.ensureContainer();
    this.clearMatches();

    if (!elements || elements.length === 0) return;

    elements.slice(0, 100).forEach((el) => {
      if (!el || !el.getBoundingClientRect) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const box = document.createElement('div');
      box.className = 'highlight-box match-box';
      box.style.top = `${rect.top}px`;
      box.style.left = `${rect.left}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;

      this.shadowRoot.appendChild(box);
      this.multiBoxes.push(box);
    });
  }

  clearMatches() {
    this.multiBoxes.forEach((box) => box.remove());
    this.multiBoxes = [];
  }

  destroy() {
    this.clearHover();
    this.clearSelected();
    this.clearMatches();

    window.removeEventListener('scroll', this.onScrollOrResize, { capture: true });
    window.removeEventListener('resize', this.onScrollOrResize);

    if (this.container && this.container.isConnected) {
      this.container.remove();
    }
    this.container = null;
    this.shadowRoot = null;
  }
}

export const highlighter = new DOMScoutHighlighter();
