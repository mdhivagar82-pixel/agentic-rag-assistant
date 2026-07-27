import React from 'react';

export const About: React.FC = () => {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          About <span className="gradient-text">Agentic RAG Architecture</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Production system specifications for the Agentic RAG Knowledge Assistant.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>Architectural Overview</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
          Unlike standard naive RAG pipelines, this system implements a state-machine driven multi-agent workflow powered by **LangGraph** and **Google Gemini**. Every query passes through Intent Classification, Hybrid Dense Vector (Qdrant) + Sparse (BM25) Retrieval with Reciprocal Rank Fusion (RRF), Self-RAG Reflection verification, and explicit citation attribution.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
              1. Multi-Agent DAG State Machine
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
              Query Router ➔ Retrieval Agent ➔ Context Formatter ➔ Answer Generator ➔ Reflection Agent ➔ Self-RAG Loop.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--bg-surface-border)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '6px' }}>
              2. Self-RAG Reflection & Grounding
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
              Evaluates query term coverage and grounding confidence (0-100%). Automatically reformulates queries if evidence is insufficient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
