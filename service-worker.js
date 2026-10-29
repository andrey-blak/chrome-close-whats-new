
const isWhatsNew = (url) => {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "chrome:" &&
      parsed.hostname === "whats-new";
  } catch {
    return false;
  }
};

function closeTabIfNeeded(tabId, url) {
  if (tabId != null && isWhatsNew(url)) {
    chrome.tabs.remove(tabId, () => {
      // Consume any error if the tab was already closed.
      void chrome.runtime.lastError;
    });
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  closeTabIfNeeded(tab.id, tab.pendingUrl || tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  closeTabIfNeeded(
    tabId,
    changeInfo.url || tab.pendingUrl || tab.url
  );
});

function scanExistingTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      closeTabIfNeeded(tab.id, tab.pendingUrl || tab.url);
    }
  });
}

chrome.runtime.onStartup.addListener(scanExistingTabs);
chrome.runtime.onInstalled.addListener(scanExistingTabs);
