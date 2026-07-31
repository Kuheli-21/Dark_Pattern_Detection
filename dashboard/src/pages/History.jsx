import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getDetections } from '../api/dashboard.api';
import {
  History as HistoryIcon,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';

const CATEGORIES_LIST = [
  'Confirmshaming',
  'Sneak into Basket',
  'Fake Scarcity',
  'Subscription Trap',
  'Hidden Costs',
  'Bait and Switch',
  'Fake Social Proof',
  'Nagging',
  'Preselection',
  'Forced Action'
];

const getCategoryForSnippet = (snippet) => {
  const lower = snippet?.toLowerCase() || '';
  if (lower.includes('risk') || lower.includes('no thanks') || lower.includes('prefer')) {
    return { name: 'Confirmshaming', color: 'var(--cat-1)' };
  }
  if (lower.includes('warranty') || lower.includes('basket') || lower.includes('add')) {
    return { name: 'Sneak into Basket', color: 'var(--cat-2)' };
  }
  if (lower.includes('left') || lower.includes('stock') || lower.includes('hurry')) {
    return { name: 'Fake Scarcity', color: 'var(--cat-3)' };
  }
  if (lower.includes('bill') || lower.includes('recur') || lower.includes('subscribe') || lower.includes('try free')) {
    return { name: 'Subscription Trap', color: 'var(--cat-4)' };
  }
  if (lower.includes('fee') || lower.includes('charge') || lower.includes('processing')) {
    return { name: 'Hidden Costs', color: 'var(--cat-5)' };
  }
  if (lower.includes('close') || lower.includes('switch') || lower.includes('bait')) {
    return { name: 'Bait and Switch', color: 'var(--cat-6)' };
  }
  if (lower.includes('other people') || lower.includes('shoppers') || lower.includes('social proof') || lower.includes('looking at')) {
    return { name: 'Fake Social Proof', color: 'var(--cat-7)' };
  }
  if (lower.includes('popup') || lower.includes('nag')) {
    return { name: 'Nagging', color: 'var(--cat-8)' };
  }
  if (lower.includes('preselected') || lower.includes('default') || lower.includes('pre-ticked')) {
    return { name: 'Preselection', color: 'var(--cat-9)' };
  }
  return { name: 'Forced Action', color: 'var(--cat-10)' };
};

export const History = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const domainFilter = searchParams.get('domain') || '';
  const patternFilter = searchParams.get('patternType') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchInput, setSearchInput] = useState(domainFilter);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getDetections({
          domain: domainFilter,
          patternType: patternFilter,
          page,
          limit,
        });
        setItems(res.items || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error('Failed to fetch detection history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [domainFilter, patternFilter, page, limit]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('domain', searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const totalPages = Math.ceil(total / limit) || 1;

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
          <HistoryIcon size={28} color="#8b5cf6" />
          Detections <span className="gradient-text">History Log</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Paginated database of all scanned web snippets flagged as dark patterns
        </p>
      </div>

      {/* URL-Synced Filter Controls Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by domain (e.g. amazon.com)..."
              className="cyber-input"
              style={{ paddingLeft: '2.75rem' }}
            />
          </form>

          {(domainFilter || patternFilter) && (
            <button
              onClick={handleClearFilters}
              className="cyber-button-outline"
              style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}
            >
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>

        {/* Category Pills Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
            <Filter size={14} color="var(--accent-purple)" /> FILTER BY TAXONOMY:
          </div>
          <button
            onClick={() => updateParam('patternType', '')}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.75rem',
              borderRadius: '9999px',
              border: !patternFilter ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: !patternFilter ? 'linear-gradient(135deg, var(--accent-gradient-start) 0%, var(--accent-gradient-end) 100%)' : 'rgba(7, 10, 19, 0.4)',
              boxShadow: !patternFilter ? '0 0 12px rgba(217, 70, 239, 0.2)' : 'none',
              color: !patternFilter ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            All Categories
          </button>
          {CATEGORIES_LIST.map((catName, idx) => {
            const isActive = patternFilter === catName;
            const catColor = `var(--cat-${idx + 1})`;
            return (
              <button
                key={catName}
                onClick={() => updateParam('patternType', catName)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  border: isActive ? `1px solid ${catColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isActive ? `${catColor}20` : 'rgba(7, 10, 19, 0.4)',
                  boxShadow: isActive ? `0 0 12px ${catColor}33` : 'none',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cyberpunk Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(7, 10, 19, 0.8)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <th style={{ padding: '1rem 1.25rem' }}>Flagged Snippet</th>
              <th style={{ padding: '1rem 1.25rem' }}>Target Domain</th>
              <th style={{ padding: '1rem 1.25rem' }}>Classification</th>
              <th style={{ padding: '1rem 1.25rem' }}>Confidence</th>
              <th style={{ padding: '1rem 1.25rem' }}>Timestamp</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  Querying threat database history...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No detection records found matching your filters.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.4s var(--ease-premium)',
                  }}
                  onMouseEnter={(e) => {
                    const cat = getCategoryForSnippet(item.snippet);
                    e.currentTarget.style.background = `${cat.color}0c`;
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem', maxWidth: '380px' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#f8fafc',
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      "{item.snippet}"
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#c4b5fd' }}>
                    {item.domain}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {(() => {
                      const cat = getCategoryForSnippet(item.snippet);
                      return (
                        <span 
                          className="cyber-badge"
                          style={{
                            background: `${cat.color}15`,
                            border: `1px solid ${cat.color}`,
                            color: cat.color,
                            boxShadow: `0 0 10px ${cat.color}22`
                          }}
                        >
                          {cat.name}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#f43f5e' }}>
                    {((item.confidence || 0.95) * 100).toFixed(0)}%
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="cyber-button-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <Info size={14} /> Details
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing {items.length > 0 ? (page - 1) * limit + 1 : 0} to Math.min({page * limit}, {total}) of {total} records
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => updateParam('page', (page - 1).toString())}
            className="cyber-button-outline"
            style={{ opacity: page <= 1 ? 0.4 : 1, padding: '0.5rem 0.75rem' }}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c4b5fd', padding: '0 0.5rem' }}>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => updateParam('page', (page + 1).toString())}
            className="cyber-button-outline"
            style={{ opacity: page >= totalPages ? 0.4 : 1, padding: '0.5rem 0.75rem' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Details Modal Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(7, 10, 19, 0.85)',
              backdropFilter: 'blur(16px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{
                maxWidth: '600px',
                width: '100%',
                padding: '2rem',
                border: '1px solid rgba(244, 63, 94, 0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={24} color="#f43f5e" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Detection Detail Inspection</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ borderLeft: '4px solid #f43f5e' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fda4af', fontWeight: 700, uppercase: true }}>
                    FLAGGED DOM TEXT SNIPPET
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginTop: '0.4rem' }}>
                    "{selectedItem.snippet}"
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target Domain</div>
                    <div style={{ fontWeight: 700, color: '#c4b5fd', marginTop: '0.2rem' }}>{selectedItem.domain}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Confidence Score</div>
                    <div style={{ fontWeight: 800, color: '#f43f5e', marginTop: '0.2rem' }}>
                      {((selectedItem.confidence || 0.95) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Full Target URL
                  </div>
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#38bdf8',
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      wordBreak: 'break-all',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {selectedItem.url} <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
