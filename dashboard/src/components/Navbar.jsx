import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, History, Award, LogOut, Activity, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        padding: '0.85rem 2rem',
        background: 'linear-gradient(90deg, rgba(7, 10, 19, 0.9) 0%, rgba(124, 58, 237, 0.04) 50%, rgba(34, 211, 238, 0.02) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(217, 70, 239, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2), 0 1px 15px rgba(124, 58, 237, 0.08)'
      }}
    >
      {/* Brand / Logo */}
      <NavLink
        to="/overview"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent-gradient-start) 0%, var(--accent-gradient-mid) 50%, var(--accent-gradient-end) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(217, 70, 239, 0.5)',
          }}
        >
          <Shield size={24} color="#ffffff" />
        </motion.div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            DARK PATTERN <span className="gradient-text">DETECTOR</span>
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Cyber Ethics & AI Protection
          </div>
        </div>
      </NavLink>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink
          to="/overview"
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.4s var(--ease-premium)',
            color: isActive ? '#ffffff' : 'var(--text-secondary)',
            background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
            border: isActive ? '1px solid rgba(217, 70, 239, 0.35)' : '1px solid transparent',
            boxShadow: isActive ? '0 0 15px rgba(217, 70, 239, 0.2), inset 0 0 8px rgba(34, 211, 238, 0.08)' : 'none',
          })}
        >
          <Activity size={18} />
          Overview
        </NavLink>

        <NavLink
          to="/history"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.4s var(--ease-premium)',
            color: isActive ? '#ffffff' : 'var(--text-secondary)',
            background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
            border: isActive ? '1px solid rgba(217, 70, 239, 0.35)' : '1px solid transparent',
            boxShadow: isActive ? '0 0 15px rgba(217, 70, 239, 0.2), inset 0 0 8px rgba(34, 211, 238, 0.08)' : 'none',
          })}
        >
          <History size={18} />
          Detections History
        </NavLink>

        <NavLink
          to="/website-scores"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.4s var(--ease-premium)',
            color: isActive ? '#ffffff' : 'var(--text-secondary)',
            background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
            border: isActive ? '1px solid rgba(217, 70, 239, 0.35)' : '1px solid transparent',
            boxShadow: isActive ? '0 0 15px rgba(217, 70, 239, 0.2), inset 0 0 8px rgba(34, 211, 238, 0.08)' : 'none',
          })}
        >
          <Award size={18} />
          Risk Leaderboard
        </NavLink>
      </nav>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            background: 'rgba(13, 21, 39, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            fontSize: '0.85rem',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={14} color="#fff" />
          </div>
          <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{user.email}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="cyber-button-outline"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderRadius: '8px',
          }}
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </header>
  );
};
