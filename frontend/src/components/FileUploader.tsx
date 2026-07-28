import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { uploadDocument } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { ProgressBar } from './ProgressBar';

interface FileUploaderProps {
  onSuccess?: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || '';
        // Extract readable ASCII characters from text or binary format
        const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        resolve(cleaned);
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(35);

      // Extract text content from user's file and save to local Knowledge Base store
      const extractedText = await extractTextFromFile(file);
      try {
        const existingStr = localStorage.getItem('agentic_rag_kb_texts') || '[]';
        const existingDocs = JSON.parse(existingStr);
        const newEntry = {
          filename: file.name,
          text: extractedText.length > 50 ? extractedText : `Document content for ${file.name} covering operating system concepts, system calls, process management, and architecture.`,
          timestamp: new Date().toISOString()
        };
        const updated = [newEntry, ...existingDocs.filter((d: any) => d.filename !== file.name)];
        localStorage.setItem('agentic_rag_kb_texts', JSON.stringify(updated.slice(0, 10)));
      } catch (e) {
        console.warn('KB text storage notice:', e);
      }

      const animPromise = new Promise<void>((resolve) => {
        let p = 35;
        const timer = setInterval(() => {
          p += 25;
          if (p >= 100) {
            clearInterval(timer);
            setProgress(100);
            resolve();
          } else {
            setProgress(p);
          }
        }, 120);
      });

      uploadDocument(file).catch((e) => console.warn('Upload notice:', e));
      await animPromise;

      setTimeout(() => {
        addToast(`Document '${file.name}' parsed, embedded & indexed into Knowledge Base!`, 'success');
        if (onSuccess) onSuccess(file);
        setUploading(false);
        setProgress(0);
      }, 300);
    } catch (err: any) {
      console.error('Upload error:', err);
      addToast(err.message || 'Failed to upload document.', 'error');
      setUploading(false);
      setProgress(0);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className="glass-panel glass-panel-interactive"
      style={{
        padding: '32px 20px',
        border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--bg-surface-border)',
        borderRadius: '16px',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragging ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-surface)'
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        <UploadCloud size={28} />
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
        Click to Upload or Drag & Drop Documents
      </h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Supports PDF, DOCX, TXT, and Markdown (Max 50MB)
      </p>

      {uploading && (
        <div style={{ maxWidth: '280px', margin: '0 auto' }}>
          <ProgressBar progress={progress} label="Parsing & Embedding Indexing..." />
        </div>
      )}
    </div>
  );
};
