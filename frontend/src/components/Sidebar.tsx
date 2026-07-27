import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  User,
  Settings,
  Info,
  Globe
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
    <aside className="glass-panel" style={{ width: '240px', borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0, display: 'flex', flexDirection: 'column', padding: '20px 12px' }}>
      <div style={{ padding: '0 12px 14px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Main Menu
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'var(--gradient-brand)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.88rem',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'var(--shadow-glow)' : 'none'
              }}
            >
              <Icon size={18} color={isActive ? '#ffffff' : 'var(--text-dim)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', padding: '14px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
          <Globe size={14} /> Production API Live
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
          LangGraph Multi-Agent Engine with Gemini LLM & Hybrid Retrieval.
        </p>
      </div>
    </aside>
  );
};
