export interface AgentThoughtEvent {
  step: string;
  action: string;
  detail: string;
}

export interface CitationData {
  citation_id: number;
  source_filename: string;
  chunk_id: string;
  snippet: string;
  relevance_score: number;
}

export interface ReflectionLogData {
  step: string;
  is_sufficient: boolean;
  confidence_score: number;
  reason: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/documents/ingest`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to upload document' }));
    throw new Error(errorData.detail || 'Document ingestion failed');
  }

  return await response.json();
};

export const streamChatAPI = async (
  message: string,
  onToken: (token: string) => void,
  onThought: (thought: AgentThoughtEvent) => void,
  onCitations: (citations: CitationData[]) => void,
  onConfidence: (score: number) => void,
  onReflectionLogs: (logs: ReflectionLogData[]) => void,
  signal?: AbortSignal
) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, stream: true }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to initiate SSE stream');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  if (!reader) return;

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'token') {
            onToken(data.content);
          } else if (data.type === 'agent_thought') {
            onThought(data);
          } else if (data.type === 'citations') {
            onCitations(data.citations);
          } else if (data.type === 'confidence_score') {
            onConfidence(data.confidence_score);
          } else if (data.type === 'reflection_logs') {
            onReflectionLogs(data.reflection_logs);
          }
        } catch (e) {
          console.warn('Error parsing SSE event chunk:', e);
        }
      }
    }
  }
};
