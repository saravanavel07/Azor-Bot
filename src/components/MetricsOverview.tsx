import React from 'react';
import { Database, Zap, Clock, ShieldAlert, Cpu, PiggyBank } from 'lucide-react';

export interface MetricsData {
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
}

interface MetricsOverviewProps {
  metrics: MetricsData | null;
  loading?: boolean;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-[#0E1510] rounded-2xl border border-[#2E7D32]/25" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Observed Hit Rate',
      value: `${metrics.hitRatePct}%`,
      sub: `${metrics.cacheHits} hits / ${metrics.totalQueries} runs`,
      icon: Zap,
      accent: 'text-[#22C55E] bg-[#0E1B11] border-[#2E7D32]/50',
    },
    {
      label: 'Cached Memory',
      value: metrics.totalCachedAnswers.toLocaleString(),
      sub: 'Active vector entries',
      icon: Database,
      accent: 'text-[#D9AD72] bg-[#1A120B] border-[#D97706]/40',
    },
    {
      label: 'CAG Hit Latency',
      value: `${metrics.avgHitLatencyMs} ms`,
      sub: 'Sub-10ms verified recall',
      icon: Clock,
      accent: 'text-[#00E676] bg-[#064E3B]/40 border-[#10B981]/50',
    },
    {
      label: 'LLM Roundtrip',
      value: `${metrics.avgMissLatencyMs} ms`,
      sub: 'Full synthesis pipeline',
      icon: ShieldAlert,
      accent: 'text-[#FBBF24] bg-[#78350F]/40 border-[#F59E0B]/50',
    },
    {
      label: 'Indexed Vectors',
      value: metrics.totalIndexedChunks.toLocaleString(),
      sub: 'Searchable chunks',
      icon: Cpu,
      accent: 'text-[#A3B899] bg-[#111913] border-[#2E7D32]/40',
    },
    {
      label: 'Compute Savings',
      value: `$${metrics.totalCostSavedUsd.toFixed(4)}`,
      sub: `${metrics.totalTokensSaved.toLocaleString()} tokens saved`,
      icon: PiggyBank,
      accent: 'text-[#22C55E] bg-[#0E1B11] border-[#2E7D32]/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-[#0B0F0C] rounded-2xl p-3.5 sm:p-4 border border-[#2E7D32]/35 shadow-lg hover:border-[#22C55E]/60 transition-all duration-200 flex flex-col justify-between backdrop-blur-md group hover:shadow-[#22C55E]/10"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-xs font-bold text-[#A3B899] uppercase tracking-wider line-clamp-1">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${c.accent} transition-transform group-hover:scale-110`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight font-mono group-hover:text-[#22C55E] transition-colors">
                {c.value}
              </div>
              <div className="text-xs text-[#718471] font-medium mt-0.5 truncate">
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
