import React from 'react';
import { Bot, Cpu, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { HealthStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  health: HealthStatus | null;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ health, loading }) => {
  const { currentUser, userProfile, logout } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
          <Bot size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Agentic RAG <span className="gradient-text">Assistant</span>
            </h1>
            <span className="badge badge-phase">
              <Sparkles size={12} /> Phase 2 Active
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Stateful Multi-Agent Knowledge Engine & Hybrid Search Infrastructure
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Cpu size={16} color="var(--accent-cyan)" />
          <span>Backend:</span>
          {loading ? (
            <span style={{ color: 'var(--accent-cyan)' }}>Connecting...</span>
          ) : health?.status === 'online' ? (
            <span className="badge badge-online">
              <span className="pulse-dot"></span> Online (v{health.version})
            </span>
          ) : (
            <span style={{ color: '#ef4444', fontWeight: 600 }}>Offline</span>
          )}
        </div>

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--bg-surface-border)', paddingLeft: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <UserIcon size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {userProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{currentUser.email}</span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
