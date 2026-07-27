import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, FileText, Activity, ShieldCheck, ArrowRight, UploadCloud, Sparkles } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser, userProfile } = useAuth();

  const stats = [
    { label: 'Grounded Accuracy', value: '96.4%', icon: ShieldCheck, color: 'var(--accent-emerald)' },
    { label: 'Indexed Documents', value: '12 Files', icon: FileText, color: 'var(--accent-cyan)' },
    { label: 'Total Vector Chunks', value: '1,480 Chunks', icon: Activity, color: 'var(--accent-primary)' },
    { label: 'Agent Workflows Run', value: '84 Queries', icon: Sparkles, color: 'var(--accent-purple)' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(18, 26, 44, 0.9), rgba(30, 42, 68, 0.6))', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              <Sparkles size={16} /> AGENTIC KNOWLEDGE DASHBOARD
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
              Welcome back, <span className="gradient-text">{userProfile?.displayName || currentUser?.displayName || 'Knowledge User'}</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '650px', margin: 0 }}>
              Your stateful LangGraph multi-agent engine is ready to parse, index, and query your knowledge base documents.
            </p>
          </div>

          <button
            onClick={() => onNavigate('chat')}
            style={{ padding: '12px 22px', borderRadius: '12px', background: 'var(--gradient-brand)', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-glow)' }}
          >
            <MessageSquare size={18} />
            <span>Launch Agentic Chat</span>
          </button>
        </div>
      </div>

      {/* AI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: s.color }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <UploadCloud size={22} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Upload Knowledge Documents</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Ingest new PDFs, DOCX, Markdown, or text files into the Qdrant hybrid vector store.
            </p>
          </div>
          <button
            onClick={() => onNavigate('documents')}
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>Manage Documents</span> <ArrowRight size={16} />
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <MessageSquare size={22} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Start Agentic Query Session</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
              Ask questions backed by real-time Self-RAG reflection verification and inline citations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('chat')}
            style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--gradient-brand)', border: 'none', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-glow)' }}
          >
            <span>Open Chat Interface</span> <ArrowRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};
