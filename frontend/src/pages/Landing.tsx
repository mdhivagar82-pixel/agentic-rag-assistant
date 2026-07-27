import React from 'react';
import { Bot, Sparkles, ShieldCheck, ArrowRight, Layers, Database } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', width: '100vw', overflowY: 'auto', background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), #090d16', color: '#ffffff', padding: '40px 24px' }}>
      
      {/* Top Bar */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
            <Bot size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Agentic RAG <span className="gradient-text">Assistant</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onNavigate('login')}
            style={{ background: 'none', border: '1px solid var(--bg-surface-border)', color: '#ffffff', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            style={{ background: 'var(--gradient-brand)', border: 'none', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: 'var(--shadow-glow)' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ maxWidth: '900px', margin: '0 auto 80px', textAlign: 'center' }}>
        <span className="badge badge-phase" style={{ marginBottom: '16px', padding: '6px 14px' }}>
          <Sparkles size={14} /> Production Multi-Agent Engine Live
        </span>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
          Enterprise Knowledge Retrieval Powered by <span className="gradient-text">LangGraph & Gemini</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '740px', margin: '0 auto 32px' }}>
          Stateful multi-agent orchestrations, hybrid BM25 + Qdrant vector search, Self-RAG reflection loops, and citation-backed answer synthesis.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={() => onNavigate('register')}
            style={{ padding: '14px 28px', borderRadius: '12px', background: 'var(--gradient-brand)', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-glow)' }}
          >
            <span>Start Free Trial</span> <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', width: 'fit-content', marginBottom: '16px' }}>
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>LangGraph Multi-Agent</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Stateful graph workflows coordinating Query Routing, Retrieval, Context Formatting, and Gemini LLM Synthesis.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', width: 'fit-content', marginBottom: '16px' }}>
            <Database size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Hybrid Search Engine</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Reciprocal Rank Fusion (RRF) combining sparse BM25 keyword matching with dense Qdrant vector similarity embeddings.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', width: 'fit-content', marginBottom: '16px' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Self-RAG & Reflection</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Reflection verification agents evaluate answer coverage, score grounding confidence (0-100%), and trigger query rewrites.
          </p>
        </div>
      </div>

    </div>
  );
};
