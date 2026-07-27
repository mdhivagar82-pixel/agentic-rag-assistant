import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { uploadDocument } from '../services/apiService';
import { useToast } from '../context/ToastContext';
import { ProgressBar } from './ProgressBar';

interface FileUploaderProps {
  onSuccess?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();

  const handleFile = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(25);
      
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 150);

      await uploadDocument(file);

      clearInterval(interval);
      setProgress(100);
      addToast(`Document '${file.name}' successfully parsed and indexed!`, 'success');
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Upload error:', err);
      addToast(err.message || 'Failed to upload document.', 'error');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 800);
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
