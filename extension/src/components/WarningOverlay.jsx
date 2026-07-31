import React, { useState } from 'react';

/**
 * Isolated Warning Overlay Component mounted inside Shadow DOM
 * 
 * TODO: Transition from binary output string ("dark-pattern") to dynamic multi-class 
 * tags (e.g. "fake-urgency", "forced-continuity", "misdirection", "hidden-costs")
 */
export const WarningOverlay = ({ snippet, confidence = 0.95, patternType = 'dark-pattern', onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const confidencePct = Math.round(confidence * 100);

  const isHighConfidence = confidence >= 0.85;
  const rgb = isHighConfidence ? '239, 68, 68' : '245, 158, 11';
  const glowOpacity = confidence * 0.45;
  const glowSize = 8 + confidence * 16;
  const borderOpacity = 0.25 + confidence * 0.45;
  const titleColor = isHighConfidence ? '#f87171' : '#fb923c';

  const colors = {
    border: `rgba(${rgb}, ${borderOpacity})`,
    glow: `0 4px 30px rgba(0, 0, 0, 0.55), 0 0 ${glowSize}px rgba(${rgb}, ${glowOpacity})`,
    badgeBg: `rgba(${rgb}, 0.15)`,
    badgeText: isHighConfidence ? '#fca5a5' : '#fdba74',
    badgeBorder: `rgba(${rgb}, 0.35)`,
    titleColor,
    emoji: isHighConfidence ? '🚨' : '⚠️'
  };

  // Explicit inline styles to ensure 100% isolation from target page stylesheet
  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginTop: '6px',
    marginBottom: '6px',
    padding: '10px 14px',
    background: 'rgba(10, 17, 34, 0.96)',
    backdropFilter: 'blur(12px)',
    border: colors.border,
    borderRadius: '10px',
    boxShadow: colors.glow,
    color: '#ffffff',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    maxWidth: '100%',
    zIndex: 999999,
    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
  };

  const badgeStyle = {
    background: colors.badgeBg,
    color: colors.badgeText,
    border: colors.badgeBorder,
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#cbd5e1',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.4s var(--ease-premium)',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <span style={{ fontSize: '16px' }}>{colors.emoji}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontWeight: 700, color: colors.titleColor }}>DARK PATTERN DETECTED</span>
            <span style={badgeStyle}>{patternType}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>({confidencePct}% Confidence)</span>
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '12px' }}>
            Deceptive manipulation snippet: <span style={{ fontStyle: 'italic', color: '#f8fafc' }}>"{snippet}"</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          style={buttonStyle}
          onClick={() => {
            setDismissed(true);
            if (onDismiss) onDismiss();
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
