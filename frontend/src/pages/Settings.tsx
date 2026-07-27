import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          System <span className="gradient-text">Settings</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Customize application themes, view active models, and manage session options.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--bg-surface-border)' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Appearance Theme</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              Switch between Dark Glassmorphism and Light mode.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'var(--bg-surface-border)',
              border: 'none',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
            <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
          </button>
        </div>

        {/* Model Specs */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--bg-surface-border)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-cyan)" /> Active AI Models & Vector Index
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>LLM Engine:</span> <code style={{ color: 'var(--accent-cyan)' }}>Google Gemini (gemini-1.5-flash)</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Embedding Engine:</span> <code style={{ color: 'var(--accent-cyan)' }}>Google text-embedding-004 (384-dim)</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Vector Database:</span> <code>Qdrant Vector Store</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Orchestrator:</span> <code>LangGraph StateGraph DAG</code>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Session Control</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              Sign out of your active Firebase session.
            </p>
          </div>
          <button
            onClick={() => logout()}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
