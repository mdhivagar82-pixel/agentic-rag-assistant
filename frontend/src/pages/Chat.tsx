import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, RefreshCw, Activity, MessageSquare } from 'lucide-react';
import { streamChatAPI, AgentThoughtEvent, CitationData, ReflectionLogData } from '../services/apiService';
import { ChatBubble } from '../components/ChatBubble';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { useToast } from '../context/ToastContext';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  citations?: CitationData[];
  confidenceScore?: number;
  reflectionLogs?: ReflectionLogData[];
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      content: 'Hello! I am your Agentic RAG Knowledge Assistant powered by LangGraph, Google Gemini, and Hybrid Retrieval. Ask me anything about your uploaded documents!',
      confidenceScore: 100,
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTraceDrawer, setShowTraceDrawer] = useState(false);
  
  // Trace Data State
  const [currentThoughts, setCurrentThoughts] = useState<AgentThoughtEvent[]>([]);
  const [currentCitations, setCurrentCitations] = useState<CitationData[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState<number>(100);
  const [currentReflectionLogs, setCurrentReflectionLogs] = useState<ReflectionLogData[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentThoughts]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputQuery;
    if (!textToSend.trim() || isStreaming) return;

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const assistantMsgId = Math.random().toString(36).substring(2, 9);

    const newMessages: MessageItem[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: textToSend },
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true }
    ];

    setMessages(newMessages);
    if (!overrideText) setInputQuery('');
    setIsStreaming(true);
    setCurrentThoughts([]);
    setCurrentCitations([]);
    setCurrentConfidence(0);
    setCurrentReflectionLogs([]);

    abortControllerRef.current = new AbortController();

    try {
      await streamChatAPI(
        textToSend,
        // Token Chunk callback
        (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        // Thought Event callback
        (thought) => {
          setCurrentThoughts((prev) => [...prev, thought]);
        },
        // Citations callback
        (citations) => {
          setCurrentCitations(citations);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, citations } : msg
            )
          );
        },
        // Confidence callback
        (confidence) => {
          setCurrentConfidence(confidence);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, confidenceScore: confidence }
                : msg
            )
          );
        },
        // Reflection Logs callback
        (refLogs) => {
          setCurrentReflectionLogs(refLogs);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, reflectionLogs: refLogs }
                : msg
            )
          );
        },
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat streaming error:', err);
        addToast(err.message || 'Error communicating with assistant', 'error');
      }
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      addToast('Generation stopped by user.', 'info');
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--bg-surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Agentic RAG Session</span>
        </div>

        <button
          onClick={() => setShowTraceDrawer(!showTraceDrawer)}
          style={{
            background: showTraceDrawer ? 'var(--gradient-brand)' : 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Activity size={15} />
          <span>Agent Thought Trace</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', marginBottom: '16px' }}>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
            citations={msg.citations}
            confidenceScore={msg.confidenceScore}
          />
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Controls Bar */}
      {isStreaming && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            onClick={handleStop}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Square size={12} fill="currentColor" /> Stop Generation
          </button>
        </div>
      )}

      {!isStreaming && messages.length > 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            onClick={handleRegenerate}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--accent-cyan)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={12} /> Regenerate Response
          </button>
        </div>
      )}

      {/* Input Box Bar */}
      <div className="glass-panel" style={{ padding: '8px 12px 8px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--bg-surface-border)' }}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your knowledge base documents..."
          disabled={isStreaming}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.92rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isStreaming || !inputQuery.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: inputQuery.trim() ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#ffffff',
            cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: inputQuery.trim() ? 'var(--shadow-glow)' : 'none'
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Side Trace Panel Drawer */}
      <AgentTracePanel
        thoughts={currentThoughts}
        citations={currentCitations}
        confidenceScore={currentConfidence}
        reflectionLogs={currentReflectionLogs}
        isOpen={showTraceDrawer}
        onClose={() => setShowTraceDrawer(false)}
      />

    </div>
  );
};
