import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SceneRoot = React.lazy(() => import('../components/landing/SceneRoot'));

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/overview';

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const motionListener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionListener);

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', motionListener);
    };
  }, []);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMessage('');

    if (!email || !password) {
      setErrMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setErrMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('analyst@darkpattern.ai');
    setPassword('demo123456');
    setLoading(true);
    try {
      await login('analyst@darkpattern.ai', 'demo123456');
      navigate(from, { replace: true });
    } catch (err) {
      setErrMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Noise background grain */}
      <div className="landing-noise-overlay" />

      {/* Scaled lightweight 3D canvas (Hero view Mascot only) */}
      {!reducedMotion && (
        <Suspense fallback={null}>
          <SceneRoot isLoginMode={true} />
        </Suspense>
      )}

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div 
          style={{ 
            maxWidth: '1200px', 
            width: '100%', 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', 
            gap: isMobile ? '2rem' : '4rem', 
            alignItems: 'center' 
          }}
        >
          {/* Left Column Spacer (Mascot sits here on desktop WebGL) */}
          <div style={{ height: isMobile ? '0px' : '400px', pointerEvents: 'none' }} />

          {/* Right Column: Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2.5rem 2rem',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(10, 17, 34, 0.92) 0%, rgba(124, 58, 237, 0.05) 100%)',
              border: '1px solid rgba(217, 70, 239, 0.25)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 30px rgba(217, 70, 239, 0.1)',
            }}
          >
            {/* Top Glow Accent Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'var(--accent-gradient)',
              }}
            />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 25px rgba(217, 70, 239, 0.4)',
            }}
          >
            <Shield size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {isSignUp ? 'Create Analyst Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Access the Dark Pattern Threat Intelligence Console
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(7, 10, 19, 0.7)',
            padding: '0.3rem',
            borderRadius: '12px',
            marginBottom: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              color: !isSignUp ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'color 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              color: isSignUp ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'color 0.2s ease',
            }}
          >
            Register
          </button>

          {/* Animated active pill */}
          <motion.div
            layout
            initial={false}
            animate={{ x: isSignUp ? '100%' : '0%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'absolute',
              top: '0.3rem',
              left: '0.3rem',
              width: 'calc(50% - 0.3rem)',
              height: 'calc(100% - 0.6rem)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              borderRadius: '9px',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
              zIndex: 1,
            }}
          />
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#fda4af',
                fontSize: '0.85rem',
              }}
            >
              <AlertTriangle size={18} />
              <span>{errMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@darkpattern.ai"
                className="cyber-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="cyber-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="cyber-button"
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, var(--accent-gradient-start) 0%, var(--accent-gradient-mid) 50%, var(--accent-gradient-end) 100%)',
              backgroundSize: '200% auto',
              animation: 'gradient-shift 6s linear infinite',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Authenticate Console'}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Quick Demo Access Button */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '10px',
              color: '#67e8f9',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle2 size={16} />
            Quick Access: Demo Analyst Mode
          </button>
        </div>
      </motion.div>
        </div>
      </div>
    </>
  );
};
