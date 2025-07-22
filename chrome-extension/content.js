// Content script for YouTube pages

// Add a button to redirect to VidioPintar
function addRedirectButton() {
  // Check if button already exists
  if (document.getElementById('videopintar-redirect-btn')) {
    return;
  }

  // Find the video actions area
  const actionsContainer = document.querySelector('#actions-inner') || 
                          document.querySelector('#top-level-buttons-computed') ||
                          document.querySelector('.ytd-video-primary-info-renderer');

  if (actionsContainer) {
    // Create redirect button
    const redirectBtn = document.createElement('button');
    redirectBtn.id = 'videopintar-redirect-btn';
    redirectBtn.innerHTML = 'Watch on vidiopintar.com';
    redirectBtn.style.cssText = `
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      margin: 8px;
      font-weight: 500;
      border-bottom-color: oklab(0.141 0.00136333 -0.00481054 / 0.35);
      border-top-color: oklab(0.141 0.00136333 -0.00481054 / 0.35);
      border-left-color: oklab(0.141 0.00136333 -0.00481054 / 0.35);
      border-right-color: oklab(0.141 0.00136333 -0.00481054 / 0.35);
      border: 1px;
      background-image: linear-gradient(oklab(0.210296 0.00161923 -0.00565296 / 0.85) 0%, rgb(24, 24, 27) 100%)
    `;

    redirectBtn.addEventListener('click', () => {
      const videoId = extractVideoIdFromUrl(window.location.href);
      if (videoId) {
        window.location.href = `https://vidiopintar.com/watch?v=${videoId}`;
      }
    });

    // Insert the button
    actionsContainer.appendChild(redirectBtn);
  }
}

function extractVideoIdFromUrl(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
}

// Wait for page to load and add button
setTimeout(addRedirectButton, 2000);

// Also add button when navigating within YouTube (SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('/watch')) {
      setTimeout(addRedirectButton, 2000);
    }
  }
}).observe(document, { subtree: true, childList: true });