import React from 'react';
import { ComputerLogo } from './ComputerLogo';
import { Sparkles, Database, Activity, Award, Settings, BookOpen, Code2, ShieldCheck } from 'lucide-react';

export type NavTab = 'workspace' | 'knowledge' | 'observatory' | 'evaluation' | 'settings' | 'guide' | 'python-repo';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  geminiActive: boolean;
  activeMode: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  geminiActive,
  activeMode,
}) => {
  const tabs = [
    { id: 'workspace', label: 'AI Workspace', icon: Sparkles },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'observatory', label: 'Cache Observatory', icon: Activity },
    { id: 'evaluation', label: 'Evaluation Centre', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'guide', label: 'Project Guide', icon: BookOpen },
    { id: 'python-repo', label: 'Python Repo', icon: Code2 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#050805]/90 backdrop-blur-md border-b border-[#2E7D32]/35 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center gap-6">
            <ComputerLogo size="md" />
            <div className="hidden lg:flex items-center gap-2.5 pl-4 border-l border-[#2E7D32]/30">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0E1B11] text-[#22C55E] border border-[#2E7D32]/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                Agentic Dual-Engine: CAG + RAG
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#0A0E0B] text-[#F7FAF6] border border-[#D97706]/40 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                Strategy: <strong className="font-semibold text-[#D9AD72]">{activeMode}</strong>
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as NavTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#22C55E] text-[#030503] shadow-md shadow-[#22C55E]/30 font-bold border border-[#00E676]'
                      : 'text-[#A3B899] hover:bg-[#101812] hover:text-[#FFFFFF] border border-transparent hover:border-[#2E7D32]/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#030503]' : 'text-[#22C55E]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
