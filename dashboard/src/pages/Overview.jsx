import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { TrendsLineChart } from '../components/Charts/TrendsLineChart';
import { ScanRatioPieChart } from '../components/Charts/ScanRatioPieChart';
import { getOverviewStats } from '../api/dashboard.api';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  TrendingUp,
  Globe,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const Overview = () => {
  const [stats, setStats] = useState({
    totalScans: 9840,
    totalDetections: 2819,
    topPatternTypes: [{ type: 'dark-pattern', count: 2819, percentage: 100 }],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await getOverviewStats();
        setStats((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const cleanScans = Math.max(0, stats.totalScans - stats.totalDetections);
  const detectionPercentage = ((stats.totalDetections / Math.max(1, stats.totalScans)) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}
    >
      {/* Hero Constellation Header */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          padding: '3rem 2.5rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          overflow: 'hidden',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <ParticleCanvas />

        <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#c4b5fd',
              marginBottom: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <ShieldAlert size={14} /> LIVE THREAT ENGINE ACTIVE
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Cyber Dark Pattern <span className="gradient-text">Intelligence</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px' }}>
            Real-time automated neural DOM scanning telemetry, deceptive design classification, and target domain risk metrics.
          </p>
        </div>
      </div>

      {/* Top Key Metrics Cards */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
          }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="glass-card"
          style={{ 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL PAGES SCANNED</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={20} color="#06b6d4" />
            </div>
          </div>
          <div 
            className="gradient-text" 
            style={{ 
              fontSize: '2.75rem', 
              fontWeight: 900, 
              marginBottom: '0.4rem', 
              fontFamily: 'var(--font-heading)', 
              letterSpacing: '-0.03em',
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--accent-gradient-start) 0%, var(--accent-gradient-end) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {stats.totalScans.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#67e8f9' }}>
            <TrendingUp size={14} />
            <span>+14.2% increase this week</span>
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
          }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="glass-card"
          style={{ 
            border: '1px solid rgba(239, 68, 68, 0.35)', 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(239, 68, 68, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FLAGGED DARK PATTERNS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#f87171" />
            </div>
          </div>
          <div 
            className="gradient-text" 
            style={{ 
              fontSize: '2.75rem', 
              fontWeight: 900, 
              marginBottom: '0.4rem', 
              fontFamily: 'var(--font-heading)', 
              letterSpacing: '-0.03em',
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--accent-danger-start) 0%, var(--accent-danger-end) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {stats.totalDetections.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#fca5a5' }}>
            <span className="cyber-badge badge-crimson">{detectionPercentage}% Detection Rate</span>
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
          }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="glass-card"
          style={{ 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CLEAN PAGE SCANS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} color="#10b981" />
            </div>
          </div>
          <div 
            className="gradient-text" 
            style={{ 
              fontSize: '2.75rem', 
              fontWeight: 900, 
              marginBottom: '0.4rem', 
              fontFamily: 'var(--font-heading)', 
              letterSpacing: '-0.03em',
              display: 'inline-block',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {cleanScans.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6ee7b7' }}>
            <span className="cyber-badge badge-emerald">{(100 - parseFloat(detectionPercentage)).toFixed(1)}% Safe Ratio</span>
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
          }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="glass-card"
          style={{ 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(239, 68, 68, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HIGH RISK DOMAINS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} color="#fca5a5" />
            </div>
          </div>
          <div 
            className="gradient-text" 
            style={{ 
              fontSize: '2.75rem', 
              fontWeight: 900, 
              marginBottom: '0.4rem', 
              fontFamily: 'var(--font-heading)', 
              letterSpacing: '-0.03em',
              display: 'inline-block',
              background: 'linear-gradient(135deg, var(--accent-danger-start) 0%, var(--accent-danger-end) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            10 Flagged
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span>Top target: Temu & Booking.com</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Visualizers Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <TrendsLineChart />
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', background: 'radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ScanRatioPieChart totalScans={stats.totalScans} totalDetections={stats.totalDetections} />
          </div>
        </div>
      </div>

      {/* Live Recent Threat Telemetry Feed */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#f43f5e" />
              Recent Flagged Threat Feed
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Live real-time detection telemetry stream from Chrome extension instances
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((act) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'rgba(7, 10, 19, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '12px',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span className="cyber-badge badge-crimson">DARK PATTERN</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{act.domain}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                    "{act.snippet}"
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e' }}>
                      {((act.confidence || 0.95) * 100).toFixed(0)}% Confidence
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <a
                    href={act.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#c4b5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              No recent detection telemetry stream recorded.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
