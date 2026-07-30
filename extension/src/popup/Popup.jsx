import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle2, ExternalLink, RefreshCw, AlertTriangle, Eye } from 'lucide-react';

export default function Popup() {
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored scan results for current tab
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['activeScan'], (result) => {
        if (result.activeScan) {
          setScanData(result.activeScan);
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

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
              DARK PATTERN <span style={{ color: '#8b5cf6' }}>DETECTOR</span>
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
            onChange={(e) => setScannerEnabled(e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* Main Body */}
      <div className="popup-content">
        {/* Domain Risk Meter Card */}
        <div className="popup-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', uppercase: true }}>CURRENT TARGET DOMAIN</div>
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
                background: isHighRisk ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isHighRisk ? '#fda4af' : '#6ee7b7',
                border: `1px solid ${isHighRisk ? '#f43f5e' : '#10b981'}`,
              }}
            >
              {isHighRisk ? 'HIGH RISK' : 'LOW RISK'}
            </div>
          </div>

          {/* Risk Score Progress Gauge */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
              <span style={{ color: '#cbd5e1' }}>Website Risk Score</span>
              <span style={{ fontWeight: 800, color: isHighRisk ? '#f43f5e' : '#10b981' }}>
                {riskScore.toFixed(1)} / 100
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, riskScore)}%`,
                  height: '100%',
                  background: isHighRisk
                    ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                    : 'linear-gradient(90deg, #10b981, #059669)',
                  boxShadow: `0 0 8px ${isHighRisk ? '#f43f5e' : '#10b981'}`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Flagged Snippets Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={15} color={flaggedItems.length > 0 ? '#f43f5e' : '#10b981'} />
              Flagged Deceptions ({flaggedItems.length})
            </span>

            <button
              onClick={handleRescan}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b5cf6',
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
            }}
          >
            {flaggedItems.length > 0 ? (
              flaggedItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>
                    "{item.snippet}"
                  </div>
                  <div style={{ color: '#fda4af', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pattern: dark-pattern</span>
                    <span>{Math.round((item.confidence || 0.95) * 100)}% Match</span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  color: '#6ee7b7',
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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
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
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
          }}
        >
          Open Security Dashboard <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );
}
