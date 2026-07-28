import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  User,
  Settings,
  Info,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'chat', icon: MessageSquare, label: 'Agentic Chat' },
    { id: 'documents', icon: FileText, label: 'Knowledge Base' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'about', icon: Info, label: 'About Architecture' },
  ];

  return (
    <aside className="glass-panel" style={{ width: '250px', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, display: 'flex', flexDirection: 'column', padding: '22px 14px' }}>
      <div style={{ padding: '0 12px 16px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sparkles size={14} color="var(--accent-cyan)" /> Main Workspace Navigation
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                background: isActive ? 'var(--gradient-brand)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? 'var(--shadow-glow), 0 0 20px rgba(6, 182, 212, 0.3)' : 'none',
                position: 'relative'
              }}
            >
              <Icon size={19} color={isActive ? '#ffffff' : 'var(--text-dim)'} />
              <span>{item.label}</span>
              {isActive && (
                <div style={{ position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 8px #ffffff' }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.12))', borderRadius: '14px', border: '1px solid rgba(139, 92, 246, 0.25)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '6px' }}>
          <span className="pulse-dot" style={{ color: 'var(--accent-emerald)' }} /> Production API Live
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
          LangGraph Multi-Agent Engine powered by Google Gemini & Hybrid Qdrant Retrieval.
        </p>
      </div>
    </aside>
  );
};
