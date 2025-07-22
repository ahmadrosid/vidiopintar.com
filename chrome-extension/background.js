// Background script for YouTube to VidioPintar redirector

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(tab.url);
    if (videoId) {
      // Redirect to vidiopintar.com with the video ID
      const newUrl = `https://vidiopintar.com/watch?v=${videoId}`;
      chrome.tabs.update(tab.id, { url: newUrl });
    }
  }
});

function extractVideoId(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
}

// Listen for tab updates to enable/disable extension
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('youtube.com')) {
      // Enable extension on YouTube pages
      chrome.action.enable(tabId);
      
      if (tab.url.includes('youtube.com/watch')) {
        // Show active badge on watch pages
        chrome.action.setBadgeText({
          text: '▶',
          tabId: tabId
        });
        chrome.action.setBadgeBackgroundColor({
          color: '#ff6b35',
          tabId: tabId
        });
      } else {
        // Clear badge on other YouTube pages
        chrome.action.setBadgeText({
          text: '',
          tabId: tabId
        });
      }
    } else {
      // Disable extension on non-YouTube pages
      chrome.action.disable(tabId);
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});