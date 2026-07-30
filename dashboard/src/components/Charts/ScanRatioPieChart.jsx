import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          background: 'rgba(13, 21, 39, 0.95)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${data.color}`,
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>{data.name}</p>
        <p style={{ color: data.color, fontSize: '1.1rem', fontWeight: 800 }}>
          {data.value.toLocaleString()} scans ({data.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export const ScanRatioPieChart = ({ totalScans = 9840, totalDetections = 2819 }) => {
  const cleanScans = Math.max(0, totalScans - totalDetections);
  const total = Math.max(1, totalScans);
  
  const detectionsPct = ((totalDetections / total) * 100).toFixed(1);
  const cleanPct = ((cleanScans / total) * 100).toFixed(1);

  const chartData = [
    { name: 'Dark Detections', value: totalDetections, percentage: detectionsPct, color: '#f43f5e' },
    { name: 'Clean Scans', value: cleanScans, percentage: cleanPct, color: '#10b981' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', width: '100%', position: 'relative' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieIcon size={20} color="#f43f5e" />
          Scan Classification Ratio
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Proportion of detected dark patterns vs safe page scans
        </p>
      </div>

      <div style={{ width: '100%', height: '300px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, paddingLeft: '4px' }}>
                  {value} ({entry.payload.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            {totalScans.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Scanned
          </div>
        </div>
      </div>
    </div>
  );
};
