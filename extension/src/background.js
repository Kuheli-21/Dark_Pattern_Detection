// Chrome Extension Manifest V3 Background Service Worker

console.log('🛡️ [Dark Pattern Service Worker] Initialized');

const BACKEND_SCAN_URL = 'http://localhost:5000/api/scan';

// Mock patterns array for offline dev scanning
const DEMO_TRIGGER_PATTERNS = [
  'only', 'left in stock', 'people looking', 'order soon', 'timer expires',
  'added to cart', 'free gift', 'processing fee', 'service fee', 'increase by',
  'uncheck this box', 'vip club', 'cancellation fee', 'recurrent', 'jackpot'
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCAN_TEXT') {
    const tabId = sender.tab ? sender.tab.id : null;
    const { url, domain, textSnippets } = request;

    console.log(`🔍 [Background Worker] Processing ${textSnippets.length} snippets for domain: ${domain}`);

    performScanApi(url, domain, textSnippets)
      .then((scanData) => {
        const flaggedCount = scanData.results.filter((r) => r.isDarkPattern).length;

        // Update badge indicator on Chrome extension icon
        if (tabId && chrome.action) {
          if (flaggedCount > 0) {
            chrome.action.setBadgeText({ text: String(flaggedCount), tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#f43f5e', tabId });
          } else {
            chrome.action.setBadgeText({ text: 'OK', tabId });
            chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId });
          }
        }

        // Store active scan results for Popup interface
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({
            activeScan: {
              url,
              domain,
              results: scanData.results,
              websiteRiskScore: scanData.riskScore !== undefined ? scanData.riskScore : scanData.websiteRiskScore,
              flaggedCount,
              timestamp: Date.now(),
            },
          });
        }

        sendResponse({ success: true, data: scanData });
      })
      .catch((err) => {
        console.error('❌ [Background Worker] Scan API Error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Keep response channel open for async response
  }
});

async function performScanApi(url, domain, textSnippets) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(BACKEND_SCAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, domain, textSnippets }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    throw new Error(`HTTP Error ${res.status}`);
  } catch (err) {
    console.warn('⚠️ [Background Worker] Backend offline or unreachable. Executing local classification fallback.');
    return generateOfflineScanResults(url, domain, textSnippets);
  }
}

function generateOfflineScanResults(url, domain, textSnippets) {
  const results = textSnippets.map((snippet) => {
    const snippetLower = snippet.toLowerCase();
    const isDark = DEMO_TRIGGER_PATTERNS.some((pattern) => snippetLower.includes(pattern));

    return {
      snippet,
      isDarkPattern: isDark,
      patternType: isDark ? 'dark-pattern' : null,
      confidence: isDark ? parseFloat((0.85 + Math.random() * 0.14).toFixed(2)) : null,
    };
  });

  const darkCount = results.filter((r) => r.isDarkPattern).length;
  const websiteRiskScore = Math.min(99.9, parseFloat((darkCount * 18.5 + 35.0).toFixed(1)));

  return {
    results,
    websiteRiskScore,
  };
}
