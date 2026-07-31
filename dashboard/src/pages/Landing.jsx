import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowRight, 
  ChevronDown, 
  Info, 
  TrendingUp, 
  Chrome, 
  HelpCircle,
  Mail,
  Github
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Lazy load the 3D Hero Scene
const SceneRoot = React.lazy(() => import('../components/landing/SceneRoot'));

// 10 Dark Pattern Categories Taxonomy
const CATEGORIES = [
  {
    name: 'Scarcity',
    example: 'Only 2 items left in stock!',
    desc: 'Creating false impressions of limited availability to force premature purchasing decisions.'
  },
  {
    name: 'Urgency',
    example: 'Deal expires in 05:00 minutes!',
    desc: 'Imposing artificial time limits to induce panic and skip critical deliberation.'
  },
  {
    name: 'Confirmshaming',
    example: 'No thanks, I hate saving money',
    desc: 'Manipulating choices by emotionally pairing the opt-out option with verbal shame.'
  },
  {
    name: 'Sneaking',
    example: 'VIP protection club pre-selected',
    desc: 'Quietly adding items to carts or checkouts without explicit, conscious user intent.'
  },
  {
    name: 'Hidden Costs',
    example: '$15.00 delivery service fee added at step 4',
    desc: 'Withholding mandatory fees until the final step of a lengthy transaction process.'
  },
  {
    name: 'Forced Continuity',
    example: 'Free trial rolls into monthly $49 subscription',
    desc: 'Charging silent, recurring subscription fees after a free trial without active notifications.'
  },
  {
    name: 'Obstruction',
    example: 'Call our hotline on weekdays to cancel subscription',
    desc: 'Making it deliberately hard to cancel services or opt-out compared to signing up.'
  },
  {
    name: 'Misdirection',
    example: 'Huge green button for "Accept All", tiny grey text for "Decline"',
    desc: 'Using visual hierarchy to guide users toward options that benefit the site over the user.'
  },
  {
    name: 'Social Proof',
    example: '412 other buyers are looking at this hotel now',
    desc: 'Faking or inflating statistics about other users’ behavior to manufacture social pressure.'
  },
  {
    name: 'Fake Countdown',
    example: 'Hurry, sale ends in 02:00 (resets on refresh)',
    desc: 'Displaying timers that pretend to run out but reset automatically when refreshed.'
  }
];

// Product Benefits
const BENEFITS = [
  {
    title: 'Real-Time Neural Detection',
    subtitle: 'Scans pages as you browse',
    desc: 'Unlike static, blind domain blocklists, our system dynamically analyzes DOM text nodes as they render, flagging threats on SPAs and modern web apps automatically.',
    gradient: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2) 0%, #070a13 70%)'
  },
  {
    title: 'Probability Confidence Scoring',
    subtitle: 'Explainable neural predictions',
    desc: 'Every scanned element receives a localized classification probability from our DistilBERT model, so you see exactly how certain the detector is before choosing to dismiss a warning.',
    gradient: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.2) 0%, #070a13 70%)'
  },
  {
    title: 'Visual In-Context Highlighting',
    subtitle: 'Points out the exact manipulator',
    desc: 'Warnings are not hidden inside extension panels. They mount directly inside the webpage DOM using isolated Shadow roots, ensuring site styling cannot break your alert overlays.',
    gradient: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.2) 0%, #070a13 70%)'
  },
  {
    title: '100% Free & Open-Source',
    subtitle: 'Security you can audit',
    desc: 'Deceptive design detection requires absolute trust. Our full code stack is auditable, open, and built to keep user data private without silent background tracking.',
    gradient: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, #070a13 70%)'
  }
];

// FAQ list
const FAQS = [
  {
    q: 'What counts as a dark pattern?',
    a: 'Dark patterns are user interface designs engineered to trick users into doing things they might not otherwise do, such as signing up for recurring charges, sharing private data, or buying unwanted add-ons.'
  },
  {
    q: 'How accurate is the neural detection system?',
    a: 'The system uses a fine-tuned DistilBERT NLP model that scores web text snippets based on patterns identified in our training datasets. While it offers high precision, it currently operates as a binary classifier, flags are further evaluated in context by our localized heuristics.'
  },
  {
    q: 'Does the extension slow down browsing?',
    a: 'No. The DOM crawling code uses a debounced MutationObserver (waiting 800ms for page layout to settle) before running. Scans are optimized and execute asynchronously so web rendering remains smooth.'
  },
  {
    q: 'What data is collected? Is my history sent to the server?',
    a: 'We respect privacy. Full URLs and entire browsing histories are never tracked. The extension only extracts raw text snippets from the active tab and sends them securely to the classification backend to run the model. If a snippet is classified as clean, it is discarded immediately.'
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [percent, setPercent] = useState(0);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const benefitsSecRef = useRef(null);
  const benefitsStickyRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(window.scrollY / totalHeight);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', motionListener);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 1. Preloader ticking counter
  useEffect(() => {
    const start = Date.now();
    const duration = 1200; // 1.2s preloader

    const timer = setInterval(() => {
      const timePassed = Date.now() - start;
      const progress = Math.min(1, timePassed / duration);
      const currentPercent = Math.floor(progress * 100);

      setPercent(currentPercent);

      if (progress === 1) {
        clearInterval(timer);
        setTimeout(() => setPreloaderDone(true), 150);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // 2. Scroll Trigger Animations
  useEffect(() => {
    if (!preloaderDone) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('Reduced motion active. Skipping scroll timeline animations.');
      return;
    }

    // Scroll trigger for category horizontal translation
    const carouselTrack = carouselRef.current;
    if (carouselTrack) {
      const scrollWidth = carouselTrack.scrollWidth;
      const viewportWidth = window.innerWidth;
      const xDistance = -(scrollWidth - viewportWidth + 80);

      gsap.to(carouselTrack, {
        x: xDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: '.category-section',
          start: 'top top+=80',
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const cards = carouselTrack.querySelectorAll('.category-card');
            const center = window.innerWidth / 2;
            cards.forEach((card) => {
              const rect = card.getBoundingClientRect();
              const cardCenter = rect.left + rect.width / 2;
              const deltaX = cardCenter - center;
              
              // Angle rotation based on distance from center (curving arc)
              const rotationY = Math.max(-40, Math.min(40, (deltaX / center) * 32));
              // Push cards slightly backward on the Z-axis as they move away from the center
              const translateZ = Math.max(-200, -Math.abs(deltaX / center) * 150);
              // Scale down side cards
              const scale = Math.max(0.78, 1 - Math.abs(deltaX / center) * 0.22);
              // Apply CSS blur for fake depth of field
              const blur = Math.min(4, Math.abs(deltaX / center) * 3);
              
              card.style.transform = `perspective(1000px) rotateY(${rotationY}deg) translateZ(${translateZ}px) scale(${scale})`;
              card.style.filter = `blur(${blur}px)`;
              card.style.opacity = Math.max(0.45, 1 - Math.abs(deltaX / center) * 0.45);
            });
          }
        }
      });
    }

    // Scroll trigger for Benefits Section
    const benefitsSticky = benefitsStickyRef.current;
    const benefitsSection = benefitsSecRef.current;
    if (benefitsSticky && benefitsSection) {
      ScrollTrigger.create({
        trigger: benefitsSection,
        start: 'top top',
        end: 'bottom bottom',
        pin: benefitsSticky,
        pinSpacing: false,
        onUpdate: (self) => {
          const progress = self.progress;
          const slideCount = BENEFITS.length;
          const activeIndex = Math.min(
            slideCount - 1,
            Math.floor(progress * slideCount)
          );
          setActiveBenefit(activeIndex);
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [preloaderDone]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const staticMockup = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '450px', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(13, 21, 39, 0.95)',
        }}
      >
        {/* Window header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(7, 10, 19, 0.4)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '0.15rem 0' }}>
            checkout-portal.io
          </div>
        </div>
        {/* Mock Page Content */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
          <div style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
          <div style={{ height: '32px', width: '90%', background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }} />
          <div style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
          
          {/* Pinned Scanning Overlay element */}
          <div style={{ 
            position: 'relative', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(244, 63, 94, 0.4)', 
            background: 'rgba(244, 63, 94, 0.06)',
            overflow: 'hidden'
          }}>
            {/* Warning Scanline Sweep */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '2px',
              background: '#f43f5e',
              boxShadow: '0 0 10px #f43f5e',
              animation: 'scanline-sweep 2.5s infinite linear'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={14} color="#f43f5e" style={{ margin: '0' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Deceptive Text Node Flagged
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#fda4af', fontWeight: 500, fontStyle: 'italic' }}>
              "No thanks, I prefer risking my baggage without travel protection insurance."
            </div>
          </div>

          <div style={{ height: '40px', width: '100%', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', marginTop: '1rem' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. PRELOADER */}
      {!preloaderDone && (
        <div className="preloader">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifycontent: 'center', boxShadow: '0 0 25px rgba(139,92,246,0.5)' }}>
              <Shield size={28} color="#ffffff" style={{ margin: '0 auto' }} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
              DARK PATTERN <span className="gradient-text">DETECTOR</span>
            </span>
          </div>
          <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${percent}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', transition: 'width 0.05s linear' }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.8rem', fontFamily: 'monospace' }}>
            Telemetry Core Loaded: {percent}%
          </span>
        </div>
      )}

      {/* LANDING CONTENT */}
      <div className="landing-container" ref={containerRef}>
        
        {/* Fractal SVG noise overlay */}
        <div className="landing-noise-overlay" />

        {/* Global fixed scroll-driven 3D WebGL world */}
        {!reducedMotion && preloaderDone && (
          <React.Suspense fallback={null}>
            <SceneRoot 
              scrollProgress={scrollProgress} 
              activeBenefit={activeBenefit} 
              onDismiss={() => alert('Mock Scan Refreshed: Site verified as resolved.')} 
            />
          </React.Suspense>
        )}

        {/* Header/Nav */}
        <header className="landing-header">
          <a href="#" className="logo-container">
            <Shield size={24} className="pulse-glow" style={{ color: 'var(--accent-purple)' }} />
            <span>Dark Pattern <span className="gradient-text">Detector</span></span>
          </a>
          <nav className="nav-links">
            <a href="#categories" className="nav-link">Categories</a>
            <a href="#why" className="nav-link">Features</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <button 
              onClick={() => navigate('/login')}
              className="cyber-button cyber-button-outline"
              style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="cyber-button"
              style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}
            >
              Start Console <ArrowRight size={14} />
            </button>
          </nav>
        </header>

        {/* 2. HERO SECTION */}
        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ maxWidth: '1200px', width: '100%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center', zIndex: 10, position: 'relative', pointerEvents: 'none', textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ pointerEvents: 'auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', justifyContent: isMobile ? 'center' : 'flex-start', width: 'auto' }}>
                <TrendingUp size={14} /> Model weights restored & running
              </div>
              <h1 style={{ fontSize: isMobile ? '2.5rem' : '3.75rem', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                Reveal the <span className="gradient-text">deceptive designs</span> websites try to hide.
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '580px', margin: isMobile ? '0 auto 2.5rem' : '0 0 2.5rem' }}>
                Our Chrome extension uses localized natural language algorithms to scan browser tabs dynamically, highlighting confirmshaming, sneak sub-registrations, and countdown tricks in context.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <button 
                  onClick={() => alert('Extension download mock triggered! Connect extension folder locally to scan.')}
                  className="cyber-button" 
                  style={{ gap: '0.6rem', padding: '1rem 2rem' }}
                >
                  <Chrome size={20} />
                  Add to Chrome (Free)
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="cyber-button cyber-button-outline" 
                  style={{ padding: '1rem 2rem' }}
                >
                  View Threat Console
                </button>
              </div>
            </div>

            {/* Cinematic Browser Mockup / 3D Canvas Projection Slot */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: isMobile ? '280px' : '380px', pointerEvents: 'auto' }}>
              {reducedMotion ? (
                staticMockup
              ) : (
                /* Empty placeholder on desktop so absolute 3D canvas HTML projection floats here. */
                <div style={{ width: '450px', height: '380px', pointerEvents: 'none' }} className="hero-3d-placeholder" />
              )}
            </div>
          </div>

          {/* Subtle scroll down indicator */}
          <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Scroll to Discover</span>
            <ChevronDown size={18} className="pulse-glow" />
          </div>
        </section>

        {/* 3. HORIZONTAL-SCROLL CATEGORIES CAROUSEL */}
        <section id="categories" className="category-section">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Taxonomy Roadmap</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem' }}>
              What we are built to catch.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.8rem', maxWidth: '600px' }}>
              Deceptive designs manipulate user interfaces to force unintended actions. Our detection framework maps user sites against these 10 industry-standard categories:
            </p>
          </div>

          <div className="category-wrapper" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
            <div className="category-track" ref={carouselRef} style={{ transformStyle: 'preserve-3d' }}>
              {CATEGORIES.map((cat, i) => {
                const catColor = `var(--cat-${i + 1})`;
                return (
                  <div 
                    key={i} 
                    className="category-card"
                    style={{
                      border: `1px solid ${catColor}33`,
                      boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${catColor}08`,
                      transition: 'border-color 0.4s var(--ease-premium), box-shadow 0.4s var(--ease-premium)',
                      transformStyle: 'preserve-3d'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = catColor;
                      e.currentTarget.style.boxShadow = `0 4px 30px rgba(0, 0, 0, 0.4), 0 0 25px ${catColor}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${catColor}33`;
                      e.currentTarget.style.boxShadow = `0 4px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${catColor}08`;
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.7rem', color: catColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Category {i + 1}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff' }}>
                        {cat.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.8rem', lineHeight: 1.5 }}>
                        {cat.desc}
                      </p>
                    </div>
                    
                    <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${catColor}` }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Telemetry Example:</div>
                      <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontStyle: 'italic', marginTop: '0.2rem' }}>
                        "{cat.example}"
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. STICKY BENEFITS SECTION */}
        <section id="why" className="benefits-section" ref={benefitsSecRef} style={{ height: `${BENEFITS.length * 100}vh` }}>
          <div className="benefits-sticky-container" ref={benefitsStickyRef}>
            
            {/* Background Layer with Crossfaded Gradients */}
            <div 
              className="benefits-bg-layer" 
              style={{ background: BENEFITS[activeBenefit].gradient }}
            />

            <div className="benefits-content-box">
              
              {/* Left Column: Visual representations */}
              <div className="benefit-visual-pane">
                {BENEFITS.map((benefit, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      opacity: activeBenefit === i ? 1 : 0, 
                      transform: activeBenefit === i ? 'scale(1)' : 'scale(0.95)',
                      transition: 'opacity 0.6s var(--ease-premium), transform 0.6s var(--ease-premium)',
                      padding: '2rem'
                    }}
                  >
                    {/* Representing the benefit visually */}
                    {i === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '80%' }}>
                        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }} />
                        <div style={{ height: '40px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.6rem' }}>
                          <Shield size={16} color="#8b5cf6" />
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#c4b5fd' }}>Deep scanning active node...</span>
                        </div>
                        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }} />
                      </div>
                    )}
                    {i === 1 && (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-cyan)' }} className="pulse-glow">
                          98.4%
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Neural Classifier Confidence
                        </div>
                      </div>
                    )}
                    {i === 2 && (
                      <div style={{ border: '1px dashed rgba(244, 63, 94, 0.4)', padding: '1.5rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.05)', width: '80%', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                          <Info size={12} /> CONFIRMSHAMING FLAG
                        </span>
                        <p style={{ fontSize: '0.9rem', color: '#ffffff', fontStyle: 'italic' }}>
                          "No, I choose to pay full price."
                        </p>
                      </div>
                    )}
                    {i === 3 && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--accent-emerald)', padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <Github size={20} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace' }}>github.com/dark-pattern</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column: Descriptions crossfading */}
              <div className="benefit-detail-slides">
                {BENEFITS.map((benefit, i) => (
                  <div 
                    key={i} 
                    className={`benefit-slide ${activeBenefit === i ? 'active' : ''}`}
                  >
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 800 }}>
                      Differentiator 0{i + 1}
                    </span>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.5rem', marginBottom: '0.8rem' }}>
                      {benefit.title}
                    </h3>
                    <p style={{ color: 'var(--accent-purple)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                      {benefit.subtitle}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Vertical side dot navigation */}
            <div className="benefits-nav">
              {BENEFITS.map((_, i) => (
                <button
                  key={i}
                  className={`benefit-nav-dot ${activeBenefit === i ? 'active' : ''}`}
                  onClick={() => {
                    const targetScrollY = benefitsSecRef.current.offsetTop + (i * window.innerHeight);
                    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>

          </div>
        </section>

        {/* 5. FAQ ACCORDION SECTION */}
        <section id="faq" style={{ padding: '8rem 2rem', background: '#070a13', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Frequently Answered</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '0.5rem' }}>
              Common Questions
            </h2>
          </div>

          <div className="faq-accordion">
            {FAQS.map((faq, i) => (
              <div 
                key={i} 
                className={`faq-item ${openFaq === i ? 'open' : ''}`}
              >
                <button className="faq-trigger" onClick={() => toggleFaq(i)}>
                  <span className="faq-question">{faq.q}</span>
                  <ChevronDown size={18} className="faq-icon" />
                </button>
                <div 
                  className="faq-content"
                  style={{ 
                    maxHeight: openFaq === i ? '200px' : '0px'
                  }}
                >
                  <div className="faq-content-inner">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FOOTER SECTION */}
        <footer style={{ padding: '6rem 2rem', background: '#090d19', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '4rem', alignItems: 'center' }}>
            
            {/* Left: Brand + Email capture */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Shield size={24} style={{ color: 'var(--accent-purple)' }} />
                <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  Dark Pattern <span className="gradient-text">Detector</span>
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem', maxWidth: '450px' }}>
                Shielding users from manipulative designs through lightweight neural text classification and transparent browser telemetry.
              </p>
              
              {/* Email Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); alert('Subscribed to developer notifications!'); }}
                style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter analyst email..." 
                    className="cyber-input" 
                    style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="submit" className="cyber-button" style={{ padding: '0 1.25rem', fontSize: '0.85rem' }}>
                  Subscribe
                </button>
              </form>
            </div>

            {/* Right: Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', fontWeight: 800, marginBottom: '1rem' }}>
                  Platform
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Threat Console</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Mock install triggered'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Chrome Extension</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Sign In / Register</a>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', fontWeight: 800, marginBottom: '1rem' }}>
                  Open Source
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Github size={14} /> Repository
                  </a>
                  <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Documentation</a>
                  <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Taxonomy Rules</a>
                </div>
              </div>
            </div>

          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              &copy; 2026 Dark Pattern Detector. All rights reserved. Premium Cinematic Interaction Language.
            </span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </footer>

      </div>

      {/* Embedded CSS Keyframes for Scanline effect */}
      <style>{`
        @keyframes scanline-sweep {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </>
  );
}
