/**
 * DOM Scout Background Service Worker (Manifest V3)
 */

// Enable side panel opening on extension icon click
function setupSidePanelBehavior() {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.warn('[DOM Scout] setPanelBehavior error:', err));
  }
}

setupSidePanelBehavior();

// Inject content script into all existing HTTP/HTTPS tabs on extension install/update
async function injectIntoExistingTabs() {
  if (!chrome.scripting || !chrome.tabs) return;
  try {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (
        tab.id &&
        tab.url &&
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('chrome-extension://') &&
        !tab.url.startsWith('edge://') &&
        !tab.url.startsWith('about:')
      ) {
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            files: ['content/content.js']
          })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[DOM Scout] Existing tabs injection error:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  setupSidePanelBehavior();
  injectIntoExistingTabs();
  console.log('[DOM Scout] Extension installed & scripts initialized');
});

// Handle keyboard command if defined
chrome.commands.onCommand.addListener(async (command) => {
  if (command === '_execute_action') {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel
        .open({ windowId: tab.windowId })
        .catch((err) => console.warn('[DOM Scout] sidePanel.open error:', err));
    }
  }
});
