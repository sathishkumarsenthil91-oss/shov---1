import React from 'react';

interface ShovLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animated?: boolean;
  lightText?: boolean;
}

export const ShovLogo: React.FC<ShovLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  animated = true,
  lightText = false,
}) => {
  const scaleMap = {
    sm: 'h-8',
    md: 'h-14',
    lg: 'h-24',
    xl: 'h-36',
  };

  const primaryColor = lightText ? '#60a5fa' : '#1e3a8a';
  const textColor = lightText ? '#f8fafc' : '#0f172a';

  return (
    <div className={`inline-flex flex-col items-center select-none group ${className}`}>
      <svg
        viewBox="0 0 720 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${scaleMap[size]} w-auto max-w-full drop-shadow-lg transition-transform duration-300 group-hover:scale-[1.02] ${animated ? 'animate-pulse-glow' : ''}`}
      >
        <defs>
          <linearGradient id="shovBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>

          <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. LEFT SHIELD EMBLEM WITH SECURITY ANIMATIONS */}
        <g className={animated ? 'animate-pulse-subtle' : ''}>
          {/* Base Shield Outer Shape */}
          <path
            d="M80 20 L150 45 C150 120 120 160 80 180 C40 160 10 120 10 45 L80 20 Z"
            fill="none"
            stroke="url(#shieldGrad)"
            strokeWidth="8"
            strokeLinejoin="round"
          />

          {/* Animated Laser Beam Tracing around Shield */}
          {animated && (
            <path
              d="M80 20 L150 45 C150 120 120 160 80 180 C40 160 10 120 10 45 L80 20 Z"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="6"
              strokeLinejoin="round"
              className="animate-logo-beam"
              filter="url(#glowEffect)"
            />
          )}

          {/* Inner Shield Accent */}
          <path
            d="M80 32 L138 53 C138 115 112 150 80 168 C48 150 22 115 22 53 L80 32 Z"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Graduation Cap */}
          <path
            d="M80 50 L115 65 L80 80 L45 65 Z"
            fill="url(#shovBlueGrad)"
          />
          <path d="M115 65 L115 80" stroke="#38bdf8" strokeWidth="3" />
          <path d="M60 72 L60 88 C60 96 100 96 100 88 L100 72" fill="none" stroke="url(#shovBlueGrad)" strokeWidth="3" />

          {/* Student Avatar Silhouette */}
          <circle cx="60" cy="118" r="10" fill="url(#shovBlueGrad)" />
          <path d="M46 142 C46 130 52 132 60 132 C68 132 74 130 74 142 Z" fill="url(#shovBlueGrad)" />

          {/* ID Details lines */}
          <rect x="82" y="112" width="28" height="4" rx="2" fill="#3b82f6" />
          <rect x="82" y="122" width="20" height="4" rx="2" fill="#60a5fa" />

          {/* Mini QR Code Representation with Laser Line */}
          <g transform="translate(82, 132)">
            <rect x="0" y="0" width="24" height="24" rx="3" fill="none" stroke="url(#shovBlueGrad)" strokeWidth="2" />
            <rect x="3" y="3" width="6" height="6" fill="#1e40af" />
            <rect x="15" y="3" width="6" height="6" fill="#1e40af" />
            <rect x="3" y="15" width="6" height="6" fill="#1e40af" />
            <rect x="12" y="12" width="8" height="8" fill="#2563eb" />

            {/* QR Scan Laser */}
            {animated && (
              <line
                x1="0"
                y1="2"
                x2="24"
                y2="2"
                stroke="#38bdf8"
                strokeWidth="2"
                className="animate-dash-flow"
                filter="url(#glowEffect)"
              />
            )}
          </g>
        </g>

        {/* 2. TEXT BRANDING "SHOV" */}
        {/* Letter S with Animated Swoosh */}
        <g transform="translate(160, 25)">
          <path
            d="M 65 30 C 65 10 10 10 10 40 C 10 75 70 60 70 95 C 70 125 10 125 10 100"
            fill="none"
            stroke="url(#shovBlueGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dynamic Animated Swoosh line through S */}
          <path
            d="M -5 70 C 25 50 55 40 85 25"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="6"
            strokeLinecap="round"
            className={animated ? 'animate-dash-flow' : ''}
            filter="url(#glowEffect)"
          />
        </g>

        {/* Letter H */}
        <g transform="translate(260, 25)">
          <rect x="10" y="20" width="22" height="100" rx="4" fill={primaryColor} />
          <rect x="58" y="20" width="22" height="100" rx="4" fill={primaryColor} />
          <rect x="25" y="58" width="40" height="22" rx="2" fill="url(#shovBlueGrad)" />
        </g>

        {/* Letter O with Live Pulsing Fingerprint & Lock */}
        <g transform="translate(370, 25)">
          {/* Outer O circle */}
          <circle cx="55" cy="70" r="48" fill="none" stroke="url(#shovBlueGrad)" strokeWidth="18" />
          
          {/* Fingerprint Archs with scanning animation */}
          <g transform="translate(55, 60)" className={animated ? 'animate-fp-scan' : ''}>
            <path d="M-22 10 A 22 22 0 0 1 22 10" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            <path d="M-15 3 A 15 15 0 0 1 15 3" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M-8 -4 A 8 8 0 0 1 8 -4" fill="none" stroke="#60a5fa" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Lock Icon at bottom of O */}
          <rect x="44" y="80" width="22" height="18" rx="3" fill="#1e3a8a" />
          <path d="M49 80 L49 74 C49 70 61 70 61 74 L61 80" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="55" cy="88" r="2.5" fill="#ffffff" />
        </g>

        {/* Letter V with Glowing Checkmark extension */}
        <g transform="translate(500, 25)">
          <path
            d="M 10 20 L 50 120 L 120 -5"
            fill="none"
            stroke="url(#shovBlueGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Checkmark Accent */}
          <path
            d="M 45 115 L 125 -10"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#glowEffect)"
            className={animated ? 'animate-pulse' : ''}
          />
        </g>

        {/* 3. SUBTITLE "DIGITAL ID" */}
        {showTagline && (
          <g transform="translate(180, 168)">
            {/* Left Divider Line */}
            <line x1="0" y1="12" x2="110" y2="12" stroke="url(#shovBlueGrad)" strokeWidth="3" strokeLinecap="round" />
            
            <text
              x="230"
              y="20"
              fill={textColor}
              fontSize="24"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
              letterSpacing="10"
              textAnchor="middle"
            >
              DIGITAL ID
            </text>

            {/* Right Divider Line */}
            <line x1="350" y1="12" x2="460" y2="12" stroke="url(#shovBlueGrad)" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Feature Badges under Logo */}
      {showTagline && (
        <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-3 text-xs font-bold tracking-widest uppercase ${lightText ? 'text-slate-300' : 'text-slate-700'}`}>
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-400">
            <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>VERIFY</span>
          </div>
          <span className="text-slate-400 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-400">
            <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>IDENTIFY</span>
          </div>
          <span className="text-slate-400 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-400">
            <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>SECURE</span>
          </div>
          <span className="text-slate-400 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-400">
            <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>QR CODE</span>
          </div>
        </div>
      )}
    </div>
  );
};

