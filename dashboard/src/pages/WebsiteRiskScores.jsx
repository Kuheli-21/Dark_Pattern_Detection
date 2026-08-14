import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getWebsiteScores } from '../api/dashboard.api';
import { Award, Search, ShieldAlert, ChevronRight, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

export const WebsiteRiskScores = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const res = await getWebsiteScores();
        setItems(res.websites || []);
        setTotal(res.pagination?.total || 0);

      } catch (err) {
        console.error('Failed to fetch website scores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const filteredItems = items.filter((item) =>
    item.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskBadge = (score) => {
    if (score >= 80) return <span className="cyber-badge" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #f87171', color: '#fca5a5', boxShadow: '0 0 10px rgba(239,68,68,0.2)' }}>CRITICAL RISK</span>;
    if (score >= 65) return <span className="cyber-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #fb923c', color: '#fdba74' }}>HIGH RISK</span>;
    return <span className="cyber-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #34d399', color: '#a7f3d0' }}>MODERATE RISK</span>;
  };

  const getRiskGradientsAndGlow = (score) => {
    if (score >= 80) {
      return {
        gradient: 'linear-gradient(90deg, var(--accent-danger-start) 0%, var(--accent-danger-end) 100%)',
        rgb: '239, 68, 68',
        color: '#fca5a5'
      };
    }
    if (score >= 65) {
      return {
        gradient: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
        rgb: '245, 158, 11',
        color: '#fdba74'
      };
    }
    return {
      gradient: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
      rgb: '16, 185, 129',
      color: '#6ee7b7'
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Award size={28} color="#8b5cf6" />
          Domain Risk <span className="gradient-text">Leaderboard</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Aggregated deception vulnerability risk scores based on scan density and flagged patterns
        </p>
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter domains by name (e.g., temu, amazon)..."
            className="cyber-input"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {/* Grid Leaderboard Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Calculating domain vulnerability indices...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No website risk scores match your query.
          </div>
        ) : (
          filteredItems.map((site, index) => {
            const { gradient, rgb, color } = getRiskGradientsAndGlow(site.riskScore);
            const glowOpacity = (site.riskScore / 100) * 0.35;
            const glowSize = 10 + (site.riskScore / 100) * 20;
            const borderOpacity = 0.15 + (site.riskScore / 100) * 0.35;
            
            return (
              <motion.div
                key={site.domain}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card"
                style={{
                  border: `1px solid rgba(${rgb}, ${borderOpacity})`,
                  background: `linear-gradient(135deg, rgba(10, 17, 34, 0.92) 0%, rgba(${rgb}, 0.03) 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: `0 4px 30px 0 rgba(0, 0, 0, 0.45), 0 0 ${glowSize}px 0 rgba(${rgb}, ${glowOpacity})`,
                  transition: 'border-color 0.4s var(--ease-premium), background 0.4s var(--ease-premium), box-shadow 0.4s var(--ease-premium)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: 'rgba(124, 58, 237, 0.15)',
                          border: '1px solid rgba(217, 70, 239, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          boxShadow: '0 0 10px rgba(124,58,237,0.2)'
                        }}
                      >
                        #{index + 1}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{site.domain}</h3>
                    </div>
                    {getRiskBadge(site.riskScore)}
                  </div>

                  {/* Progress Bar Meter */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Vulnerability Index</span>
                      <span style={{ fontWeight: 800, color: color }}>{site.riskScore.toFixed(1)} / 100</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, site.riskScore)}%`,
                          height: '100%',
                          background: gradient,
                          borderRadius: '4px',
                          boxShadow: `0 0 10px rgba(${rgb}, 0.5)`,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Scans & Detections Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(7, 10, 19, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total Scans</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{site.totalScans}</div>
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(7, 10, 19, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Detections</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: color }}>{site.totalDetections}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/history?domain=${site.domain}`)}
                  className="cyber-button-outline"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  View Domain Detections <ChevronRight size={16} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
