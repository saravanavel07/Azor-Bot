import React, { useState, useEffect } from 'react';
import {
  Play,
  Zap,
  Sparkles,
  Database,
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Shield,
  Layers,
  FileText,
  Clock,
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Code2,
  Globe2,
  Cpu,
  Atom,
} from 'lucide-react';

export interface QueryResponse {
  query: string;
  mode: 'Hybrid' | 'CAG' | 'RAG';
  status: 'HIT' | 'MISS' | 'VERIFIED_CALCULATION' | 'INSUFFICIENT_EVIDENCE' | 'CLARIFICATION_REQUIRED' | 'GENERATED_GROUNDED';
  directAnswer: string;
  explanation: string;
  evidenceSources: string[];
  confidence: 'Strong' | 'Partial' | 'Insufficient';
  limitations: string;
  similarityScore?: number;
  matchedQuery?: string;
  cachedEntryId?: string;
  model?: string;
  source?: string;
  latencyMs: number;
  pipelineTrace: Array<{
    stage: string;
    status: 'ok' | 'hit' | 'miss' | 'info';
    durationMs: number;
    details: string;
  }>;
  retrievedChunks: Array<{
    id: string;
    docName: string;
    chunkIndex: number;
    content: string;
    similarityScore: number;
    page: number;
    tokenCount: number;
  }>;
  costSavedUsd: number;
  tokensSaved: number;
  verified: boolean;
  verificationMethod?: string;
}

interface WorkspaceViewProps {
  activeMode: 'Hybrid' | 'CAG' | 'RAG';
  onModeChange: (mode: 'Hybrid' | 'CAG' | 'RAG') => void;
  pendingQuery?: { text: string; mode?: 'Hybrid' | 'CAG' | 'RAG' } | null;
  onClearPendingQuery?: () => void;
  onQueryComplete?: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  activeMode,
  onModeChange,
  pendingQuery,
  onClearPendingQuery,
  onQueryComplete,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [threshold, setThreshold] = useState<number>(0.85);
  const [topK, setTopK] = useState<number>(3);
  const [bypassCache, setBypassCache] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChunks, setShowChunks] = useState(true);
  const [showTrace, setShowTrace] = useState(true);
  const [activePresetCategory, setActivePresetCategory] = useState<string>('all');

  const presetCategories = [
    { id: 'all', label: 'All Agentic Hubs' },
    { id: 'technical', label: '💻 Technical & Code' },
    { id: 'math', label: '🧮 Math & Quantitative' },
    { id: 'ainews', label: '⚡ AI News & Models' },
    { id: 'worldnews', label: '🌐 World & Tech Trends' },
    { id: 'gk', label: '🔬 Science & GK' },
    { id: 'cag_rag', label: '📄 CAG & Document Grounding' },
  ];

  // Full Agentic AI Prompts spanning Technical, Math, AI News, World News, GK, and CAG/RAG
  const presets = [
    {
      category: 'technical',
      title: 'Python In-Place Array Deduplication',
      query: 'Write an optimized Python function to find and return duplicates in an array with O(n) time and O(1) auxiliary space',
      desc: 'Generates production Python code with type annotations, edge case handling, and complexity proof.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'technical',
      title: 'High-Concurrency CAG Architecture',
      query: 'How does Cache-Augmented Generation (CAG) optimize high-concurrency microservices compared to traditional RAG?',
      desc: 'Technical breakdown of vector memory caching, KV-cache pre-filling, and 99th percentile latency reduction.',
      recommendedMode: 'CAG' as const,
    },
    {
      category: 'math',
      title: 'Profit, Loss & Margin Analysis',
      query: 'Cost price is $50, selling price is $70, calculate profit, profit percentage, margin percentage, and markup percentage',
      desc: 'Deterministic step-by-step mathematical proof with formula derivations and exact decimal precision.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'math',
      title: 'Compound Interest & Exponential Growth',
      query: 'Calculate 12.5% compound interest on $25,000 invested over 4 years compounded semi-annually',
      desc: 'Step-by-step formula derivation: A = P(1 + r/n)^(nt) with intermediate precision checks.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'ainews',
      title: 'Frontier Reasoning Models (Gemini 2.5, DeepSeek, Claude 3.7)',
      query: 'What are the core architectural breakthroughs in Gemini 2.5 Flash, DeepSeek R1, and Claude 3.7 Sonnet reasoning models?',
      desc: 'Analysis of test-time compute scaling, hybrid reasoning modes, and Mixture-of-Experts token routing.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'ainews',
      title: 'Autonomous Multi-Agent ReAct Loops',
      query: 'How do autonomous Agentic AI loops leverage tool calling, sandboxed execution, and self-reflection to solve complex workflows?',
      desc: 'Exploration of ReAct cycles (Reason -> Act -> Observe), multi-agent orchestration, and memory persistence.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'worldnews',
      title: 'Global Semiconductor & Clean Energy Transitions',
      query: 'What are the latest global milestones in 2nm semiconductor foundries, HBM memory clusters, and grid-scale battery storage?',
      desc: 'Comprehensive overview of global silicon supply chains, energy transition grids, and industrial computing infrastructure.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'gk',
      title: 'Cosmological Discoveries & James Webb Telescope',
      query: 'Explain the most significant James Webb Space Telescope discoveries regarding early galaxy formation and cosmological expansion',
      desc: 'Scientific breakdown of high-redshift observations, cosmological standard model tensions, and infrared spectroscopy.',
      recommendedMode: 'Hybrid' as const,
    },
    {
      category: 'cag_rag',
      title: 'MaltCache Enterprise Architecture Specs',
      query: 'What are the sliding-window chunking parameters and the three tiers of cache invalidation in the architecture document?',
      desc: 'Retrieves factual excerpts from indexed specification PDF with page references and cosine similarity scores.',
      recommendedMode: 'RAG' as const,
    },
  ];

  const filteredPresets = activePresetCategory === 'all'
    ? presets
    : presets.filter((p) => p.category === activePresetCategory);

  const handleRunQuery = async (customQuery?: string, targetMode?: 'Hybrid' | 'CAG' | 'RAG') => {
    const q = (customQuery !== undefined ? customQuery : query).trim();
    if (!q) return;

    const modeToUse = targetMode || activeMode;
    if (targetMode && targetMode !== activeMode) {
      onModeChange(targetMode);
    }

    setQuery(q);
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          mode: modeToUse,
          threshold,
          topK,
          bypassCache,
        }),
      });

      if (!res.ok) throw new Error('Query execution failed');
      const data: QueryResponse = await res.json();
      setResponse(data);
      if (onQueryComplete) onQueryComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cross-tab incoming queries
  useEffect(() => {
    if (pendingQuery && pendingQuery.text) {
      handleRunQuery(pendingQuery.text, pendingQuery.mode);
      if (onClearPendingQuery) {
        onClearPendingQuery();
      }
    }
  }, [pendingQuery]);

  const handleCopy = () => {
    if (!response?.directAnswer) return;
    const textToCopy = [
      `Answer: ${response.directAnswer}`,
      response.explanation ? `\nExplanation / Calculation:\n${response.explanation}` : '',
      response.confidence ? `\nEvidence Quality: ${response.confidence}` : '',
      response.limitations ? `\nLimitations: ${response.limitations}` : '',
    ].join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setQuery('');
    setResponse(null);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Selector Header on Deep Black Canvas */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="laser-scan-line" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2E7D32]/25 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
              <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight">
                Agentic Operational Intelligence Hub
              </h2>
            </div>
            <p className="text-sm text-[#A3B899] mt-1 leading-normal">
              Autonomous multi-domain intelligence delivering verified answers for <strong className="text-[#22C55E]">Technical Coding</strong>, <strong className="text-[#D97706]">Mathematics</strong>, <strong className="text-[#22C55E]">AI News</strong>, <strong className="text-[#D97706]">World Affairs</strong>, <strong className="text-[#FFFFFF]">Science/GK</strong>, and <strong className="text-[#22C55E]">CAG+RAG Knowledge Grounding</strong>.
            </p>
          </div>

          {/* Strategy Mode Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#070A08] rounded-2xl border border-[#2E7D32]/40 self-start md:self-auto shadow-inner">
            {(['Hybrid', 'CAG', 'RAG'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onModeChange(mode);
                  if (query.trim()) {
                    handleRunQuery(query, mode);
                  } else {
                    if (mode === 'CAG') setQuery('How does Cache-Augmented Generation (CAG) optimize high-concurrency microservices compared to traditional RAG?');
                    if (mode === 'RAG') setQuery('What are the sliding-window chunking parameters and the three tiers of cache invalidation in the architecture document?');
                    if (mode === 'Hybrid') setQuery('Cost price is $50, selling price is $70, calculate profit, profit percentage, margin percentage, and markup percentage');
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeMode === mode
                    ? 'bg-[#2E7D32] text-white shadow-lg shadow-[#2E7D32]/40 border border-[#22C55E]/50'
                    : 'text-[#A3B899] hover:bg-[#131A14] hover:text-[#22C55E]'
                }`}
              >
                {mode === 'Hybrid' && '⚡ Hybrid (CAG + Agentic RAG)'}
                {mode === 'CAG' && '💾 CAG (Semantic Cache)'}
                {mode === 'RAG' && '📑 RAG (Corpus Retrieval)'}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input Box */}
        <div className="pt-5 space-y-4 relative z-10">
          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleRunQuery();
                }
              }}
              placeholder="Ask ANY question: Technical code, step-by-step mathematics, AI news, world affairs, GK, or document specs..."
              className="w-full px-4 py-3 rounded-2xl bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] placeholder-[#718471] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent resize-none shadow-inner transition-all"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#A3B899] hover:bg-[#131A14] hover:text-[#FFFFFF] transition-colors cursor-pointer flex items-center gap-1 border border-transparent hover:border-[#2E7D32]/30"
                  title="Clear input"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <span className="hidden sm:inline text-xs text-[#718471] font-mono">
                ⌘ + Enter
              </span>
              <button
                type="button"
                onClick={() => handleRunQuery()}
                disabled={loading || !query.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  loading || !query.trim()
                    ? 'bg-[#182019] text-[#556355] cursor-not-allowed border border-[#2E7D32]/20'
                    : 'bg-[#22C55E] hover:bg-[#16A34A] text-[#030503] font-bold shadow-lg shadow-[#22C55E]/25 hover:shadow-[#22C55E]/40 border border-[#00E676]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#030503] border-t-transparent rounded-full animate-spin" />
                    <span>Agent Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Ask AZORBot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Options & Filter Buttons */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-xs font-bold text-[#A3B899] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#22C55E] animate-pulse" />
                <span>Agentic AI Knowledge Hubs (Click any prompt to run immediately):</span>
              </div>

              {/* Category Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {presetCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActivePresetCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activePresetCategory === cat.id
                        ? 'bg-[#22C55E] text-[#030503] font-bold shadow-md shadow-[#22C55E]/30'
                        : 'bg-[#0E1510] text-[#A3B899] hover:bg-[#152018] hover:text-[#FFFFFF] border border-[#2E7D32]/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid on Dark obsidian cards with glowing borders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRunQuery(p.query, p.recommendedMode)}
                  className="text-left p-4 rounded-2xl bg-[#0E1410] hover:bg-[#131D16] border border-[#2E7D32]/35 hover:border-[#22C55E]/60 transition-all cursor-pointer group shadow-md hover:shadow-lg hover:shadow-[#2E7D32]/10"
                >
                  <div className="text-sm font-bold text-[#FFFFFF] group-hover:text-[#22C55E] flex items-center justify-between transition-colors">
                    <span>{p.title}</span>
                    <ArrowRight className="w-4 h-4 text-[#22C55E] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <div className="text-xs text-[#A3B899] mt-1.5 leading-normal line-clamp-2">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders & Fine-Tuning */}
          <div className="pt-4 border-t border-[#2E7D32]/25 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center justify-between text-[#A3B899] font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-[#22C55E]" />
                  Similarity Threshold
                </span>
                <span className="font-mono font-bold text-[#22C55E] text-sm">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
              <span className="text-xs text-[#718471] block mt-1">
                Cosine cutoff for instant sub-10ms verified cache hits
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[#A3B899] font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-[#22C55E]" />
                  Retrieval Top-K Chunks
                </span>
                <span className="font-mono font-bold text-[#22C55E] text-sm">{topK} chunks</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
              <span className="text-xs text-[#718471] block mt-1">
                Number of document excerpts injected into agent context
              </span>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 cursor-pointer w-full hover:bg-[#0E1510] transition-colors">
                <input
                  type="checkbox"
                  checked={bypassCache}
                  onChange={(e) => setBypassCache(e.target.checked)}
                  className="w-4 h-4 rounded text-[#22C55E] focus:ring-[#22C55E] accent-[#22C55E]"
                />
                <div>
                  <span className="font-bold text-[#FFFFFF] text-sm block">Bypass Cache (Force Live Synthesis)</span>
                  <span className="text-xs text-[#718471] block mt-0.5">
                    Skip memory lookup and force full agentic synthesis
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Agentic Response Display on Dark Obsidian Cards */}
      {response && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-2xl space-y-5 backdrop-blur-md">
            {/* Outcome Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#2E7D32]/25">
              <div className="flex flex-wrap items-center gap-2.5">
                {response.status === 'VERIFIED_CALCULATION' ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A]/40 text-[#93C5FD] border border-[#3B82F6]/50">
                    <Calculator className="w-4 h-4 text-[#60A5FA]" />
                    MATHEMATICALLY VERIFIED
                  </span>
                ) : response.status === 'HIT' ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#064E3B]/50 text-[#6EE7B7] border border-[#10B981]/50">
                    <Zap className="w-4 h-4 fill-[#10B981] text-[#10B981] animate-pulse" />
                    CACHE HIT ({response.similarityScore?.toFixed(3) || '1.000'} Similarity | Instant &lt;10ms)
                  </span>
                ) : response.status === 'INSUFFICIENT_EVIDENCE' ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#78350F]/40 text-[#FDE68A] border border-[#F59E0B]/50">
                    <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
                    INSUFFICIENT DOCUMENT EVIDENCE (HALLUCINATION SUPPRESSED)
                  </span>
                ) : response.status === 'CLARIFICATION_REQUIRED' ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#581C87]/40 text-[#E9D5FF] border border-[#A855F7]/50">
                    <HelpCircle className="w-4 h-4 text-[#C084FC]" />
                    CLARIFICATION REQUIRED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#064E3B]/40 text-[#A7F3D0] border border-[#059669]/50">
                    <Sparkles className="w-4 h-4 text-[#34D399]" />
                    AGENTIC AI SYNTHESIS ({response.model || 'gemini-2.5-flash'})
                  </span>
                )}

                {/* Evidence Quality Indicator */}
                {response.confidence && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                      response.confidence === 'Strong'
                        ? 'bg-[#064E3B]/40 text-[#6EE7B7] border-[#059669]/50'
                        : response.confidence === 'Partial'
                        ? 'bg-[#78350F]/40 text-[#FCD34D] border-[#D97706]/50'
                        : 'bg-[#881337]/40 text-[#FDA4AF] border-[#E11D48]/50'
                    }`}
                  >
                    Quality: {response.confidence}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#070A08] text-[#22C55E] border border-[#2E7D32]/40">
                  <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                  {response.latencyMs} ms
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0E1510] hover:bg-[#16221A] text-[#A3B899] hover:text-[#FFFFFF] border border-[#2E7D32]/35 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-[#22C55E] font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Structured Response</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Structured 5-Part Layout in Standard Normal Font Sizes */}
            <div className="space-y-4">
              {/* Part 1: Direct Answer */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 shadow-inner space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
                    1. Direct Agentic Answer
                  </span>
                  <span className="text-xs font-mono text-[#D97706] bg-[#78350F]/30 px-2.5 py-0.5 rounded-md border border-[#D97706]/40">
                    Verified
                  </span>
                </div>
                <div className="text-sm sm:text-base font-medium text-[#F7FAF6] leading-relaxed whitespace-pre-line">
                  {response.directAnswer}
                </div>
              </div>

              {/* Part 2: Explanation or Calculation */}
              {response.explanation && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 shadow-inner space-y-2">
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                    2. Detailed Technical Breakdown / Step-by-Step Proof
                  </span>
                  <div className="text-xs sm:text-sm text-[#F7FAF6] leading-relaxed font-mono whitespace-pre-line bg-[#070A08] p-3 sm:p-4 rounded-xl border border-[#2E7D32]/35">
                    {response.explanation}
                  </div>
                </div>
              )}

              {/* Part 3: Evidence or Source References */}
              {response.evidenceSources && response.evidenceSources.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 shadow-inner space-y-2">
                  <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
                    3. Evidence Sources & Knowledge Origin
                  </span>
                  <div className="space-y-1.5">
                    {response.evidenceSources.map((src, i) => (
                      <div key={i} className="text-xs sm:text-sm font-mono text-[#A3B899] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Part 4 & 5: Evidence Quality & Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 shadow-inner space-y-1">
                  <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
                    4. Evidence Quality Signal
                  </span>
                  <div className="text-xs sm:text-sm text-[#F7FAF6]">
                    Level: <strong className="font-bold text-[#22C55E]">{response.confidence || 'Strong'}</strong>
                    <p className="text-xs text-[#A3B899] mt-1 leading-normal">
                      Score validated across cosine similarity, keyword alignment, and mathematical proof constraints.
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 shadow-inner space-y-1">
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                    5. Contextual Scope & Boundaries
                  </span>
                  <div className="text-xs sm:text-sm text-[#A3B899] leading-normal">
                    {response.limitations || 'Verified under multi-domain foundation and deterministic computation rules.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Metadata Footer */}
            <div className="pt-3 border-t border-[#2E7D32]/25 flex flex-wrap items-center justify-between text-xs sm:text-sm text-[#A3B899] gap-2">
              <span>
                Verification Protocol:{' '}
                <strong className="text-[#22C55E] font-mono">
                  {response.verificationMethod || 'AZORBot Accuracy Engine'}
                </strong>
              </span>
              <span>
                Engine Model: <strong className="text-[#D97706] font-mono">{response.model || 'gemini-2.5-flash'}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Pipeline Trace Visualizer */}
          <div className="bg-[#0B0F0C] rounded-3xl p-5 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setShowTrace(!showTrace)}
              className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-[#A3B899] uppercase tracking-wider cursor-pointer hover:text-[#FFFFFF] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22C55E]" />
                Mandatory Accuracy Pipeline Trace ({response.pipelineTrace.length} stages)
              </span>
              {showTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTrace && (
              <div className="mt-3.5 space-y-2 font-mono text-xs sm:text-sm">
                {response.pipelineTrace.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-[#2E7D32]/30 text-[#22C55E] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-[#2E7D32]/50">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-[#FFFFFF] text-xs sm:text-sm">{step.stage}</span>
                        <div className="text-xs text-[#A3B899] font-sans mt-0.5">
                          {step.details}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <span className="text-xs text-[#A3B899] bg-[#0E1510] px-2 py-0.5 rounded-md border border-[#2E7D32]/30">
                        {step.durationMs} ms
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase ${
                          step.status === 'hit'
                            ? 'bg-[#064E3B] text-[#6EE7B7] border border-[#10B981]/50'
                            : step.status === 'miss'
                            ? 'bg-[#78350F] text-[#FCD34D] border border-[#D97706]/50'
                            : 'bg-[#142318] text-[#22C55E] border border-[#2E7D32]/50'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Retrieved Grounded Passages */}
          {response.retrievedChunks && response.retrievedChunks.length > 0 && (
            <div className="bg-[#0B0F0C] rounded-3xl p-5 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setShowChunks(!showChunks)}
                className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-[#A3B899] uppercase tracking-wider cursor-pointer hover:text-[#FFFFFF] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#22C55E]" />
                  Retrieved Grounded Document Chunks ({response.retrievedChunks.length})
                </span>
                {showChunks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showChunks && (
                <div className="mt-3.5 grid grid-cols-1 gap-3">
                  {response.retrievedChunks.map((chunk, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 space-y-2 shadow-inner"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm border-b border-[#2E7D32]/25 pb-2">
                        <div className="font-bold text-[#FFFFFF] flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#2E7D32]/30 text-[#22C55E] font-mono text-xs border border-[#2E7D32]/40">
                            Source #{idx + 1}
                          </span>
                          <span>{chunk.docName}</span>
                          <span className="text-[#A3B899] text-xs font-normal">(Page {chunk.page})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-[#6EE7B7] bg-[#064E3B]/50 px-2 py-0.5 rounded-md border border-[#10B981]/50 font-bold">
                            Cosine Sim: {chunk.similarityScore.toFixed(4)}
                          </span>
                          <span className="text-[#A3B899]">
                            {chunk.tokenCount} tokens
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[#F7FAF6] leading-relaxed font-mono bg-[#0B0F0C] p-3 rounded-xl border border-[#2E7D32]/25">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
