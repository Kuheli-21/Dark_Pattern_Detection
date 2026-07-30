import React from 'react';
import { createRoot } from 'react-dom/client';
import { WarningOverlay } from './components/WarningOverlay';

console.log('🛡️ [Dark Pattern Content Script] Injected & Active');

let scanDebounceTimer = null;
const DEBOUNCE_DELAY_MS = 800;

// Set to keep track of elements that already have warning shadow roots attached
const injectedElementsMap = new WeakSet();

/**
 * Scrape DOM text nodes recursively excluding scripts, styles, and hidden nodes
 */
function extractPageTextSnippets() {
  const textSnippets = [];
  const textNodeMap = new Map(); // Map text string to element node

  const walker = document.createTreeWalker(
    document.body || document.documentElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node || !node.parentElement) return NodeFilter.FILTER_REJECT;

        const tag = node.parentElement.tagName.toUpperCase();
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'OPTION', 'STYLE'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip hidden nodes
        const style = window.getComputedStyle(node.parentElement);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return NodeFilter.FILTER_REJECT;
        }

        const trimmed = node.nodeValue.trim();
        if (trimmed.length < 5) return NodeFilter.FILTER_REJECT; // Skip trivial whitespace

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    const text = currentNode.nodeValue.trim();
    if (text) {
      textSnippets.push(text);
      if (!textNodeMap.has(text)) {
        textNodeMap.set(text, currentNode.parentElement);
      }
    }
  }

  return { textSnippets, textNodeMap };
}

/**
 * Trigger DOM scanning and dispatch snippets to service worker background script
 */
function runDOMScan() {
  const { textSnippets, textNodeMap } = extractPageTextSnippets();

  if (textSnippets.length === 0) return;

  const payload = {
    action: 'SCAN_TEXT',
    url: window.location.href,
    domain: window.location.hostname,
    textSnippets: textSnippets.slice(0, 150), // Send up to 150 candidate snippets per batch
  };

  try {
    chrome.runtime.sendMessage(payload, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('⚠️ Extension runtime message error:', chrome.runtime.lastError.message);
        return;
      }

      if (response && response.success && response.data && response.data.results) {
        handleScanResults(response.data.results, textNodeMap);
      }
    });
  } catch (err) {
    console.error('❌ Failed to relay message to background service worker:', err);
  }
}

/**
 * Handle scan classification results and mount Shadow DOM React Warning Overlay
 */
function handleScanResults(results, textNodeMap) {
  results.forEach((res) => {
    if (res.isDarkPattern) {
      const targetElement = textNodeMap.get(res.snippet);
      if (targetElement && !injectedElementsMap.has(targetElement)) {
        injectShadowWarningOverlay(targetElement, res.snippet, res.confidence, res.patternType);
        injectedElementsMap.add(targetElement);
      }
    }
  });
}

/**
 * Mounts <WarningOverlay /> inside an isolated Shadow Root next to the flagged DOM element
 */
function injectShadowWarningOverlay(parentElement, snippet, confidence, patternType) {
  try {
    const shadowHost = document.createElement('div');
    shadowHost.className = 'dark-pattern-shadow-host';
    shadowHost.style.display = 'block';
    shadowHost.style.clear = 'both';

    // Insert shadow host right after or inside the target parent element
    parentElement.parentNode.insertBefore(shadowHost, parentElement.nextSibling);

    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);

    const root = createRoot(mountPoint);
    root.render(
      <WarningOverlay
        snippet={snippet}
        confidence={confidence}
        patternType={patternType}
        onDismiss={() => {
          root.unmount();
          shadowHost.remove();
        }}
      />
    );
  } catch (err) {
    console.error('❌ Shadow DOM overlay mounting failed:', err);
  }
}

// Initial DOM scan execution when page finishes loading
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  runDOMScan();
} else {
  window.addEventListener('DOMContentLoaded', runDOMScan);
}

// MutationObserver with 800ms debounce for Single Page Applications (SPAs)
const observer = new MutationObserver(() => {
  if (scanDebounceTimer) clearTimeout(scanDebounceTimer);
  scanDebounceTimer = setTimeout(() => {
    runDOMScan();
  }, DEBOUNCE_DELAY_MS);
});

if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
