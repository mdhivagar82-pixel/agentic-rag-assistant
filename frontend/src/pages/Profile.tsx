import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Shield, FileText, MessageSquare } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          User <span className="gradient-text">Profile</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Manage your account credentials and authentication metadata.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', borderBottom: '1px solid var(--bg-surface-border)', paddingBottom: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '1.5rem', fontWeight: 800, boxShadow: 'var(--shadow-glow)' }}>
            {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              {userProfile?.displayName || currentUser?.displayName || 'Knowledge Creator'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>{currentUser?.email}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="var(--accent-emerald)" /> Login Provider
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Firebase Email & Password</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--accent-cyan)" /> Account Creation Date
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>July 2026</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="var(--accent-primary)" /> Uploaded Documents
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>12 Files Indexed</div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} color="var(--accent-purple)" /> Total Queries Run
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>84 Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};
