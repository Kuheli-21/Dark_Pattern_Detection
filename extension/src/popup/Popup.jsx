import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle2, ExternalLink, RefreshCw, AlertTriangle, Eye } from 'lucide-react';

const getCategoryForSnippet = (snippet) => {
  const lower = snippet?.toLowerCase() || '';
  if (lower.includes('risk') || lower.includes('no thanks') || lower.includes('prefer')) {
    return { name: 'Confirmshaming', color: '#fda4af' };
  }
  if (lower.includes('warranty') || lower.includes('basket') || lower.includes('add')) {
    return { name: 'Sneak into Basket', color: '#fdba74' };
  }
  if (lower.includes('left') || lower.includes('stock') || lower.includes('hurry')) {
    return { name: 'Fake Scarcity', color: '#fcd34d' };
  }
  if (lower.includes('bill') || lower.includes('recur') || lower.includes('subscribe') || lower.includes('try free')) {
    return { name: 'Subscription Trap', color: '#86efac' };
  }
  if (lower.includes('fee') || lower.includes('charge') || lower.includes('processing')) {
    return { name: 'Hidden Costs', color: '#67e8f9' };
  }
  if (lower.includes('close') || lower.includes('switch') || lower.includes('bait')) {
    return { name: 'Bait and Switch', color: '#93c5fd' };
  }
  if (lower.includes('other people') || lower.includes('shoppers') || lower.includes('social proof') || lower.includes('looking at')) {
    return { name: 'Fake Social Proof', color: '#c084fc' };
  }
  if (lower.includes('popup') || lower.includes('nag')) {
    return { name: 'Nagging', color: '#f472b6' };
  }
  if (lower.includes('preselected') || lower.includes('default') || lower.includes('pre-ticked')) {
    return { name: 'Preselection', color: '#fb7185' };
  }
  return { name: 'Forced Action', color: '#fb923c' };
};

export default function Popup() {
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored scan results and scanner configuration
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['activeScan', 'scannerEnabled'], (result) => {
        if (result.activeScan) {
          setScanData(result.activeScan);
        }
        if (result.scannerEnabled !== undefined) {
          setScannerEnabled(result.scannerEnabled);
        }
        setLoading(false);
      });
    } else {
      // Mock data when viewing standalone popup in dev mode
      setScanData({
        domain: 'booking.com',
        url: 'https://booking.com/hotel/us/grand-resort.html',
        flaggedCount: 3,
        websiteRiskScore: 86.5,
        results: [
          { snippet: '14 other people are looking at this hotel right now.', isDarkPattern: true, confidence: 0.94 },
          { snippet: 'Only 1 room left on our site!', isDarkPattern: true, confidence: 0.98 },
          { snippet: 'Special price expires in 04:32', isDarkPattern: true, confidence: 0.91 },
        ],
      });
      setLoading(false);
    }
  }, []);

  const handleToggleScanner = (checked) => {
    setScannerEnabled(checked);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ scannerEnabled: checked });
      // Clear badge immediately when disabling
      if (!checked && chrome.action) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.action.setBadgeText({ text: '', tabId: tabs[0].id });
          }
        });
      }
    }
  };

  const handleRescan = () => {
    setLoading(true);
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'TRIGGER_DOM_SCAN' }, () => {
            setTimeout(() => {
              chrome.storage.local.get(['activeScan'], (res) => {
                if (res.activeScan) setScanData(res.activeScan);
                setLoading(false);
              });
            }, 600);
          });
        }
      });
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'http://localhost:5173' });
    } else {
      window.open('http://localhost:5173', '_blank');
    }
  };

  const flaggedItems = scanData?.results?.filter((r) => r.isDarkPattern) || [];
  const riskScore = scanData?.websiteRiskScore || 0;
  const isHighRisk = riskScore >= 70;
  const riskColor = isHighRisk ? '#ef4444' : '#10b981';
  const riskGlow = isHighRisk ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)';

  return (
    <div className="popup-container" style={{ background: 'linear-gradient(180deg, #070a13 0%, #0a0e1a 100%)' }}>
      {/* Header */}
      <div className="popup-header" style={{ borderBottom: '1px solid rgba(217, 70, 239, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-gradient-start, #7c3aed) 0%, var(--accent-gradient-end, #22d3ee) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(217, 70, 239, 0.4)',
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
              DARK PATTERN <span className="gradient-text">DETECTOR</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.05em' }}>
              MV3 DOM SHADOW SENTINEL
            </div>
          </div>
        </div>

        {/* Global Scanner Toggle */}
        <label className="switch" title="Toggle active page scanner">
          <input
            type="checkbox"
            checked={scannerEnabled}
            onChange={(e) => handleToggleScanner(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* Main Body */}
      <div className="popup-content">
        {/* Domain Risk Meter Card */}
        <div 
          className="popup-card" 
          style={{ 
            background: 'rgba(10, 17, 34, 0.8)',
            border: `1px solid ${riskColor}40`,
            boxShadow: `0 4px 15px rgba(0, 0, 0, 0.35), 0 0 10px ${riskGlow}`,
            padding: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>CURRENT TARGET DOMAIN</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                {scanData?.domain || 'Scanning active tab...'}
              </div>
            </div>
            <div
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: isHighRisk ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: isHighRisk ? '#fca5a5' : '#a7f3d0',
                border: `1px solid ${riskColor}60`,
              }}
            >
              {isHighRisk ? 'HIGH RISK' : 'LOW RISK'}
            </div>
          </div>

          {/* Risk Score Progress Gauge */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              <span style={{ color: '#cbd5e1' }}>Website Risk Score</span>
              <span style={{ fontWeight: 800, color: isHighRisk ? '#fda4af' : '#6ee7b7' }}>
                {riskScore.toFixed(1)} / 100
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, riskScore)}%`,
                  height: '100%',
                  background: isHighRisk
                    ? 'linear-gradient(90deg, var(--accent-danger-start, #ef4444), var(--accent-danger-end, #f43f5e))'
                    : 'linear-gradient(90deg, #10b981, #06b6d4)',
                  boxShadow: `0 0 8px ${riskColor}`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Flagged Snippets Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={15} color={flaggedItems.length > 0 ? '#f87171' : '#10b981'} />
              Flagged Deceptions ({flaggedItems.length})
            </span>

            <button
              onClick={handleRescan}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-cyan, #06b6d4)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              <RefreshCw size={12} className={loading ? 'pulse-glow' : ''} />
              Re-scan
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingRight: '4px'
            }}
          >
            {flaggedItems.length > 0 ? (
              flaggedItems.map((item, idx) => {
                const cat = getCategoryForSnippet(item.snippet);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.6rem 0.8rem',
                      background: `${cat.color}10`,
                      border: `1px solid ${cat.color}35`,
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      boxShadow: `inset 0 0 6px ${cat.color}05`
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem', lineHeight: 1.35 }}>
                      "{item.snippet}"
                    </div>
                    <div style={{ color: cat.color, fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Pattern: {cat.name}</span>
                      <span>{Math.round((item.confidence || 0.95) * 100)}% Match</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '10px',
                  color: '#a7f3d0',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={24} color="#10b981" />
                <span>No deceptive dark patterns flagged on this page.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <button
          onClick={openDashboard}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, var(--accent-gradient-start, #7c3aed) 0%, var(--accent-gradient-end, #22d3ee) 100%)',
            backgroundSize: '200% auto',
            animation: 'gradient-shift 6s linear infinite',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(217, 70, 239, 0.35)',
            marginTop: '0.75rem',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          Open Security Dashboard <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );
}
