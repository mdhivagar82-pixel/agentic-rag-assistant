import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px'
      }}
    >
      <div style={{ padding: '14px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)', marginBottom: '14px' }}>
        {icon || <FolderOpen size={32} />}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: onAction ? '18px' : 0 }}>
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'var(--gradient-brand)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
