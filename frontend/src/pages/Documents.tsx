import React, { useState } from 'react';
import { FileText, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { useToast } from '../context/ToastContext';

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  status: 'indexed' | 'processing';
  chunks: number;
}

export const Documents: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 'doc_1', name: 'Enterprise_Architecture_Overview.pdf', size: '2.4 MB', type: 'PDF', uploadedAt: '2026-07-26', status: 'indexed', chunks: 142 },
    { id: 'doc_2', name: 'Agentic_RAG_Specification.docx', size: '1.1 MB', type: 'DOCX', uploadedAt: '2026-07-26', status: 'indexed', chunks: 86 },
    { id: 'doc_3', name: 'API_Gateway_Guide.md', size: '450 KB', type: 'Markdown', uploadedAt: '2026-07-27', status: 'indexed', chunks: 34 },
  ]);

  const { addToast } = useToast();

  const handleDelete = (id: string, name: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    addToast(`Document '${name}' removed from knowledge base index.`, 'info');
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
          Knowledge Base <span className="gradient-text">Documents</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Manage your uploaded files indexed into the Qdrant vector database and BM25 sparse keyword store.
        </p>
      </div>

      {/* File Uploader */}
      <FileUploader onSuccess={() => {
        const newDoc: DocumentItem = {
          id: `doc_${Date.now()}`,
          name: 'Newly_Uploaded_Knowledge_Doc.pdf',
          size: '1.8 MB',
          type: 'PDF',
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'indexed',
          chunks: 95
        };
        setDocuments((prev) => [newDoc, ...prev]);
      }} />

      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '0.9rem', outline: 'none', width: '100%' }}
          />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Showing {filteredDocs.length} of {documents.length} files
        </span>
      </div>

      {/* Documents Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid var(--bg-surface-border)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '14px 20px' }}>Document Name</th>
              <th style={{ padding: '14px 16px' }}>Format</th>
              <th style={{ padding: '14px 16px' }}>Size</th>
              <th style={{ padding: '14px 16px' }}>Indexed Chunks</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--bg-surface-border)' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="var(--accent-cyan)" />
                    <span>{doc.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{doc.type}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{doc.size}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 600 }}>{doc.chunks} chunks</td>
                <td style={{ padding: '14px 16px' }}>
                  <span className="badge badge-online" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    <CheckCircle2 size={12} /> {doc.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    title="Delete Document"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
