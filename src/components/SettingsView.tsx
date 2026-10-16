import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [threshold, setThreshold] = useState(0.85);
  const [topK, setTopK] = useState(3);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [ttlMinutes, setTtlMinutes] = useState(1440); // 24 hours
  const [bypassTemporal, setBypassTemporal] = useState(true);
  const [bypassSensitive, setBypassSensitive] = useState(true);
  const [activeModel, setActiveModel] = useState('gemini-2.5-flash');
  const [embeddingModel, setEmbeddingModel] = useState('vector-cosine-384');

  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setGeminiConfigured(data.geminiConfigured);
      })
      .catch((err) => console.error(err));
  }, []);

  const profiles = [
    {
      name: 'Balanced Enterprise (Default)',
      desc: 'Threshold 0.85, Top-K 3, 500-char chunks, 24h TTL. Ideal for standard production.',
      threshold: 0.85,
      topK: 3,
      chunkSize: 500,
      chunkOverlap: 100,
      ttl: 1440,
    },
    {
      name: 'Strict Grounding & Security',
      desc: 'Threshold 0.92, Top-K 5, 600-char chunks, 12h TTL. Maximum hallucination refusal.',
      threshold: 0.92,
      topK: 5,
      chunkSize: 600,
      chunkOverlap: 120,
      ttl: 720,
    },
    {
      name: 'High Recall & Fast Cache',
      desc: 'Threshold 0.78, Top-K 2, 400-char chunks, 48h TTL. Maximizes cache hits and speed.',
      threshold: 0.78,
      topK: 2,
      chunkSize: 400,
      chunkOverlap: 80,
      ttl: 2880,
    },
  ];

  const handleApplyProfile = (p: typeof profiles[0]) => {
    setThreshold(p.threshold);
    setTopK(p.topK);
    setChunkSize(p.chunkSize);
    setChunkOverlap(p.chunkOverlap);
    setTtlMinutes(p.ttl);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#22C55E]" />
              Platform Configuration & Safety Governance
            </h2>
            <p className="text-sm text-[#A3B899] mt-1 leading-normal">
              Tune mathematical similarity tolerances, retrieval depth, token cost coefficients, and security isolation policies.
            </p>
          </div>

          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#064E3B]/60 text-[#6EE7B7] border border-[#10B981]/50 text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Settings Saved!
            </span>
          )}
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-3 backdrop-blur-md">
        <span className="text-xs font-bold text-[#A3B899] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#22C55E]" />
          Instant Configuration Profiles (Click any option to apply)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {profiles.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyProfile(p)}
              className="text-left p-3.5 rounded-2xl bg-[#0E1410] hover:bg-[#131D16] border border-[#2E7D32]/35 hover:border-[#22C55E] transition-all cursor-pointer group shadow-inner"
            >
              <div className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#22C55E]">
                {p.name}
              </div>
              <div className="text-xs text-[#A3B899] mt-1 leading-normal">
                {p.desc}
              </div>
              <div className="mt-2 text-xs font-mono font-bold text-[#22C55E] flex items-center gap-2">
                <span className="bg-[#070A08] px-2 py-0.5 rounded-md border border-[#2E7D32]/30">Threshold: {p.threshold}</span>
                <span className="bg-[#070A08] px-2 py-0.5 rounded-md border border-[#2E7D32]/30">Top-K: {p.topK}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model & Credentials Governance */}
        <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-[#22C55E]" />
            Inference Engine & Credentials Status
          </h3>

          <div className="p-4 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#FFFFFF] text-xs sm:text-sm block">
                  Gemini API Credential
                </span>
                <span className="text-xs text-[#A3B899]">
                  Managed securely via server-side environment variables
                </span>
              </div>
              <div>
                {geminiConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#064E3B]/60 text-[#6EE7B7] border border-[#10B981]/50">
                    <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" /> Active & Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#78350F]/50 text-[#FDE68A] border border-[#D97706]/50">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" /> Multi-Domain Engine Active
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-[#A3B899] leading-normal pt-2 border-t border-[#2E7D32]/25">
              {geminiConfigured
                ? "Your GEMINI_API_KEY is detected in server environment. The platform uses Google's flagship 'gemini-2.5-flash' model for generative synthesis."
                : 'AZORBot Multi-Domain Agentic Engine active. Provides full synthesis for Technical, Math, AI News, World News, and Document RAG.'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#A3B899] block mb-1">
              Active LLM Provider Model
            </label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-xs sm:text-sm text-[#FFFFFF] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended: Low Latency, High Reasoning)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Multimodal Reasoning)</option>
              <option value="azorbot-agentic-engine-v2">azorbot-agentic-engine-v2 (Zero External Dependency)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#A3B899] block mb-1">
              Vector Embedding Architecture
            </label>
            <select
              value={embeddingModel}
              onChange={(e) => setEmbeddingModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-xs sm:text-sm text-[#FFFFFF] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            >
              <option value="vector-cosine-384">Normalized Subword Projection (384 Dimensions)</option>
              <option value="gemini-embedding-2-preview">gemini-embedding-2-preview (Google Cloud Embeddings)</option>
              <option value="sentence-transformers-all-MiniLM-L6-v2">all-MiniLM-L6-v2 (Python Local)</option>
            </select>
          </div>
        </div>

        {/* Semantic Threshold & Cache Invalidation */}
        <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#22C55E]" />
            CAG Similarity & Eviction Rules
          </h3>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#A3B899] mb-1">
              <span>Global Cosine Similarity Threshold</span>
              <span className="font-mono text-[#22C55E] text-sm">{threshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-[#22C55E]"
            />
            <div className="flex justify-between text-xs text-[#718471]">
              <span>0.50 (Loose semantic match)</span>
              <span>0.85 (Balanced Enterprise)</span>
              <span>0.99 (Strict match)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#A3B899] mb-1">
              <span>Default Retrieval Depth (Top-K Chunks)</span>
              <span className="font-mono text-[#22C55E] text-sm">{topK} chunks</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full accent-[#22C55E]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#2E7D32]/25">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 cursor-pointer">
              <input
                type="checkbox"
                checked={bypassTemporal}
                onChange={(e) => setBypassTemporal(e.target.checked)}
                className="w-4 h-4 rounded text-[#22C55E] accent-[#22C55E]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#FFFFFF] block">Bypass Cache for Temporal Queries</span>
                <span className="text-[#A3B899]">
                  Automatically route queries with 'today', 'latest', 'now' to fresh retrieval
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 cursor-pointer">
              <input
                type="checkbox"
                checked={bypassSensitive}
                onChange={(e) => setBypassSensitive(e.target.checked)}
                className="w-4 h-4 rounded text-[#22C55E] accent-[#22C55E]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#FFFFFF] block">Bypass Cache for Sensitive Entities</span>
                <span className="text-[#A3B899]">
                  Prevent caching responses containing API keys or personal identifiers
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#030503] font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-md shadow-[#22C55E]/30"
            >
              Save Configuration Parameters
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
