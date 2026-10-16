import React, { useState, useEffect } from 'react';
import {
  Activity,
  Trash2,
  RefreshCw,
  Download,
  Search,
  Zap,
  Target,
  Clock,
  Database,
  Sliders,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface CacheEntry {
  id: string;
  query: string;
  normalizedQuery: string;
  answer: string;
  model: string;
  source: string;
  createdAt: number;
  lastAccessedAt: number;
  hitCount: number;
  ttlMinutes: number;
}

interface MetricsData {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRatePct: number;
  avgHitLatencyMs: number;
  avgMissLatencyMs: number;
  totalTokensSaved: number;
  totalCostSavedUsd: number;
  totalCachedAnswers: number;
  totalIndexedChunks: number;
  similarityBuckets: Record<string, number>;
  topReused: Array<{ id: string; query: string; hitCount: number; lastAccessedAt: number }>;
  recentLogs: Array<{
    id: string;
    query: string;
    mode: string;
    status: string;
    similarityScore: number;
    latencyMs: number;
    tokensSaved: number;
    costSavedUsd: number;
    timestamp: number;
  }>;
}

interface CacheObservatoryViewProps {
  onRefreshMetrics?: () => void;
  onTestInWorkspace?: (query: string, mode: 'Hybrid' | 'CAG' | 'RAG') => void;
}

export const CacheObservatoryView: React.FC<CacheObservatoryViewProps> = ({
  onRefreshMetrics,
  onTestInWorkspace,
}) => {
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [search, setSearch] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [testQuery, setTestQuery] = useState<string>('');
  const [testResult, setTestResult] = useState<{ similarity: number; matches: boolean; targetQuery: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchCacheData = async () => {
    try {
      const [cacheRes, metricsRes] = await Promise.all([
        fetch('/api/cache'),
        fetch('/api/metrics'),
      ]);

      if (cacheRes.ok) {
        const data = await cacheRes.json();
        setEntries(data || []);
        if (data.length > 0 && !selectedEntryId) {
          setSelectedEntryId(data[0].id);
          setTestQuery(data[0].query);
        }
      }

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCacheData();
  }, []);

  const handleInvalidate = async (id: string) => {
    try {
      const res = await fetch(`/api/cache/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCacheData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/cache/clear', { method: 'POST' });
      if (res.ok) {
        setConfirmClear(false);
        await fetchCacheData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReseed = async () => {
    try {
      const res = await fetch('/api/cache/seed', { method: 'POST' });
      if (res.ok) {
        await fetchCacheData();
        if (onRefreshMetrics) onRefreshMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `azorbot_cache_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRunSimilarityTest = async (overrideQuery?: string, overrideEntryId?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : testQuery).trim();
    const entryId = overrideEntryId || selectedEntryId;
    if (!q || !entryId) return;

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/cache/test-similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, entryId }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          similarity: data.cosineSimilarity,
          matches: data.matchesDefaultThreshold,
          targetQuery: data.targetQuery,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.query.toLowerCase().includes(search.toLowerCase()) ||
      e.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#22C55E]" />
              Cache Observatory & Telemetry Hub
            </h2>
            <p className="text-sm text-[#A3B899] mt-1 leading-normal">
              Live inspection of active semantic cache representations, similarity distributions, hit/miss metrics, and eviction controls.
            </p>
          </div>

          {/* Action Options */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1510] hover:bg-[#16221A] text-[#A3B899] hover:text-[#FFFFFF] border border-[#2E7D32]/35 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={handleReseed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1510] hover:bg-[#16221A] text-[#A3B899] hover:text-[#FFFFFF] border border-[#2E7D32]/35 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Reseed Knowledge</span>
            </button>

            {/* Clear All with in-UI Confirmation */}
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear Cache</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-xl border border-rose-800">
                <span className="text-xs text-rose-200 font-bold px-2">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Yes, Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 bg-[#0E1510] text-rose-300 rounded-lg text-xs font-semibold hover:bg-[#16221A] cursor-pointer border border-rose-800/40"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Telemetry Breakdown */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chart 1: Hits vs Misses Ratio */}
          <div className="bg-[#0B0F0C] rounded-3xl p-5 border border-[#2E7D32]/35 shadow-xl flex flex-col justify-between backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#A3B899] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Cache Traffic Breakdown</span>
              <span className="font-mono text-[#22C55E] font-bold">{metrics.hitRatePct}% Hit Rate</span>
            </h3>

            {/* Donut Bar */}
            <div className="flex items-center justify-center py-3">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    className="text-[#131D16]"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#22C55E]"
                    strokeDasharray={`${metrics.hitRatePct}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-xl font-bold font-mono text-[#FFFFFF]">
                    {metrics.hitRatePct}%
                  </div>
                  <div className="text-xs text-[#A3B899] font-semibold">Hit Rate</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#2E7D32]/25 text-center">
              <div className="p-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/35">
                <span className="text-[#A3B899] block">CAG Hits</span>
                <strong className="text-[#22C55E] text-sm font-bold">{metrics.cacheHits}</strong>
              </div>
              <div className="p-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/35">
                <span className="text-[#A3B899] block">Cache Misses</span>
                <strong className="text-[#D97706] text-sm font-bold">{metrics.cacheMisses}</strong>
              </div>
            </div>
          </div>

          {/* Chart 2: Latency Delta Comparison */}
          <div className="bg-[#0B0F0C] rounded-3xl p-5 border border-[#2E7D32]/35 shadow-xl flex flex-col justify-between backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#A3B899] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Latency Efficiency</span>
              <span className="font-mono text-[#22C55E] font-bold">
                {metrics.avgMissLatencyMs > 0
                  ? `${Math.max(1, Math.round(metrics.avgMissLatencyMs / Math.max(1, metrics.avgHitLatencyMs)))}x Faster`
                  : 'Instant'}
              </span>
            </h3>

            <div className="space-y-4 py-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#22C55E] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current" /> CAG Hit (Instant)
                  </span>
                  <span className="font-mono text-[#FFFFFF] font-bold">{metrics.avgHitLatencyMs} ms</span>
                </div>
                <div className="w-full bg-[#070A08] h-3 rounded-full overflow-hidden border border-[#2E7D32]/30">
                  <div
                    className="bg-[#22C55E] h-full rounded-full transition-all duration-500 shadow-sm shadow-[#22C55E]"
                    style={{
                      width: `${Math.max(4, Math.min(100, (metrics.avgHitLatencyMs / Math.max(metrics.avgMissLatencyMs, 500)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#D97706] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Full RAG / Generative Round-trip
                  </span>
                  <span className="font-mono text-[#FFFFFF] font-bold">{metrics.avgMissLatencyMs} ms</span>
                </div>
                <div className="w-full bg-[#070A08] h-3 rounded-full overflow-hidden border border-[#2E7D32]/30">
                  <div className="bg-[#D97706] h-full rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 text-xs text-[#A3B899]">
              Semantic caching eliminates up to 99% of round-trip network hops and model inference latency.
            </div>
          </div>

          {/* Chart 3: Top Reused Cached Answers */}
          <div className="bg-[#0B0F0C] rounded-3xl p-5 border border-[#2E7D32]/35 shadow-xl flex flex-col justify-between backdrop-blur-md">
            <h3 className="text-xs font-bold text-[#A3B899] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Top Reused Knowledge</span>
              <span className="text-xs font-mono text-[#D9AD72] font-semibold">Leaderboard</span>
            </h3>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {metrics.topReused && metrics.topReused.length > 0 ? (
                metrics.topReused.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 h-4 rounded-full bg-[#2E7D32]/30 text-[#22C55E] font-bold flex items-center justify-center text-[10px] flex-shrink-0 border border-[#2E7D32]/50">
                        {idx + 1}
                      </span>
                      <span className="text-[#FFFFFF] font-medium truncate">{item.query}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-mono font-bold text-[#22C55E] bg-[#064E3B]/50 px-1.5 py-0.5 rounded-md border border-[#10B981]/50">
                        {item.hitCount} hits
                      </span>
                      {onTestInWorkspace && (
                        <button
                          type="button"
                          onClick={() => onTestInWorkspace(item.query, 'CAG')}
                          className="p-1 text-[#A3B899] hover:text-[#FFFFFF] hover:bg-[#121B14] rounded-md transition-colors cursor-pointer"
                          title="Run this cached query in Workspace"
                        >
                          <ExternalLink className="w-3 h-3 text-[#22C55E]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#A3B899]">
                  No cache hits recorded yet. Queries in AI Workspace will populate this leaderboard.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#2E7D32]/25 text-xs text-[#A3B899] flex items-center justify-between">
              <span>Total Cached Answers:</span>
              <strong className="font-mono font-bold text-[#FFFFFF]">{metrics.totalCachedAnswers}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Live Similarity Tester */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#22C55E]" />
            Live Semantic Precision & Cosine Tester
          </h3>
          <p className="text-xs sm:text-sm text-[#A3B899] mt-0.5">
            Compare any arbitrary test query in real time against a selected cached entry to calculate exact 384-dimensional cosine similarity.
          </p>
        </div>

        {/* Quick Test Option Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#A3B899] uppercase tracking-wider">Quick Presets:</span>
          <button
            type="button"
            onClick={() => {
              const selectedEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];
              if (selectedEntry) {
                setTestQuery(selectedEntry.query);
                handleRunSimilarityTest(selectedEntry.query, selectedEntry.id);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-[#070A08] hover:bg-[#121B14] border border-[#2E7D32]/35 text-xs font-semibold text-[#A3B899] hover:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Exact Query Match
          </button>
          <button
            type="button"
            onClick={() => {
              const selectedEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];
              const paraphrase = selectedEntry?.query.includes('CAG')
                ? 'Can you explain Cache-Augmented Generation for language models?'
                : 'Why should we cache language model responses?';
              setTestQuery(paraphrase);
              if (selectedEntry) handleRunSimilarityTest(paraphrase, selectedEntry.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#070A08] hover:bg-[#121B14] border border-[#2E7D32]/35 text-xs font-semibold text-[#A3B899] hover:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Paraphrased Query Match
          </button>
          <button
            type="button"
            onClick={() => {
              const unrelated = 'How many moons does Jupiter have in total?';
              setTestQuery(unrelated);
              const selectedEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];
              if (selectedEntry) handleRunSimilarityTest(unrelated, selectedEntry.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#070A08] hover:bg-[#121B14] border border-[#2E7D32]/35 text-xs font-semibold text-[#A3B899] hover:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Unrelated Query (Safe Miss)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <label className="text-xs font-bold text-[#A3B899] block mb-1 uppercase">
              Target Cached Query
            </label>
            <select
              value={selectedEntryId}
              onChange={(e) => setSelectedEntryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-xs sm:text-sm font-semibold text-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            >
              {entries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.query}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="text-xs font-bold text-[#A3B899] block mb-1 uppercase">
              Arbitrary Test Phrase
            </label>
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. Why is caching effective in LLM architectures?"
              className="w-full px-3 py-2 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-xs sm:text-sm text-[#FFFFFF] placeholder-[#718471] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            />
          </div>

          <div className="md:col-span-2 pt-2 md:pt-4">
            <button
              type="button"
              onClick={() => handleRunSimilarityTest()}
              disabled={testing || !testQuery.trim() || !selectedEntryId}
              className={`w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                testing || !testQuery.trim() || !selectedEntryId
                  ? 'bg-[#182019] text-[#556355] cursor-not-allowed border border-[#2E7D32]/20'
                  : 'bg-[#22C55E] hover:bg-[#16A34A] text-[#030503] font-bold shadow-md shadow-[#22C55E]/30'
              }`}
            >
              {testing ? 'Computing...' : 'Test Cosine'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="p-3.5 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FFFFFF]">Computed Cosine Score:</span>
              <span className="font-mono text-base font-bold text-[#22C55E]">
                {testResult.similarity.toFixed(4)}
              </span>
            </div>

            <div>
              {testResult.matches ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#064E3B]/60 text-[#6EE7B7] border border-[#10B981]/50">
                  <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                  Score Meets Standard Threshold (≥ 0.85) — Cache HIT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#78350F]/50 text-[#FDE68A] border border-[#D97706]/50">
                  <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Below Threshold (&lt; 0.85) — Safe Cache Miss
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Cache Repository Table */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#22C55E]" />
              Active Semantic Cache Entries ({filteredEntries.length})
            </h3>
            <p className="text-xs sm:text-sm text-[#A3B899] mt-0.5">
              Inspect stored queries, precomputed answers, hit frequencies, and model sources.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718471]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter cached queries..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/40 text-[#FFFFFF] placeholder-[#718471] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#A3B899]">
            No matching cache entries. Try adjusting search or run queries in the AI Workspace.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-[#0E1410] border border-[#2E7D32]/35 space-y-2 hover:border-[#22C55E] transition-colors shadow-inner"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2E7D32]/25 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#2E7D32]/30 text-[#22C55E] font-mono text-xs font-bold border border-[#2E7D32]/50">
                      {entry.id}
                    </span>
                    <span className="font-bold text-[#FFFFFF] text-xs sm:text-sm">{entry.query}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-[#064E3B]/50 text-[#6EE7B7] border border-[#10B981]/50 font-bold">
                      {entry.hitCount} Hits
                    </span>
                    <span className="text-[#D9AD72]">{entry.model}</span>

                    {onTestInWorkspace && (
                      <button
                        type="button"
                        onClick={() => onTestInWorkspace(entry.query, 'CAG')}
                        className="flex items-center gap-1 text-xs font-semibold text-[#A3B899] hover:text-[#FFFFFF] bg-[#070A08] hover:bg-[#121B14] px-2 py-0.5 rounded-md border border-[#2E7D32]/35 transition-colors cursor-pointer"
                        title="Run in AI Workspace"
                      >
                        <Sparkles className="w-3 h-3 text-[#22C55E]" />
                        <span>Run in Workspace</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleInvalidate(entry.id)}
                      className="text-rose-400 hover:text-rose-200 p-1 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Invalidate this specific cache key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#F7FAF6] leading-relaxed line-clamp-3 font-normal bg-[#070A08] p-2.5 rounded-xl border border-[#2E7D32]/25">
                  {entry.answer}
                </p>

                <div className="flex items-center justify-between text-xs text-[#A3B899] pt-1 font-mono">
                  <span>Source: {entry.source}</span>
                  <span>Indexed: {new Date(entry.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
