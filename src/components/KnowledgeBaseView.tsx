import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  FileText,
  Trash2,
  Search,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface DocumentItem {
  id: string;
  name: string;
  chunkCount: number;
  tokenCount: number;
  sizeBytes: number;
  uploadedAt: string;
}

interface ChunkItem {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  page?: number;
}

interface KnowledgeBaseViewProps {
  onRefreshMetrics?: () => void;
  onTestInWorkspace?: (query: string, mode: 'Hybrid' | 'CAG' | 'RAG') => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onRefreshMetrics,
  onTestInWorkspace,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | 'all'>('all');

  // Custom Document Ingestion Form
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setChunks(data.chunks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadDirect = async (name: string, content: string, cSize = 500, cOverlap = 100) => {
    if (!name.trim() || !content.trim()) return;
    setIsUploading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          content: content.trim(),
          chunkSize: cSize,
          chunkOverlap: cOverlap,
        }),
      });

      if (res.ok) {
        setUploadSuccess(true);
        setDocName('');
        setDocContent('');
        await fetchDocuments();
        if (onRefreshMetrics) onRefreshMetrics();
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUploadDirect(docName, docContent, chunkSize, chunkOverlap);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDocName(file.name);
      setDocContent(content);
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDocuments();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredChunks = chunks.filter((c) => {
    const matchesDoc = selectedDocId === 'all' || c.docId === selectedDocId;
    const matchesSearch =
      !searchQuery ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.docName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDoc && matchesSearch;
  });

  const sampleDocs = [
    {
      title: 'CAG vs RAG Whitepaper',
      name: 'CAG_vs_RAG_Architecture.md',
      content: `# Cache-Augmented Generation (CAG) vs Retrieval-Augmented Generation (RAG)\n\n## Section 1: Memory Invariance\nCAG pre-computes semantic vector representations of recurring enterprise prompts. When cosine similarity exceeds 0.85, the answer is returned directly from cache memory in under 10ms with zero token cost.\n\n## Section 2: Hybrid Fallback\nWhen a prompt is missing from the cache, the hybrid controller delegates execution to RAG document retrieval, subsequently caching the response for subsequent inquiries.`,
    },
    {
      title: 'Python Decimal Precision Policy',
      name: 'Python_Decimal_Math_Standard.md',
      content: `# Python Decimal Precision and Financial Math Standard\n\n## Section 1: Standard Formulation\nAll financial and arithmetic calculations must use exact decimal formulation (SP - CP) to prevent binary floating-point round-off errors. Profit percentage is computed as (Profit / Cost Price) * 100 with two decimal places.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#22C55E]" />
              <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight">
                Vector Knowledge Base & Corpus Ingestion
              </h2>
            </div>
            <p className="text-sm text-[#A3B899] mt-1">
              Upload custom files, preview deterministic sliding-window chunk partitions, and test document-grounded RAG questions with verifiable citations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#070A08] text-[#22C55E] border border-[#2E7D32]/40">
              {documents.length} Docs
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#070A08] text-[#D9AD72] border border-[#D97706]/40">
              {chunks.length} Chunks
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Form + Document List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ingestion Form */}
        <div className="lg:col-span-5 bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#2E7D32]/25">
            <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#22C55E]" />
              Ingest Knowledge Document
            </h3>
            {uploadSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-[#22C55E] font-bold bg-[#064E3B]/50 px-2.5 py-0.5 rounded-md border border-[#10B981]/50">
                <CheckCircle2 className="w-3.5 h-3.5" /> Chunked & Indexed!
              </span>
            )}
          </div>

          {/* Quick Sample Document Ingest Options */}
          <div>
            <span className="text-xs font-bold text-[#A3B899] uppercase tracking-wider block mb-1.5">
              Quick Ingestion Presets:
            </span>
            <div className="flex flex-col gap-1.5">
              {sampleDocs.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDocName(s.name);
                    setDocContent(s.content);
                    handleUploadDirect(s.name, s.content);
                  }}
                  className="text-left px-3 py-2 rounded-xl bg-[#070A08] hover:bg-[#121B14] border border-[#2E7D32]/35 text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <span className="group-hover:text-[#22C55E]">{s.title}</span>
                  <span className="text-xs text-[#D9AD72] font-mono group-hover:text-[#FFFFFF]">
                    + One-Click Ingest
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-3 pt-2 border-t border-[#2E7D32]/25">
            <div>
              <label className="text-xs font-bold text-[#A3B899] block mb-1">
                Document Name / Title
              </label>
              <input
                type="text"
                required
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g. Distributed_Caching_Whitepaper.md"
                className="w-full px-3 py-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] placeholder-[#718471] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#A3B899] block mb-1">
                Raw Content (or upload TXT / MD file)
              </label>
              <textarea
                rows={5}
                required
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste document text or drop file here..."
                className="w-full px-3 py-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] placeholder-[#718471] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E] resize-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#070A08] hover:bg-[#121B14] border border-[#2E7D32]/35 text-xs font-semibold text-[#A3B899] hover:text-[#FFFFFF] cursor-pointer transition-colors">
                <FileText className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Upload Local File</span>
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.json,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={isUploading || !docName.trim() || !docContent.trim()}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isUploading || !docName.trim() || !docContent.trim()
                    ? 'bg-[#182019] text-[#556355] cursor-not-allowed border border-[#2E7D32]/20'
                    : 'bg-[#22C55E] hover:bg-[#16A34A] text-[#030503] font-bold shadow-md shadow-[#22C55E]/30'
                }`}
              >
                {isUploading ? 'Chunking...' : 'Partition & Index'}
              </button>
            </div>

            {/* Sliding-window parameters */}
            <div className="pt-2 border-t border-[#2E7D32]/25 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-xs font-bold text-[#A3B899] block">Chunk Size (chars)</span>
                <input
                  type="number"
                  min="200"
                  max="2000"
                  step="50"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value) || 500)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-[#A3B899] block">Overlap Margin (chars)</span>
                <input
                  type="number"
                  min="0"
                  max="400"
                  step="25"
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 100)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] font-mono text-xs"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Ingested Documents List */}
        <div className="lg:col-span-7 bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 flex flex-col justify-between backdrop-blur-md">
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <BookOpen className="w-4 h-4 text-[#22C55E]" />
              Ingested Knowledge Documents ({documents.length})
            </h3>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-[#0E1510] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-xs sm:text-sm text-[#A3B899]">
                No documents uploaded yet. Use the ingestion form on the left or the one-click presets.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      selectedDocId === doc.id
                        ? 'bg-[#0E1B11] border-[#22C55E] shadow-sm'
                        : 'bg-[#070A08] border-[#2E7D32]/35 hover:border-[#22C55E]'
                    }`}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedDocId(selectedDocId === doc.id ? 'all' : doc.id)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#22C55E]" />
                        <span className="text-xs sm:text-sm font-bold text-[#FFFFFF]">{doc.name}</span>
                        {selectedDocId === doc.id && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#22C55E] text-[#030503]">
                            Filtered
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#A3B899] mt-1 font-mono">
                        <span>{doc.chunkCount} chunks</span>
                        <span>•</span>
                        <span>{doc.tokenCount} tokens</span>
                        <span>•</span>
                        <span>{(doc.sizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onTestInWorkspace && (
                        <button
                          type="button"
                          onClick={() =>
                            onTestInWorkspace(
                              `What are the core technical points in ${doc.name}?`,
                              'RAG'
                            )
                          }
                          className="flex items-center gap-1 text-xs font-semibold text-[#A3B899] hover:text-[#FFFFFF] bg-[#0E1510] hover:bg-[#16221A] px-2.5 py-1 rounded-lg border border-[#2E7D32]/35 transition-colors cursor-pointer"
                          title="Ask question about this doc in Workspace"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>Test in RAG</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-xl text-[#A3B899] hover:bg-rose-900/40 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete document and remove all its vector chunks"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#2E7D32]/25 text-xs text-[#A3B899] flex items-center justify-between">
            <span>Click any document above to filter vector chunks.</span>
            {selectedDocId !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedDocId('all')}
                className="text-xs font-bold text-[#22C55E] hover:underline cursor-pointer"
              >
                Reset to Show All Chunks
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chunk Inspector Table */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#22C55E]" />
              Vector Chunk Inspector ({filteredChunks.length} chunks)
            </h3>
            <p className="text-xs sm:text-sm text-[#A3B899] mt-0.5">
              Inspect partitioned text segments, vector representations, and token lengths ready for RAG cosine retrieval.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718471]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chunk contents..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] placeholder-[#718471] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredChunks.map((chunk) => (
            <div
              key={chunk.id}
              className="p-4 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 space-y-2 hover:border-[#22C55E] transition-colors shadow-inner"
            >
              <div className="flex items-center justify-between text-xs border-b border-[#2E7D32]/25 pb-2">
                <span className="font-bold text-[#FFFFFF] truncate max-w-[200px]">
                  {chunk.docName}
                </span>
                <div className="flex items-center gap-2 font-mono text-xs text-[#A3B899]">
                  <span>Chunk #{chunk.chunkIndex}</span>
                  <span>•</span>
                  <span>{chunk.tokenCount} tokens</span>
                  <span>•</span>
                  <span>Page {chunk.page || 1}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#F7FAF6] leading-relaxed line-clamp-4 font-mono bg-[#070A08] p-2.5 rounded-xl border border-[#2E7D32]/25">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
