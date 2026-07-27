import React from 'react';
import { Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ padding: '12px 24px', borderTop: '1px solid var(--bg-surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Cpu size={14} color="var(--accent-cyan)" />
        <span>Agentic RAG Knowledge Assistant v0.1.0</span>
      </div>
      <div>
        <span>Powered by LangGraph & Google Gemini</span>
      </div>
    </footer>
  );
};
