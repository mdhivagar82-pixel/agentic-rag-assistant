import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
          <Bot size={28} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <Loader2 size={18} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
          Verifying Authentication Session...
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!currentUser) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
