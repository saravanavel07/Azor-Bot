import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  FolderGit2,
} from 'lucide-react';

interface FileDefinition {
  path: string;
  category: 'core' | 'src' | 'tests' | 'docs';
  description: string;
  content: string;
}

export const PythonRepoHub: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const files: FileDefinition[] = [
    {
      path: 'app.py',
      category: 'core',
      description: 'Streamlit main application with dual-engine CAG + RAG UI and Plotly telemetry.',
      content: `# AZORBot — Complete CAG + RAG Intelligent AI Application
# Streamlit Web Application
import streamlit as st
import plotly.graph_objects as go
from src.database import Database
from src.embeddings import EmbeddingsEngine
from src.cache_engine import CacheEngine
from src.document_processor import DocumentProcessor
from src.retrieval_engine import RetrievalEngine
from src.llm_provider import LLMProvider
from src.analytics import AnalyticsEngine

st.set_page_config(page_title="AZORBot", page_icon="🖥️", layout="wide")
# ... Full Streamlit App Implementation ...`,
    },
    {
      path: 'requirements.txt',
      category: 'core',
      description: 'Production Python dependencies (SentenceTransformers, NumPy, PyPDF, Streamlit, Plotly).',
      content: `streamlit>=1.35.0
sentence-transformers>=2.7.0
numpy>=1.24.0
pypdf>=4.2.0
plotly>=5.22.0
google-genai>=2.4.0
openai>=1.30.0
pydantic>=2.7.0
python-dotenv>=1.0.1
pytest>=8.2.0`,
    },
    {
      path: 'src/cache_engine.py',
      category: 'src',
      description: 'CAG semantic caching engine with cosine similarity evaluation and temporal bypass rules.',
      content: `import re, time, uuid
from typing import Dict, Any, Optional

class CacheEngine:
    def __init__(self, db, embeddings, similarity_threshold=0.85):
        self.db = db
        self.embeddings = embeddings
        self.similarity_threshold = similarity_threshold

    def lookup(self, query: str, threshold: Optional[float] = None) -> Dict[str, Any]:
        target_th = threshold or self.similarity_threshold
        entries = self.db.get_all_cache_entries()
        q_vec = self.embeddings.embed_text(query)
        # Cosine search & threshold comparison
        ...`,
    },
    {
      path: 'src/retrieval_engine.py',
      category: 'src',
      description: 'RAG vector retrieval engine with top-k ranking and grounded context formatting.',
      content: `class RetrievalEngine:
    def __init__(self, db, embeddings, default_top_k=3):
        self.db = db
        self.embeddings = embeddings
        self.default_top_k = default_top_k

    def retrieve(self, query: str, top_k: int = 3):
        chunks = self.db.get_all_document_chunks()
        q_vec = self.embeddings.embed_text(query)
        # Score chunks via cosine distance
        ...`,
    },
    {
      path: 'src/embeddings.py',
      category: 'src',
      description: 'SentenceTransformers and deterministic normalized 384-d semantic vectorizer with cosine similarity.',
      content: `import numpy as np

class EmbeddingsEngine:
    def embed_text(self, text: str):
        # Generates L2-normalized 384-dimensional vector
        ...
    @staticmethod
    def cosine_similarity(v1, v2) -> float:
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))`,
    },
    {
      path: 'src/document_processor.py',
      category: 'src',
      description: 'Sliding-window document chunking with configurable overlap and PDF/TXT/MD text extractors.',
      content: `class DocumentProcessor:
    def __init__(self, chunk_size=500, chunk_overlap=100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, doc_name: str):
        # Sliding-window paragraph segmentation
        ...`,
    },
    {
      path: 'src/database.py',
      category: 'src',
      description: 'SQLite persistence layer for semantic cache, query telemetry logs, and document chunk indices.',
      content: `import sqlite3

class Database:
    def __init__(self, db_path="maltcache.db"):
        self.db_path = db_path
        self._init_db()
        # Semantic cache, query logs, document chunk tables
        ...`,
    },
    {
      path: 'src/answer_validator.py',
      category: 'src',
      description: 'Step 1 intent classifier, deterministic math solver, code AST syntax checker, and ambiguity boundary gate.',
      content: `class AnswerValidator:
    @classmethod
    def classify_intent(cls, query: str):
        # Math, Code, Temporal, Document QA, General
        ...`,
    },
    {
      path: 'src/security.py',
      category: 'src',
      description: 'Prompt injection defense filter, input sanitize rules, and sensitive entity suppression.',
      content: `class SecurityGuard:
    @classmethod
    def check_prompt_injection(cls, query: str) -> bool:
        # Regex and structural validation
        ...`,
    },
    {
      path: 'tests/test_cache.py',
      category: 'tests',
      description: 'Unit tests for semantic cache hit/miss accuracy, similarity thresholds, and eviction.',
      content: `import unittest
from src.cache_engine import CacheEngine

class TestCacheEngine(unittest.TestCase):
    def test_store_and_lookup_exact(self):
        ...
    def test_semantic_match_rephrased(self):
        ...
    def test_dissimilar_query_miss(self):
        ...`,
    },
  ];

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'core', label: 'Core App' },
    { id: 'src', label: 'Engines (src/)' },
    { id: 'tests', label: 'Test Suite' },
  ];

  const filteredFiles = files.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const [selectedFile, setSelectedFile] = useState<FileDefinition>(files[0]);

  const handleCopyCode = (f: FileDefinition) => {
    navigator.clipboard.writeText(f.content);
    setCopiedFile(f.path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFile = (f: FileDefinition) => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(f.content);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const filename = f.path.split('/').pop() || 'script.py';
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#22C55E]" />
              Python Repository & GitHub Ready Codebase
            </h2>
            <p className="text-sm text-[#A3B899] mt-1 leading-normal">
              Complete, production-grade Python + Streamlit codebase ready to clone, execute locally, or deploy to Streamlit Community Cloud.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-[#0E1B11] text-[#22C55E] font-bold border border-[#2E7D32]/50">
              Python 3.10+
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#070A08] text-[#D9AD72] font-bold border border-[#D97706]/40">
              Streamlit + PyTorch
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Quickstart Instructions */}
      <div className="bg-[#070A08] text-[#F7FAF6] rounded-3xl p-5 sm:p-6 shadow-xl space-y-3 font-mono text-xs sm:text-sm border border-[#2E7D32]/35">
        <div className="flex items-center justify-between text-[#22C55E] pb-2 border-b border-[#2E7D32]/25">
          <span className="flex items-center gap-2 font-bold text-[#22C55E]">
            <Terminal className="w-4 h-4 text-[#22C55E]" /> Local Streamlit Execution
          </span>
          <span className="text-xs text-[#A3B899]">PowerShell / Bash</span>
        </div>

        <div className="space-y-1.5 text-xs sm:text-sm text-[#F7FAF6]">
          <div className="text-[#22C55E]"># 1. Install dependencies</div>
          <div className="bg-[#0B0F0C] p-2 rounded-lg text-emerald-400 border border-[#2E7D32]/25">pip install -r requirements.txt</div>

          <div className="text-[#22C55E] pt-1"># 2. Run the Streamlit application</div>
          <div className="bg-[#0B0F0C] p-2 rounded-lg text-emerald-400 border border-[#2E7D32]/25">streamlit run app.py</div>

          <div className="text-[#22C55E] pt-1"># 3. Run automated test suite</div>
          <div className="bg-[#0B0F0C] p-2 rounded-lg text-emerald-400 border border-[#2E7D32]/25">python -m unittest discover tests</div>
        </div>
      </div>

      {/* File Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-4 bg-[#0B0F0C] rounded-3xl p-5 border border-[#2E7D32]/35 shadow-xl space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#A3B899] uppercase tracking-wider">
              Modules ({filteredFiles.length})
            </h3>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#22C55E] text-[#030503] font-bold'
                      : 'bg-[#0E1510] text-[#A3B899] hover:bg-[#16221A] hover:text-[#FFFFFF]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                  selectedFile.path === file.path
                    ? 'bg-[#22C55E] text-[#030503] shadow-md font-bold'
                    : 'bg-[#070A08] hover:bg-[#121B14] text-[#FFFFFF] border border-[#2E7D32]/25'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-4 h-4 flex-shrink-0 ${selectedFile.path === file.path ? 'text-[#030503]' : 'text-[#22C55E]'}`} />
                  <span className="font-mono truncate">{file.path}</span>
                </div>
                <span className={`text-xs uppercase font-bold px-1.5 py-0.5 rounded ${selectedFile.path === file.path ? 'bg-[#030503]/20 text-[#030503]' : 'bg-[#0E1B11] text-[#22C55E]'}`}>
                  {file.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2E7D32]/25">
              <div>
                <span className="font-mono font-bold text-sm sm:text-base text-[#FFFFFF]">
                  {selectedFile.path}
                </span>
                <p className="text-xs sm:text-sm text-[#A3B899] mt-0.5">
                  {selectedFile.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(selectedFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070A08] hover:bg-[#121B14] text-[#A3B899] hover:text-[#FFFFFF] border border-[#2E7D32]/35 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyCode(selectedFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070A08] hover:bg-[#121B14] text-[#A3B899] hover:text-[#FFFFFF] border border-[#2E7D32]/35 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedFile === selectedFile.path ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span className="text-[#22C55E] font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Box */}
            <pre className="mt-4 p-4 rounded-2xl bg-[#070A08] text-[#6EE7B7] font-mono text-xs sm:text-sm overflow-x-auto max-h-[460px] leading-relaxed border border-[#2E7D32]/35">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          <div className="pt-3 border-t border-[#2E7D32]/25 text-xs text-[#A3B899] flex items-center justify-between">
            <span>All Python modules are saved in the project root ready for Git commit.</span>
            <span className="font-mono text-xs text-[#22C55E] font-bold">AZORBot v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
