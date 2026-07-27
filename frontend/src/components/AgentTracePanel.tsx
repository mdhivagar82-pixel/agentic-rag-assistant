import React from 'react';
import { Activity, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { AgentThoughtEvent, CitationData, ReflectionLogData } from '../services/apiService';

interface AgentTracePanelProps {
  thoughts: AgentThoughtEvent[];
  citations: CitationData[];
  confidenceScore: number;
  reflectionLogs: ReflectionLogData[];
  isOpen: boolean;
  onClose: () => void;
}

export const AgentTracePanel: React.FC<AgentTracePanelProps> = ({
  thoughts,
  citations,
  confidenceScore,
  reflectionLogs,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '380px',
        zIndex: 90,
        borderRadius: 0,
        borderTop: 0,
        borderBottom: 0,
        borderRight: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        background: 'var(--bg-surface)'
      }}
    >
      {/* Drawer Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Agent Execution Trace</h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>

      {/* Drawer Body Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Confidence Score Gauge */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Grounding Confidence Score</span>
            <ShieldCheck size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: confidenceScore > 70 ? 'var(--accent-emerald)' : confidenceScore > 40 ? '#f59e0b' : '#ef4444' }}>
            {confidenceScore}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Calculated across {citations.length} retrieved document citations
          </div>
        </div>

        {/* Step-by-Step LangGraph Thought Trace */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--accent-cyan)" /> LangGraph DAG Node Steps
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {thoughts.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                No active execution trace yet. Ask a question to see real-time agent steps.
              </div>
            ) : (
              thoughts.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--bg-surface-border)',
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{t.step}</span>
                    <span className="badge" style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                      Step {idx + 1}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{t.action}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>{t.detail}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reflection Verification Logs */}
        {reflectionLogs.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} color="var(--accent-purple)" /> Self-RAG Reflection Verification
            </div>
            {reflectionLogs.map((r, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: r.is_sufficient ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: r.is_sufficient ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.8rem',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                  <span>{r.step}</span>
                  <span style={{ color: r.is_sufficient ? '#34d399' : '#fca5a5' }}>
                    {r.is_sufficient ? 'Sufficient' : 'Needs Retry'}
                  </span>
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{r.reason}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
