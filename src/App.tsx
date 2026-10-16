/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { Header, NavTab } from './components/Header';
import { MetricsOverview, MetricsData } from './components/MetricsOverview';
import { WorkspaceView } from './components/WorkspaceView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { CacheObservatoryView } from './components/CacheObservatoryView';
import { EvaluationCentreView } from './components/EvaluationCentreView';
import { SettingsView } from './components/SettingsView';
import { ProjectGuideView } from './components/ProjectGuideView';
import { PythonRepoHub } from './components/PythonRepoHub';
import { ComputerLogo } from './components/ComputerLogo';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('workspace');
  const [activeMode, setActiveMode] = useState<'Hybrid' | 'CAG' | 'RAG'>('Hybrid');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [geminiActive, setGeminiActive] = useState(false);

  // Cross-view query trigger state
  const [pendingQuery, setPendingQuery] = useState<{
    text: string;
    mode: 'Hybrid' | 'CAG' | 'RAG';
    timestamp: number;
  } | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setGeminiActive(Boolean(data.geminiConfigured));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    checkStatus();
  }, []);

  const handleNavigateToWorkspace = (
    queryText: string,
    mode?: 'Hybrid' | 'CAG' | 'RAG'
  ) => {
    const targetMode = mode || activeMode;
    setActiveMode(targetMode);
    setActiveTab('workspace');
    setPendingQuery({
      text: queryText,
      mode: targetMode,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="relative min-h-screen bg-[#030503] text-[#F7FAF6] flex flex-col font-sans selection:bg-[#22C55E]/30 selection:text-[#FFFFFF]">
      {/* Live-Motion Particle Canvas */}
      <ParticleBackground />

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        geminiActive={geminiActive}
        activeMode={activeMode}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Genuine Telemetry Overview */}
        <MetricsOverview metrics={metrics} loading={loadingMetrics} />

        {/* Tab Views */}
        {activeTab === 'workspace' && (
          <WorkspaceView
            activeMode={activeMode}
            onModeChange={setActiveMode}
            onQueryComplete={fetchMetrics}
            pendingQuery={pendingQuery}
            onClearPendingQuery={() => setPendingQuery(null)}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView
            onRefreshMetrics={fetchMetrics}
            onTestInWorkspace={handleNavigateToWorkspace}
          />
        )}

        {activeTab === 'observatory' && (
          <CacheObservatoryView
            onRefreshMetrics={fetchMetrics}
            onTestInWorkspace={handleNavigateToWorkspace}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationCentreView
            onSelectQuery={handleNavigateToWorkspace}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'guide' && <ProjectGuideView />}

        {activeTab === 'python-repo' && <PythonRepoHub />}
      </main>

      {/* Platform Footer */}
      <footer className="relative z-10 mt-12 bg-[#050805]/95 border-t border-[#2E7D32]/35 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3B899]">
          <div className="flex items-center gap-3">
            <ComputerLogo size="sm" showText={true} />
            <span className="hidden md:inline text-[#2E7D32]/40">|</span>
            <span className="hidden md:inline font-mono text-[#D9AD72]">
              Agentic Intelligence (CAG + RAG + Multi-Domain Engine)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* Color Palette Indicator */}
            <div className="flex items-center gap-1.5" title="Coconut Green & Coconut Brown Palette">
              <span className="w-3 h-3 rounded-full bg-[#030503] border border-[#22C55E]/60" title="Pitch Black" />
              <span className="w-3 h-3 rounded-full bg-[#00E676] shadow-xs shadow-[#00E676]" title="Neon Coconut Green" />
              <span className="w-3 h-3 rounded-full bg-[#22C55E]" title="Tender Coconut Palm" />
              <span className="w-3 h-3 rounded-full bg-[#D97706]" title="Golden Husk Amber" />
              <span className="w-3 h-3 rounded-full bg-[#5C3A21]" title="Coconut Husk Brown" />
              <span className="w-3 h-3 rounded-full bg-[#F7FAF6]" title="Coconut Milk White" />
            </div>

            <span className="text-[#A3B899]">
              Engineered with precision for high-throughput AI systems.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
