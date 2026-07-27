import React, { useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { CitationData } from '../services/apiService';

interface CitationCardProps {
  citation: CitationData;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block', margin: '0 4px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(99, 102, 241, 0.18)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          color: 'var(--accent-cyan)',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <FileText size={12} />
        <span>[Source {citation.citation_id}: {citation.source_filename}]</span>
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '120%',
            left: 0,
            width: '320px',
            padding: '14px',
            borderRadius: '12px',
            zIndex: 100,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid var(--accent-primary)',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="var(--accent-emerald)" />
              <span>{citation.source_filename}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>Relevance: {(citation.relevance_score * 100).toFixed(0)}%</span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', fontStyle: 'italic' }}>
            "{citation.snippet}"
          </p>

          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Chunk ID: {citation.chunk_id}</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
