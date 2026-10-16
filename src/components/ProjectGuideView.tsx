import React from 'react';
import {
  BookOpen,
  Zap,
  FileText,
  Workflow,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export const ProjectGuideView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-[#FFFFFF] tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#22C55E]" />
          AZORBot — Architectural Deep Dive
        </h2>
        <p className="text-sm text-[#A3B899] mt-1 leading-normal">
          Engineering principles of Cache-Augmented Generation (CAG), Retrieval-Augmented Generation (RAG), and synchronized Hybrid execution.
        </p>
      </div>

      {/* CAG vs RAG Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CAG Column */}
        <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0E1B11] text-[#22C55E] border border-[#2E7D32]/50">
              <Zap className="w-5 h-5 fill-[#22C55E] text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">
                Cache-Augmented Generation (CAG)
              </h3>
              <span className="text-xs text-[#D9AD72] font-mono">Semantic Memory Reuse</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#F7FAF6] leading-relaxed">
            CAG evaluates whether a user prompt matches an already answered question in high-dimensional embedding space.
            Instead of routing every prompt to an expensive generative LLM, it retrieves previously vetted answers based on cosine similarity.
          </p>

          <div className="space-y-2 text-xs sm:text-sm font-mono">
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">Typical Latency:</span>
              <strong className="text-[#22C55E] font-bold">&lt; 10 ms (Instant)</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">API Token Cost:</span>
              <strong className="text-[#22C55E] font-bold">$0.00 / query</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">Decision Metric:</span>
              <strong className="text-[#FFFFFF]">Cosine Similarity ≥ Threshold</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">Primary Use Case:</span>
              <strong className="text-[#D9AD72]">Repetitive & high-frequency queries</strong>
            </div>
          </div>
        </div>

        {/* RAG Column */}
        <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0E1B11] text-[#22C55E] border border-[#2E7D32]/50">
              <FileText className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">
                Retrieval-Augmented Generation (RAG)
              </h3>
              <span className="text-xs text-[#D9AD72] font-mono">Document Grounded Synthesis</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#F7FAF6] leading-relaxed">
            RAG segments large corpus documents into discrete vector chunks. When a user asks an informational question,
            it retrieves the top-k most relevant excerpts and injects them directly into the LLM system prompt as verified facts.
          </p>

          <div className="space-y-2 text-xs sm:text-sm font-mono">
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">Typical Latency:</span>
              <strong className="text-[#D97706] font-bold">800 ms - 2,500 ms</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">API Token Cost:</span>
              <strong className="text-[#D97706] font-bold">Standard LLM Token Usage</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">Retrieval Target:</span>
              <strong className="text-[#FFFFFF]">Unstructured text chunks</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070A08] border border-[#2E7D32]/35 flex justify-between">
              <span className="text-[#A3B899]">Primary Use Case:</span>
              <strong className="text-[#D9AD72]">Deep factual grounding & QA</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Hybrid Pipeline Diagram */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-4 backdrop-blur-md">
        <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
          <Workflow className="w-4 h-4 text-[#22C55E]" />
          Synchronized Hybrid Pipeline Architecture
        </h3>

        <div className="p-4 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 font-mono text-xs sm:text-sm overflow-x-auto">
          <div className="min-w-[650px] space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-[#0E1510] text-[#FFFFFF] font-bold border border-[#2E7D32]/40">
                1. User Query
              </span>
              <ArrowRight className="w-4 h-4 text-[#22C55E]" />
              <span className="px-3 py-1.5 rounded-lg bg-[#0E1B11] text-[#22C55E] font-bold border border-[#2E7D32]/50">
                2. Normalize & Embed (384-d Vector)
              </span>
              <ArrowRight className="w-4 h-4 text-[#22C55E]" />
              <span className="px-3 py-1.5 rounded-lg bg-[#0E1B11] text-[#22C55E] font-bold border border-[#2E7D32]/50">
                3. CAG Semantic Lookup
              </span>
            </div>

            <div className="pl-6 border-l-2 border-[#22C55E] space-y-3 py-2">
              <div className="flex items-center gap-2 text-[#22C55E]">
                <span className="font-bold">├─ IF Cosine Similarity ≥ 0.85:</span>
                <span className="bg-[#064E3B]/60 px-2 py-0.5 rounded-md font-bold text-[#6EE7B7] border border-[#10B981]/50">
                  Return Cached Answer Instantly (&lt;10ms, $0 Cost)
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#A3B899]">
                <span className="font-bold">└─ IF Cache Miss (&lt; 0.85):</span>
                <span>Proceed to RAG & Generative Synthesis</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-8">
              <ArrowRight className="w-4 h-4 text-[#22C55E]" />
              <span className="px-3 py-1.5 rounded-lg bg-[#0E1B11] text-[#22C55E] font-bold border border-[#2E7D32]/50">
                4. Retrieve Top-K Chunks
              </span>
              <ArrowRight className="w-4 h-4 text-[#22C55E]" />
              <span className="px-3 py-1.5 rounded-lg bg-[#0E1410] text-[#FFFFFF] font-bold border border-[#2E7D32]/35">
                5. Grounded LLM Inference
              </span>
              <ArrowRight className="w-4 h-4 text-[#22C55E]" />
              <span className="px-3 py-1.5 rounded-lg bg-[#064E3B]/60 text-[#6EE7B7] font-bold border border-[#10B981]/50">
                6. Auto-Seed Cache Entry
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cosine Formulation & Math */}
      <div className="bg-[#0B0F0C] rounded-3xl p-6 border border-[#2E7D32]/35 shadow-xl space-y-3 backdrop-blur-md">
        <h3 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#22C55E]" />
          Mathematical Cosine Similarity Foundation
        </h3>

        <div className="p-4 rounded-2xl bg-[#070A08] border border-[#2E7D32]/35 font-mono text-xs sm:text-sm text-[#F7FAF6] space-y-2">
          <div className="text-sm sm:text-base font-bold text-[#22C55E]">
            cos(θ) = (A · B) / (||A|| × ||B||)
          </div>
          <p className="text-xs sm:text-sm text-[#A3B899] leading-relaxed font-sans">
            Where vector <strong>A</strong> is the query embedding and vector <strong>B</strong> is the stored cache or chunk embedding.
            By normalizing embeddings via L2 unit norm, the dot product computes cosine distance in linear O(d) time complexity.
          </p>
        </div>
      </div>
    </div>
  );
};
