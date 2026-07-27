import React, { useState } from 'react';
import { Bot, User, Copy, Check, ShieldCheck, FileText } from 'lucide-react';
import { CitationData } from '../services/apiService';
import { CitationCard } from './CitationCard';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  citations?: CitationData[];
  confidenceScore?: number;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  content,
  isStreaming,
  citations,
  confidenceScore
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAssistant = role === 'assistant';

  return (
    <div
      style={{
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        marginBottom: '20px',
        justifyContent: isAssistant ? 'flex-start' : 'flex-end'
      }}
    >
      {isAssistant && (
        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)', flexShrink: 0 }}>
          <Bot size={20} color="#ffffff" />
        </div>
      )}

      <div
        className="glass-panel"
        style={{
          maxWidth: '82%',
          padding: '16px 20px',
          borderRadius: isAssistant ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
          background: isAssistant ? 'var(--bg-surface)' : 'var(--gradient-brand)',
          border: isAssistant ? '1px solid var(--bg-surface-border)' : 'none',
          color: '#ffffff',
          position: 'relative'
        }}
      >
        {/* Header Metadata for Assistant */}
        {isAssistant && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Agentic Assistant</span>
              {confidenceScore !== undefined && confidenceScore > 0 && (
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.68rem', padding: '2px 8px' }}>
                  <ShieldCheck size={12} /> {confidenceScore}% Grounded
                </span>
              )}
            </div>

            <button
              onClick={handleCopy}
              title="Copy answer"
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div style={{ fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {content}
          {isStreaming && (
            <span style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--accent-cyan)', marginLeft: '4px', animation: 'pulse 1s infinite' }} />
          )}
        </div>

        {/* Source Citations Row */}
        {isAssistant && citations && citations.length > 0 && (
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={13} color="var(--accent-cyan)" /> Grounded Citations ({citations.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {citations.map((c) => (
                <CitationCard key={c.citation_id} citation={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', flexShrink: 0 }}>
          <User size={18} />
        </div>
      )}
    </div>
  );
};
