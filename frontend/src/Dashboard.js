import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SEVERITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

function RiskBadge({ severity }) {
  const colors = {
    High: { bg: '#2d1515', text: '#ef4444', border: '#7f1d1d' },
    Medium: { bg: '#2d1f0a', text: '#f59e0b', border: '#78350f' },
    Low: { bg: '#0f2d1a', text: '#22c55e', border: '#14532d' },
  };
  const c = colors[severity] || colors.Low;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: '6px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600
    }}>
      {severity}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#1a1d2e', border: '1px solid #2d3148',
      borderRadius: '12px', padding: '1.25rem', textAlign: 'center'
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || '#fff' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#7c85a2', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

export default function Dashboard({ result, fileName, mode }) {
  const { threats, summary, stats } = result;

  const pieData = [
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low },
  ].filter(d => d.value > 0);

  const threatTypes = threats.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(threatTypes).map(([type, count]) => ({ type, count }));

  const riskColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
  const riskColor = riskColors[stats.overall_risk];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          {mode === 'pcap' ? '🌐 Network Traffic Analysis' : '📄 Log Analysis'} Results {fileName && <span style={{ color: '#7c85a2', fontWeight: 400, fontSize: '0.9rem' }}>— {fileName}</span>}
        </h2>
        <p style={{ color: '#7c85a2', fontSize: '0.875rem', marginTop: '4px' }}>{summary}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        <StatCard label="Overall Risk" value={stats.overall_risk} color={riskColor} />
        <StatCard label="Total Threats" value={stats.total} color="#4f7fff" />
        <StatCard label="High Severity" value={stats.high} color="#ef4444" />
        <StatCard label="Medium Severity" value={stats.medium} color="#f59e0b" />
        <StatCard label="Low Severity" value={stats.low} color="#22c55e" />
        <StatCard label="Lines Analyzed" value={stats.lines_analyzed} color="#a78bfa" />
      </div>

      {threats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#7c85a2' }}>Threat Severity Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#7c85a2' }}>Threats by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#7c85a2' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#7c85a2' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#4f7fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Detected Threats {threats.length > 0 && <span style={{ color: '#7c85a2', fontWeight: 400 }}>({threats.length} found)</span>}
        </h3>

        {threats.length === 0 ? (
          <div style={{ background: '#0f2d1a', border: '1px solid #14532d', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#22c55e' }}>
            ✅ No threats detected in the analyzed logs.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {threats.map((threat, i) => (
              <div key={i} style={{
                background: '#1a1d2e', border: '1px solid #2d3148',
                borderRadius: '12px', padding: '1.25rem',
                borderLeft: `3px solid ${SEVERITY_COLORS[threat.severity]}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <RiskBadge severity={threat.severity} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{threat.type}</span>
                </div>
                <div style={{
                  background: '#0f1117', borderRadius: '8px', padding: '0.6rem 0.875rem',
                  fontFamily: 'Courier New, monospace', fontSize: '0.75rem',
                  color: '#94a3b8', marginBottom: '0.75rem', wordBreak: 'break-all'
                }}>
                  {threat.line}
                </div>
                <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>{threat.explanation}</p>
                <p style={{ fontSize: '0.8rem', color: '#4f7fff' }}>💡 {threat.recommendation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}