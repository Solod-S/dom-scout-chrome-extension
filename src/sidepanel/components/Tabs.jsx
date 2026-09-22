import React from 'react';

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="ds-tabs-nav" aria-label="Tool tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`ds-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ds-tab-counter">{tab.count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
