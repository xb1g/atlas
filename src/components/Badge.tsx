import React from "react";
import { motion } from "motion/react";

interface BadgeProps {
  type: "oss-doc-pr" | "publish-essay" | "eco-campaign" | "code-widget" | "wildlife-map" | "teach-skill" | "coming-soon" | string;
  size?: number;
  interactive?: boolean;
  locked?: boolean;
}

export default function Badge({ type, size = 120, interactive = true, locked = false }: BadgeProps) {
  // Gradients and filter definitions
  const renderDefs = () => (
    <defs>
      {/* Glow Filter */}
      <filter id="badge-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Drop Shadow */}
      <filter id="badge-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.15" />
      </filter>

      {/* 1. OSS Doc PR Gradients */}
      <linearGradient id="grad-oss-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#115e59" />
        <stop offset="50%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>
      <linearGradient id="grad-oss-gold" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#fde047" />
      </linearGradient>

      {/* 2. Publish Essay Gradients */}
      <linearGradient id="grad-essay-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b21a8" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
      <linearGradient id="grad-essay-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>

      {/* 3. Eco Campaign Gradients */}
      <linearGradient id="grad-eco-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065f46" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#34d399" />
      </linearGradient>
      <linearGradient id="grad-eco-sky" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>

      {/* 4. Code Widget Gradients */}
      <linearGradient id="grad-code-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="50%" stopColor="#4f46e5" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
      <linearGradient id="grad-code-neon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#f472b6" />
      </linearGradient>

      {/* 5. Wildlife Map Gradients */}
      <linearGradient id="grad-map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c2d12" />
        <stop offset="50%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#fb923c" />
      </linearGradient>
      <linearGradient id="grad-map-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>

      {/* 6. Teach Skill Gradients */}
      <linearGradient id="grad-teach-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9a3412" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fdba74" />
      </linearGradient>
      <linearGradient id="grad-teach-star" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#fef9c3" />
      </linearGradient>

      {/* Locked / Silhouette Gradient */}
      <linearGradient id="grad-locked-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
  );

  const getBadgeContent = () => {
    if (locked) {
      return (
        <>
          {/* Hexagon Shield Frame */}
          <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-locked-bg)" filter="url(#badge-shadow)" />
          {/* Inner Polygon Border */}
          <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
          {/* Locked Lock Icon */}
          <g transform="translate(34, 30) scale(1.1)" opacity="0.35" fill="#f8fafc">
            <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </g>
        </>
      );
    }

    switch (type) {
      case "oss-doc-pr":
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-oss-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-oss-gold)" strokeWidth="2.5" />
            
            {/* Compass / Star Rays in BG */}
            <g opacity="0.15" stroke="#ffffff" strokeWidth="1.5">
              <line x1="50" y1="12" x2="50" y2="88" />
              <line x1="12" y1="50" x2="88" y2="50" />
              <line x1="23" y1="23" x2="77" y2="77" />
              <line x1="23" y1="77" x2="77" y2="23" />
            </g>

            {/* Glowing Center circle */}
            <circle cx="50" cy="50" r="22" fill="#042f2e" fillOpacity="0.4" stroke="#2dd4bf" strokeWidth="1" />

            {/* Git Pull Request / Branch fork path */}
            <g transform="translate(35, 33) scale(1.2)" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="18" r="3" stroke="#2dd4bf" fill="#0d9488" strokeWidth="1.5" />
              <circle cx="18" cy="6" r="3" stroke="#2dd4bf" fill="#0d9488" strokeWidth="1.5" />
              <circle cx="6" cy="6" r="3" stroke="url(#grad-oss-gold)" fill="#ca8a04" strokeWidth="1.5" />
              <path d="M6 15V9" />
              <path d="M18 9v3a3 3 0 0 1-3 3h-6" />
            </g>

            {/* Shiny stars */}
            <g transform="translate(18, 18) scale(0.8)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="url(#grad-oss-gold)" />
            </g>
            <g transform="translate(72, 68) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#ffffff" />
            </g>
            
            {/* Banner Text Shield Cover */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#042f2e" stroke="url(#grad-oss-gold)" strokeWidth="1" />
              <text x="35" y="9" fill="#2dd4bf" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                CONTRIBUTOR
              </text>
            </g>
          </>
        );

      case "publish-essay":
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-essay-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-essay-gold)" strokeWidth="2.5" />

            {/* Radiant Sparkle lines */}
            <g opacity="0.2" stroke="#ffffff" strokeWidth="1.5">
              <line x1="50" y1="12" x2="50" y2="88" />
              <line x1="12" y1="50" x2="88" y2="50" />
            </g>

            {/* Rounded Book & Quill Icon */}
            <g transform="translate(34, 30) scale(1.15)">
              {/* Notebook / Scroll Page */}
              <rect x="2" y="4" width="22" height="26" rx="3" fill="#faf5ff" stroke="url(#grad-essay-gold)" strokeWidth="1.5" />
              <line x1="6" y1="10" x2="16" y2="10" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6" y1="16" x2="20" y2="16" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6" y1="22" x2="14" y2="22" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Quill Pen */}
              <path d="M26 2 L21 11 L19 16 L17 19 L15 17 L17 15 L22 10 L28 1 Z" fill="url(#grad-essay-gold)" filter="url(#badge-glow)" />
              <circle cx="15" cy="19" r="0.8" fill="#eab308" />
            </g>

            {/* Sparkles */}
            <g transform="translate(70, 20) scale(0.9)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="url(#grad-essay-gold)" />
            </g>
            <g transform="translate(18, 65) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#ffffff" />
            </g>

            {/* Title Banner */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#3b0764" stroke="url(#grad-essay-gold)" strokeWidth="1" />
              <text x="35" y="9" fill="#c084fc" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                PUBLISHED
              </text>
            </g>
          </>
        );

      case "eco-campaign":
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-eco-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-eco-sky)" strokeWidth="2.5" />

            {/* Earth lines background */}
            <circle cx="50" cy="50" r="28" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3,1" />

            {/* Detailed Leaf Earth Core */}
            <g transform="translate(34, 31) scale(1.15)">
              {/* Earth Globe Circle */}
              <circle cx="14" cy="15" r="14" fill="#064e3b" fillOpacity="0.4" stroke="#34d399" strokeWidth="1.5" />
              <path d="M4 11 C8 9, 11 7, 16 11 C20 15, 23 11, 24 15" fill="none" stroke="#059669" strokeWidth="1" opacity="0.5" />
              <path d="M6 21 C10 18, 15 21, 22 17" fill="none" stroke="#059669" strokeWidth="1" opacity="0.5" />
              
              {/* Overlay Leaf */}
              <path d="M14 2 C21 8, 24 18, 14 28 C4 18, 7 8, 14 2 Z" fill="url(#grad-eco-bg)" filter="url(#badge-glow)" stroke="#34d399" strokeWidth="1" />
              <path d="M14 2 V28" stroke="#a7f3d0" strokeWidth="1" opacity="0.8" />
              <path d="M14 8 C16 11, 18 10, 19 11" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.8" />
              <path d="M14 14 C11 17, 9 16, 8 17" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.8" />
              <path d="M14 20 C16 23, 17 22, 19 23" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.8" />
            </g>

            {/* Dewdrop sparkles */}
            <circle cx="74" cy="24" r="2" fill="#38bdf8" />
            <circle cx="22" cy="62" r="1.5" fill="#ffffff" />
            <g transform="translate(74, 58) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#38bdf8" />
            </g>

            {/* Title Banner */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#022c22" stroke="url(#grad-eco-sky)" strokeWidth="1" />
              <text x="35" y="9" fill="#34d399" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                ECO-CHAMPION
              </text>
            </g>
          </>
        );

      case "code-widget":
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-code-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-code-neon)" strokeWidth="2.5" />

            {/* Matrix code lines bg */}
            <g opacity="0.15" fill="#818cf8" fontSize="5" fontFamily="monospace" fontWeight="bold">
              <text x="18" y="24">100101</text>
              <text x="64" y="24">011010</text>
              <text x="18" y="70">SYS_OK</text>
              <text x="64" y="70">DEV_SH</text>
            </g>

            {/* Glowing Widget Bracket Shield */}
            <g transform="translate(33, 31) scale(1.15)">
              {/* Layout Panel Widget */}
              <rect x="2" y="3" width="28" height="23" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
              <rect x="5" y="6" width="22" height="4" rx="1.5" fill="#312e81" />
              <circle cx="8" cy="8" r="1" fill="#db2777" />
              <circle cx="11" cy="8" r="1" fill="#f472b6" />
              
              {/* HTML Brackets overlaying */}
              <text x="16" y="20" fill="url(#grad-code-neon)" fontSize="11" fontFamily="monospace" fontWeight="extrabold" textAnchor="middle" filter="url(#badge-glow)">
                {"</>"}
              </text>
            </g>

            {/* Sparkling stars */}
            <g transform="translate(74, 16) scale(0.8)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="url(#grad-code-neon)" />
            </g>
            <g transform="translate(20, 64) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#ffffff" />
            </g>

            {/* Title Banner */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#171544" stroke="url(#grad-code-neon)" strokeWidth="1" />
              <text x="35" y="9" fill="#818cf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                WIDGET BUILDER
              </text>
            </g>
          </>
        );

      case "wildlife-map":
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-map-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-map-gold)" strokeWidth="2.5" />

            {/* Compass grid background */}
            <circle cx="50" cy="50" r="30" fill="none" stroke="#fdba74" strokeWidth="0.8" opacity="0.2" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="#fdba74" strokeWidth="0.8" opacity="0.2" />

            {/* Wildlife Map icon core */}
            <g transform="translate(32, 31) scale(1.15)">
              {/* Folded Map Shape */}
              <polygon points="2,22 10,25 18,22 26,25 26,5 18,2 10,5 2,2" fill="#ffedd5" stroke="#ea580c" strokeWidth="1" opacity="0.9" />
              <polyline points="10,5 10,25 18,22 18,2" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.6" strokeDasharray="2,2" />
              
              {/* Cute animal paw prints in path */}
              <circle cx="8" cy="12" r="1.5" fill="#f97316" />
              <circle cx="6" cy="9" r="0.8" fill="#f97316" />
              <circle cx="8" cy="8.5" r="0.8" fill="#f97316" />
              <circle cx="10" cy="9.5" r="0.8" fill="#f97316" />

              {/* Map pin */}
              <g transform="translate(14, 6)" filter="url(#badge-glow)">
                <path d="M4 0 C1.8 0 0 1.8 0 4 C0 7 4 11 4 11 C4 11 8 7 8 4 C8 1.8 6.2 0 4 0 Z" fill="url(#grad-map-gold)" stroke="#ea580c" strokeWidth="0.8" />
                <circle cx="4" cy="4" r="1.5" fill="#9a3412" />
              </g>
            </g>

            {/* Sparkling stars */}
            <g transform="translate(74, 20) scale(0.7)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#ffffff" />
            </g>
            <g transform="translate(20, 68) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="url(#grad-map-gold)" />
            </g>

            {/* Title Banner */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#431407" stroke="url(#grad-map-gold)" strokeWidth="1" />
              <text x="35" y="9" fill="#f97316" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                CARTOGRAPHER
              </text>
            </g>
          </>
        );

      case "teach-skill":
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-teach-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-teach-star)" strokeWidth="2.5" />

            {/* Glowing rays */}
            <g opacity="0.25" stroke="#ffffff" strokeWidth="1">
              <line x1="50" y1="20" x2="50" y2="12" />
              <line x1="50" y1="80" x2="50" y2="88" />
              <line x1="20" y1="50" x2="12" y2="50" />
              <line x1="80" y1="50" x2="88" y2="50" />
            </g>

            {/* Radiating Lightbulb / Key Core */}
            <g transform="translate(34, 30) scale(1.15)">
              {/* Lightbulb Dome */}
              <path d="M14 2 C8.5 2, 5 6.5, 5 12 C5 16, 8 19, 10 21 L10 25 C10 26, 11.5 27, 14 27 C16.5 27, 18 26, 18 25 L18 21 C20 19, 23 16, 23 12 C23 6.5, 19.5 2, 14 2 Z" fill="#7c2d12" fillOpacity="0.4" stroke="#fdba74" strokeWidth="1.5" />
              
              {/* Golden Star radiating core inside */}
              <g transform="translate(9, 7) scale(1)" filter="url(#badge-glow)">
                <path d="M5,0 L6.5,3.5 L10,5 L6.5,6.5 L5,10 L3.5,6.5 L0,5 L3.5,3.5 Z" fill="url(#grad-teach-star)" />
              </g>
              
              {/* Filament wire details */}
              <path d="M10 16 L12 12 L16 12 L18 16" fill="none" stroke="#f97316" strokeWidth="1.2" />
              <rect x="11" y="22" width="6" height="1.5" fill="#f97316" rx="0.5" />
            </g>

            {/* Sparkling stars */}
            <g transform="translate(74, 20) scale(0.7)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#ffffff" />
            </g>
            <g transform="translate(18, 64) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="url(#grad-teach-star)" />
            </g>

            {/* Title Banner */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#431407" stroke="url(#grad-teach-star)" strokeWidth="1" />
              <text x="35" y="9" fill="#f97316" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                SKILL EDUCATOR
              </text>
            </g>
          </>
        );

      default:
        // Default glowing trophy badge for general completed projects
        return (
          <>
            {/* Hexagon Shield Frame */}
            <polygon points="50,5 92,25 92,75 50,95 8,75 8,25" fill="url(#grad-teach-bg)" filter="url(#badge-shadow)" />
            {/* Inner Gold Border */}
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="none" stroke="url(#grad-teach-star)" strokeWidth="2.5" />

            <g transform="translate(33, 31) scale(1.15)">
              {/* Trophy Cup */}
              <path d="M6 4 H22 V12 C22 17, 18 20, 14 20 C10 20, 6 17, 6 12 Z" fill="#7c2d12" fillOpacity="0.4" stroke="url(#grad-teach-star)" strokeWidth="1.5" />
              <path d="M14 20 V25" stroke="url(#grad-teach-star)" strokeWidth="2" />
              <rect x="9" y="24" width="10" height="3" rx="1.5" fill="#ea580c" stroke="url(#grad-teach-star)" strokeWidth="1" />
              
              {/* Sparkling star overlay */}
              <g transform="translate(11, 7) scale(0.6)" filter="url(#badge-glow)">
                <path d="M5,0 L6.5,3.5 L10,5 L6.5,6.5 L5,10 L3.5,6.5 L0,5 L3.5,3.5 Z" fill="#ffffff" />
              </g>
            </g>

            {/* Sparkles */}
            <g transform="translate(74, 20) scale(0.7)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="#ffffff" />
            </g>
            <g transform="translate(18, 64) scale(0.6)">
              <path d="M0,5 L3,3 L5,0 L7,3 L10,5 L7,7 L5,10 L3,7 Z" fill="url(#grad-teach-star)" />
            </g>

            {/* Title Banner */}
            <g transform="translate(15, 78)">
              <rect x="0" y="0" width="70" height="12" rx="4" fill="#431407" stroke="url(#grad-teach-star)" strokeWidth="1" />
              <text x="35" y="9" fill="#f97316" fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                COMPLETED
              </text>
            </g>
          </>
        );
    }
  };

  const badgeElement = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none ${locked ? "grayscale opacity-50" : ""}`}
    >
      {renderDefs()}
      {getBadgeContent()}
    </svg>
  );

  if (interactive && !locked) {
    return (
      <motion.div
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 15 }}
        className="inline-block cursor-pointer"
      >
        {badgeElement}
      </motion.div>
    );
  }

  return <div className="inline-block">{badgeElement}</div>;
}
