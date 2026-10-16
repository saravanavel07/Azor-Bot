import React from 'react';

interface ComputerLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ComputerLogo: React.FC<ComputerLogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = {
    sm: { icon: 'w-8 h-8', title: 'text-base', sub: 'text-[11px]' },
    md: { icon: 'w-11 h-11', title: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-16 h-16', title: 'text-3xl', sub: 'text-sm' },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Computer System Icon with Circuit-Brain motif in Coconut Green & Coconut Brown */}
      <div className={`relative ${dimensions.icon} flex-shrink-0 group`}>
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A180E" /> {/* Dark Coconut Canopy */}
              <stop offset="100%" stopColor="#050805" /> {/* Pitch Black */}
            </linearGradient>
            <linearGradient id="greenAcc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E676" /> {/* Neon Coconut Frond */}
              <stop offset="100%" stopColor="#22C55E" /> {/* Fresh Coconut Green */}
            </linearGradient>
            <linearGradient id="huskAcc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" /> {/* Golden Amber */}
              <stop offset="100%" stopColor="#D97706" /> {/* Coconut Husk Bronze */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Desktop Monitor Outer Bezel - Deep Obsidian Coconut Shell */}
          <rect
            x="24"
            y="26"
            width="192"
            height="136"
            rx="16"
            fill="#0E1410"
            stroke="#22C55E"
            strokeWidth="3"
            filter="drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))"
          />

          {/* Inner Screen Surface */}
          <rect
            x="36"
            y="38"
            width="168"
            height="112"
            rx="8"
            fill="url(#screenGrad)"
            stroke="#2E7D32"
            strokeWidth="1.2"
          />

          {/* AI Circuit-Brain Symbol Integrated into Screen */}
          <g opacity="0.95">
            {/* Brain Hemisphere Contour Curves */}
            <path
              d="M92 68 C80 68 72 78 72 90 C72 102 78 110 88 116 C96 122 104 122 108 122"
              stroke="#22C55E"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
            <path
              d="M148 68 C160 68 168 78 168 90 C168 102 162 110 152 116 C144 122 136 122 132 122"
              stroke="#22C55E"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />

            {/* Neural Circuit Traces */}
            <line x1="72" y1="90" x2="98" y2="90" stroke="#00E676" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="98" y1="90" x2="120" y2="76" stroke="#22C55E" strokeWidth="2" />
            <line x1="120" y1="76" x2="142" y2="90" stroke="#22C55E" strokeWidth="2" />
            <line x1="142" y1="90" x2="168" y2="90" stroke="#00E676" strokeWidth="2" strokeDasharray="3 2" />
            
            <line x1="98" y1="90" x2="120" y2="108" stroke="#F59E0B" strokeWidth="2" />
            <line x1="120" y1="108" x2="142" y2="90" stroke="#F59E0B" strokeWidth="2" />
            
            {/* Central Memory Core Hub with Pulsing Glow */}
            <circle cx="120" cy="92" r="10" fill="url(#greenAcc)" filter="url(#glow)" />
            <circle cx="120" cy="92" r="4.5" fill="#FFFFFF" />

            {/* Circuit Nodes */}
            <circle cx="72" cy="90" r="5" fill="#00E676" stroke="#050805" strokeWidth="1.5" />
            <circle cx="98" cy="90" r="4" fill="#22C55E" />
            <circle cx="142" cy="90" r="4" fill="#22C55E" />
            <circle cx="168" cy="90" r="5" fill="#00E676" stroke="#050805" strokeWidth="1.5" />
            <circle cx="120" cy="76" r="3.5" fill="#FFFFFF" />
            <circle cx="120" cy="108" r="3.5" fill="#F59E0B" />

            {/* Signal Pulse Points */}
            <circle cx="85" cy="90" r="2" fill="#FFFFFF" />
            <circle cx="155" cy="90" r="2" fill="#FFFFFF" />
          </g>

          {/* Stand Neck - Coconut Husk Brown */}
          <path d="M106 162 L96 196 L144 196 L134 162 Z" fill="#5C3A21" stroke="#D97706" strokeWidth="1" />

          {/* Stand Base - Obsidian with Glowing Coconut Green Border */}
          <rect
            x="76"
            y="196"
            width="88"
            height="14"
            rx="7"
            fill="#0E1410"
            stroke="#22C55E"
            strokeWidth="2"
          />
          <line x1="90" y1="203" x2="150" y2="203" stroke="#00E676" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight text-[#FFFFFF] leading-tight flex items-center gap-1.5 ${dimensions.title}`}>
            <span>AZORBot</span>
            <span className="text-[#22C55E] px-1.5 py-0.5 rounded-md bg-[#22C55E]/15 border border-[#22C55E]/50 text-[0.65em] font-mono tracking-wider font-bold shadow-sm shadow-[#22C55E]/20">
              AGENTIC CAG+RAG
            </span>
          </div>
          <div className={`text-[#D9AD72] font-medium tracking-tight ${dimensions.sub}`}>
            Intelligent Answers. Context-Aware Retrieval. Faster Knowledge.
          </div>
        </div>
      )}
    </div>
  );
};
