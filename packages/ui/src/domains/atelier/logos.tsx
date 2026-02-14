import React, { useState, useMemo } from "react";

// --- Types & Utilities ---

export type LogoEnvironment = "production" | "development" | "staging";
export type LogoAnimState = "static" | "subtle" | "loading";

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  environment?: LogoEnvironment;
  animState?: LogoAnimState;
  /** Force specific detail level, otherwise calculated by size */
  lod?: "micro" | "medium" | "macro";
}

const THEME = {
  production: "#0091FF",
  development: "#10b981",
  staging: "#a855f7",
  sec: "#FFFFFF",
  muted: "#52525b",
  bg: "#0B0B0E",
};

const getTheme = (env: LogoEnvironment = "production") => ({
  main: THEME[env],
  sec: THEME.sec,
  muted: THEME.muted,
  bg: THEME.bg,
});

const getLOD = (size: number) => {
  if (size < 32) return "micro";
  if (size < 80) return "medium";
  return "macro";
};

/**
 * Shared Styles for Animations
 */
const GlobalStyles = () => (
  <style>{`
    @keyframes spin-slow { to { transform: rotate(360deg); } }
    @keyframes spin-fast { to { transform: rotate(360deg); } }
    @keyframes float-up { 
      0% { transform: translateY(0) scale(0.8); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translateY(-120px) scale(1.1); opacity: 0; }
    }
    @keyframes draw-path {
      0% { stroke-dashoffset: 300; }
      50% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes fade-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes rock {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }
    @keyframes spin-y {
      0% { transform: scaleX(1); }
      25% { transform: scaleX(0); }
      50% { transform: scaleX(-1); }
      75% { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
    @keyframes swipe-card {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(10px); }
    }
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    @keyframes morph-draw-pot {
      0%, 20% { stroke-dashoffset: 0; opacity: 1; } /* Draw/Hold */
      30%, 100% { stroke-dashoffset: 300; opacity: 0; } /* Undraw/Wait */
    }
    @keyframes morph-draw-cloud {
      0%, 30% { stroke-dashoffset: 300; opacity: 0; } /* Wait */
      40%, 60% { stroke-dashoffset: 0; opacity: 1; } /* Draw/Hold */
      70%, 100% { stroke-dashoffset: 300; opacity: 0; } /* Undraw */
    }
  `}</style>
);

// --- DOMAIN ICONS ---

/**
 * Domain: sous.atelier
 * Concept: "The Flask" (Chemistry/Experiments) - Refined to match reference image.
 */
export const AtelierLogo: React.FC<LogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = forcedLod || getLOD(size);
  const pad = lod === "micro" ? 5 : 20;

  // Adjust liquid level and bubble position based on flask shape
  // The flask bottom is now defined up to y=90.
  // Liquid level should be below the neck, and bubbles should rise from within.
  const liquidY = lod === "micro" ? 65 : 50; // Positioned within the flask body
  const bubbleBaseY = 85; // Base Y for bubbles, just above the flask bottom

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <GlobalStyles />
      <defs>
        {/* Clip path for liquid and bubbles to stay within the flask */}
        {/* Path for a more flask-like shape with curves, matching the reference image */}
        <clipPath id={`flaskClip-${size}`}>
          <path
            d={`M35,${pad} L35,${pad + 40} Q25,${45 + pad} 25,${55 + pad} Q20,${75 + pad} 35,${90} L65,${90} Q80,${75 + pad} 75,${55 + pad} Q75,${45 + pad} 65,${40 + pad} L65,${pad} Z`}
          />
        </clipPath>
      </defs>

      {/* Back Glass */}
      <path
        d={`M35,${pad} L35,${pad + 40} Q25,${45 + pad} 25,${55 + pad} Q20,${75 + pad} 35,${90} L65,${90} Q80,${75 + pad} 75,${55 + pad} Q75,${45 + pad} 65,${40 + pad} L65,${pad} Z`}
        stroke={t.main}
        strokeWidth={lod === "micro" ? 10 : 6}
      />

      {/* Liquid & Bubbles */}
      <g clipPath={`url(#flaskClip-${size})`}>
        <rect
          x="0"
          y={liquidY} // Positioned within the flask body
          width="100"
          height={100 - liquidY} // Fill from liquid level to bottom
          fill={t.main}
          fillOpacity="0.3"
        />
        {animState !== "static" && (
          <g fill={t.sec}>
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                r={lod === "micro" ? 2 : 3}
                // Position bubbles rising from near the liquid bottom
                cx={50}
                cy={bubbleBaseY - i * (lod === "micro" ? 5 : 8)} // Bubbles rise upwards
                style={{
                  animation: `float-up ${2 + i * 0.5}s infinite ease-in`,
                  animationDelay: `${i * 0.4}s`,
                  transformOrigin: "center",
                }}
              />
            ))}
          </g>
        )}
      </g>

      {/* Front Glass Overlay */}
      <path
        d={`M35,${pad} L35,${pad + 40} Q25,${45 + pad} 25,${55 + pad} Q20,${75 + pad} 35,${90} L65,${90} Q80,${75 + pad} 75,${55 + pad} Q75,${45 + pad} 65,${40 + pad} L65,${pad} Z`}
        stroke={t.main}
        strokeWidth={lod === "micro" ? 10 : 6}
      />

      {/* Rim */}
      {lod !== "micro" && (
        <line
          x1="25"
          y1={pad}
          x2="75"
          y2={pad}
          stroke={t.main}
          strokeWidth="6"
        />
      )}
    </svg>
  );
};

/**
 * Asset: BrandMorph
 * Concept: The Pot drawing itself into The Cloud and back
 */
export const BrandMorph: React.FC<LogoProps> = ({
  size = 64,
  environment,
  ...props
}) => {
  const t = getTheme(environment);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <GlobalStyles />
      <g style={{ animation: "morph-draw-pot 6s infinite" }}>
        <path
          d="M20,40 L20,70 Q20,90 50,90 Q80,90 80,70 L80,40"
          stroke={t.main}
          strokeWidth={8}
          strokeDasharray="300"
        />
        <text
          x="50"
          y="45"
          fill={t.sec}
          fontSize="35"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {">_"}
        </text>
      </g>
      <g style={{ animation: "morph-draw-cloud 6s infinite", opacity: 0 }}>
        <path
          d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
          stroke={t.main}
          strokeWidth={4}
          strokeDasharray="300"
        />
        <path d="M30 65 L70 65" stroke={t.sec} strokeWidth={4} />
      </g>
    </svg>
  );
};

/**
 * Asset: BrandCloud
 * Concept: Chef Hat / Cloud
 */
export const BrandCloud: React.FC<LogoProps> = ({
  size = 64,
  environment,
  animState,
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = forcedLod || getLOD(size);
  // Micro adjustment: Scale up and center
  const transform =
    lod === "micro" ? "translate(50, 50) scale(1.4) translate(-50, -50)" : "";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <GlobalStyles />
      <g transform={transform}>
        {lod !== "micro" && (
          <path d="M30 65 L70 65" stroke={t.sec} strokeWidth={4} />
        )}
        {lod === "macro" && (
          <path d="M30 72 L70 72" stroke={t.sec} strokeWidth={4} />
        )}
        <path
          d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
          stroke={t.main}
          strokeWidth={lod === "micro" ? 6 : 4}
          strokeDasharray={animState === "loading" ? "300" : "none"}
          style={
            animState === "loading"
              ? { animation: "draw-path 2s infinite linear" }
              : animState === "subtle"
                ? { animation: "fade-pulse 2s infinite" }
                : {}
          }
        />
      </g>
    </svg>
  );
};

/**
 * Asset: BrandWhisk
 * Concept: Code Brackets as Whisk
 */
export const BrandWhisk: React.FC<LogoProps> = ({
  size = 64,
  environment,
  animState,
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = forcedLod || getLOD(size);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <GlobalStyles />
      {/* Handle */}
      <line x1="50" y1="20" x2="50" y2="45" stroke={t.sec} strokeWidth={8} />

      {/* Bulb (Rotates in 3D) */}
      <g
        style={
          animState !== "static"
            ? {
                transformOrigin: "50px 65px",
                animation:
                  animState === "loading"
                    ? "spin-y 1s infinite linear"
                    : "rock 3s infinite ease-in-out",
              }
            : {}
        }
      >
        <text
          x="50"
          y="65"
          fill={t.main}
          fontSize={60}
          fontWeight={lod === "micro" ? "normal" : "bold"}
          fontFamily="monospace"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {"{ }"}
        </text>
      </g>
    </svg>
  );
};

/**
 * Asset: BrandHatGear
 * Concept: "Mecha-Chef" (Hat on Gear Head)
 */
export const BrandHatGear: React.FC<LogoProps> = ({
  size = 64,
  environment,
  animState,
  ...props
}) => {
  const t = getTheme(environment);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <GlobalStyles />

      {/* The Cog (Head) - Sits at y=72 */}
      <g
        transform="translate(50, 72)"
        style={
          animState !== "static"
            ? {
                animation: `spin-slow ${animState === "loading" ? 2 : 10}s linear infinite`,
              }
            : {}
        }
      >
        {/* Teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <rect
            key={i}
            x="-6"
            y="-24"
            width="12"
            height="14"
            fill={t.sec}
            transform={`rotate(${deg})`}
          />
        ))}
        <circle r="16" fill={t.sec} />
        <circle r="7" fill={t.bg} />
      </g>

      {/* The Hat (Masking the gear) */}
      {/* We fill with BG color to hide top of gear */}
      <path
        d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
        fill={t.bg}
        stroke={t.main}
        strokeWidth={4}
      />

      {/* Headband */}
      <path d="M30 65 L70 65" stroke={t.sec} strokeWidth={4} />
    </svg>
  );
};

/**
 * Asset: BrandKitchenLine
 * Concept: Plate with Pulse Garnish
 */
export const BrandKitchenLine: React.FC<LogoProps> = ({
  size = 64,
  environment,
  animState,
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = forcedLod || getLOD(size);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <GlobalStyles />
      {/* Plate */}
      <ellipse cx="50" cy="50" rx="40" ry="25" stroke={t.sec} strokeWidth={3} />
      {lod !== "micro" && (
        <ellipse
          cx="50"
          cy="50"
          rx="25"
          ry="15"
          stroke={t.muted}
          strokeWidth={2}
        />
      )}

      {/* Pulse */}
      <path
        d="M25 50 L35 40 L45 60 L55 45 L75 50"
        stroke={t.main}
        strokeWidth={6}
        strokeDasharray={animState !== "static" ? "100" : "none"}
        style={
          animState !== "static"
            ? { animation: "draw-path 2s infinite linear" }
            : {}
        }
      />
    </svg>
  );
};
