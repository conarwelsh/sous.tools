"use client";

import React, { useState, useEffect, useRef } from "react";

// --- Types & Config ---

export type LogoEnvironment = "production" | "development" | "staging";
export type LogoAnimState = "static" | "subtle" | "loading";

export interface AtelierLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  environment?: LogoEnvironment;
  animState?: LogoAnimState;
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

const getLOD = (size: number): "micro" | "medium" | "macro" => {
  if (size < 32) return "micro";
  if (size < 80) return "medium";
  return "macro";
};

// --- Animation Hook ---
const useAnimationLoop = (
  callback: (time: number) => void,
  active: boolean,
) => {
  const requestRef = useRef<number>(undefined);
  const startTimeRef = useRef<number>(undefined);

  const loop = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const deltaTime = time - startTimeRef.current;
    const tick = deltaTime / 16;
    callback(tick);
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (active) {
      requestRef.current = requestAnimationFrame(loop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      startTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [active, callback]);
};

// --- DOMAIN ICONS ---

export const ApiLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const pad = (lod as string) === "micro" ? size * 0.05 : size * 0.2;
  const s = size;

  const caretRef = useRef<SVGTextElement>(null);
  const textGroupRef = useRef<SVGGElement>(null);

  useAnimationLoop((tick) => {
    if (!caretRef.current) return;
    if (animState === "loading") {
      const rot = (tick * 5) % 360;
      caretRef.current.setAttribute("transform", `rotate(${rot})`);
      caretRef.current.textContent = ">";
    } else if (animState === "subtle") {
      caretRef.current.setAttribute("transform", "rotate(0)");
      if (lod !== "micro") {
        caretRef.current.textContent =
          Math.floor(tick / 60) % 2 === 0 ? ">_" : ">";
      }
    } else {
      caretRef.current.setAttribute("transform", "rotate(0)");
      caretRef.current.textContent = (lod as string) === "micro" ? ">" : ">_";
    }
  }, animState !== "static");

  const fontSize = (lod as string) === "micro" ? s * 0.5 : s * 0.35;
  const textY = pad + s * 0.15;
  const textX = s / 2;

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d={`M${pad},${pad + s * 0.2} L${pad},${pad + s * 0.5} Q${pad},${s - pad} ${s / 2},${s - pad} Q${s - pad},${s - pad} ${s - pad},${pad + s * 0.5} L${s - pad},${pad + s * 0.2}`}
        stroke={t.main}
        strokeWidth={(lod as string) === "micro" ? s * 0.12 : s * 0.08}
      />
      <g ref={textGroupRef} transform={`translate(${textX}, ${textY})`}>
        <text
          ref={caretRef}
          x="0"
          y={(lod as string) === "micro" ? s / 2 - textY : 0}
          fill={t.sec}
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          dominantBaseline={(lod as string) === "micro" ? "middle" : "hanging"}
        >
          {(lod as string) === "micro" ? ">" : ">_"}
        </text>
      </g>
    </svg>
  );
};

export const AtelierLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;
  const pad = (lod as string) === "micro" ? s * 0.05 : s * 0.2;
  const w = s - pad * 2;
  const h = s - pad * 2;
  const liquidY = (lod as string) === "micro" ? pad + h * 0.8 : pad + h * 0.5;
  const neckTop = pad;

  const bubblesRef = useRef(
    Array.from({ length: 12 }, () => ({
      y: s + Math.random() * s * 0.5,
      x: s / 2 + (Math.random() - 0.5) * (w * 0.4),
      phase: Math.random() * Math.PI * 2,
      speed: 0,
      alpha: 0,
      r: 0,
    })),
  );

  const bubbleElementsRef = useRef<(SVGCircleElement | null)[]>([]);

  useAnimationLoop((tick) => {
    if (animState === "static") return;
    const isLoading = animState === "loading";
    const center = s / 2;

    bubblesRef.current.forEach((b, i) => {
      const el = bubbleElementsRef.current[i];
      if (!el) return;

      const baseR = s * (isLoading ? 0.05 : 0.02);
      b.r = baseR;
      b.speed = isLoading
        ? 0.6 + Math.random() * 0.1
        : 0.2 + Math.random() * 0.05;
      b.y -= b.speed;

      if (b.y > liquidY) {
        let maxW = w * 0.4;
        if (b.y < neckTop + h * 0.4) maxW = w * 0.12;
        else if (b.y < neckTop + h * 0.6) maxW = w * 0.2;
        if (b.x < center - maxW) b.x += 0.5;
        if (b.x > center + maxW) b.x -= 0.5;
        b.x += Math.sin(b.y * 0.05 + b.phase) * 0.3;
      } else {
        b.x += Math.sin(b.y * 0.02 + b.phase) * 0.5;
      }

      if (b.y < s && b.y > liquidY) b.alpha = Math.min(0.6, b.alpha + 0.05);
      if (b.y < liquidY) b.alpha = 1;
      if (b.y < 0) b.alpha -= 0.05;

      if (b.y < -s * 0.2 || b.alpha <= 0) {
        b.y = s + Math.random() * s * 0.5;
        b.x = s / 2 + (Math.random() - 0.5) * (w * 0.4);
        b.alpha = 0;
      }

      el.setAttribute("cx", b.x.toString());
      el.setAttribute("cy", b.y.toString());
      el.setAttribute("r", b.r.toString());
      el.setAttribute("fill-opacity", b.alpha.toString());
    });
  }, animState !== "static");

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <clipPath id={`flaskClip-${s}`}>
          <rect x="0" y="0" width={s} height={pad + h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#flaskClip-${s})`}>
        <path
          d={`M${pad + w * 0.35},${pad} L${pad + w * 0.35},${pad + h * 0.4} L${pad},${pad + h} L${pad + w},${pad + h} L${pad + w * 0.65},${pad + h * 0.4} L${pad + w * 0.65},${pad}`}
          stroke={t.main}
          strokeWidth={(lod as string) === "micro" ? s * 0.1 : s * 0.06}
        />
        <path
          d={`M${pad + w * 0.28},${liquidY} L${pad},${pad + h} L${pad + w},${pad + h} L${pad + w * 0.72},${liquidY} Z`}
          fill={t.main}
          fillOpacity="0.3"
          stroke="none"
        />
        {bubblesRef.current.map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              bubbleElementsRef.current[i] = el;
            }}
            fill={t.sec}
            r="0"
            cx="0"
            cy="0"
          />
        ))}
        <path
          d={`M${pad + w * 0.35},${pad} L${pad + w * 0.35},${pad + h * 0.4} L${pad},${pad + h} L${pad + w},${pad + h} L${pad + w * 0.65},${pad + h * 0.4} L${pad + w * 0.65},${pad}`}
          stroke={t.main}
          strokeWidth={(lod as string) === "micro" ? s * 0.1 : s * 0.06}
          fill="none"
        />
      </g>
      {lod !== "micro" && (
        <line
          x1={pad + w * 0.25}
          y1={pad}
          x2={pad + w * 0.75}
          y2={pad}
          stroke={t.main}
          strokeWidth={(lod as string) === "micro" ? s * 0.1 : s * 0.06}
        />
      )}
    </svg>
  );
};

export const DocsLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  lod: forcedLod,
  animState,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;
  const pad = (lod as string) === "micro" ? s * 0.05 : s * 0.15;
  const w = s - pad * 2;
  const h = s - pad * 2;
  const corner = s * 0.25;
  const cx = pad + w / 2;
  const cy = pad + h / 2 + s * 0.05;
  const iS = s * 0.25;

  const applePath =
    (lod as string) === "micro"
      ? `M${cx - s * 0.15},${cy - s * 0.1} m-${iS / 2},0 a${iS / 2},${iS / 2} 0 1,0 ${iS},0 a${iS / 2},${iS / 2} 0 1,0 -${iS},0`
      : `M${cx - s * 0.15},${cy - s * 0.1} c-${iS},-${iS / 2} -${iS},${iS} 0,${iS} c${iS},0 ${iS},-${iS * 1.5} 0,-${iS}`;

  const carrotPath =
    (lod as string) === "micro"
      ? `M${cx + s * 0.15},${cy + s * 0.1} m-${iS * 0.3},0 a${iS * 0.3},${iS * 0.6} 0 1,0 ${iS * 0.6},0 a${iS * 0.3},${iS * 0.6} 0 1,0 -${iS * 0.6},0`
      : `M${cx + s * 0.15 - iS * 0.3},${cy + s * 0.1 - iS * 0.4} l${iS * 0.3},${iS} l${iS * 0.3},-${iS} q-${iS * 0.3},-${iS * 0.1} -${iS * 0.6},0`;

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d={`M${pad},${pad} L${pad + w - corner},${pad} L${pad + w},${pad + corner} L${pad + w},${pad + h} L${pad},${pad + h} Z`}
        stroke={t.main}
        strokeWidth={(lod as string) === "micro" ? s * 0.1 : s * 0.06}
      />
      <path
        d={`M${pad + w - corner},${pad} L${pad + w - corner},${pad + corner} L${pad + w},${pad + corner} Z`}
        fill={t.sec}
      />
      <path d={applePath} stroke={t.sec} strokeWidth={s * 0.08} fill="none" />
      {lod !== "micro" && (
        <path
          d={carrotPath}
          stroke={t.sec}
          strokeWidth={s * 0.08}
          fill="none"
        />
      )}
    </svg>
  );
};

export const PosLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const pad = (lod as string) === "micro" ? 5 : 15;

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
      <style>{`@keyframes swipe-card { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(10px); } }`}</style>
      <rect
        x={pad}
        y={pad + 30}
        width={100 - pad * 2}
        height={50}
        rx={5}
        stroke={t.main}
        strokeWidth={(lod as string) === "micro" ? 10 : 6}
      />
      <g
        style={
          animState !== "static"
            ? { animation: "swipe-card 2s infinite ease-in-out" }
            : {}
        }
      >
        <rect
          x={pad + 10}
          y={pad + 10}
          width={60}
          height={40}
          rx={4}
          fill={t.bg}
          stroke={t.sec}
          strokeWidth={4}
        />
        <rect x={pad + 15} y={pad + 20} width={10} height={8} fill={t.main} />
      </g>
      <rect x={pad + 80} y={pad + 40} width={5} height={30} fill={t.sec} />
    </svg>
  );
};

export const KdsLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const pad = (lod as string) === "micro" ? 5 : 15;

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
      <style>{`@keyframes fade-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
      <path
        d={`M${pad + 15},${pad} L${100 - pad - 15},${pad} L${100 - pad - 15},${100 - pad - 5} L80,${100 - pad} L70,${100 - pad - 5} L60,${100 - pad} L50,${100 - pad - 5} L40,${100 - pad} L30,${100 - pad - 5} L${pad + 15},${100 - pad} Z`}
        fill={t.sec}
        stroke={t.main}
        strokeWidth={4}
      />
      <g
        fill={t.muted}
        style={
          animState === "loading" ? { animation: "fade-pulse 1s infinite" } : {}
        }
      >
        <rect x={pad + 25} y={pad + 20} width={40} height={5} />
        <rect x={pad + 25} y={pad + 35} width={30} height={5} />
        <rect x={pad + 25} y={pad + 50} width={40} height={5} />
      </g>
    </svg>
  );
};

export const SignageLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  lod: forcedLod,
  animState,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;
  const pad = (lod as string) === "micro" ? s * 0.05 : s * 0.2;
  const bx = s / 2;
  const by = pad + s * 0.45;
  const bw = s * 0.15;
  const burgerPath = `M${bx - bw / 2},${by} a${bw / 2},${bw / 2} 0 0,1 ${bw},0 M${bx - bw / 2},${by + bw * 0.3} h${bw} M${bx - bw / 2},${by + bw * 0.7} h${bw}`;

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d={`M${s / 2},${pad + s * 0.6} L${s / 2},${pad + s * 0.75} M${s / 2 - s * 0.15},${pad + s * 0.75} L${s / 2 + s * 0.15},${pad + s * 0.75}`}
        stroke={t.main}
        strokeWidth={s * 0.06}
      />
      <rect
        x={pad}
        y={pad + s * 0.1}
        width={s - pad * 2}
        height={s * 0.5}
        rx={s * 0.05}
        stroke={t.main}
        strokeWidth={s * 0.06}
      />
      {(lod as string) === "micro" ? (
        <g fill={t.sec}>
          <rect
            x={pad + s * 0.2}
            y={pad + s * 0.25}
            width={s * 0.6}
            height={s * 0.05}
          />
          <rect
            x={pad + s * 0.2}
            y={pad + s * 0.35}
            width={s * 0.6}
            height={s * 0.05}
          />
          <rect
            x={pad + s * 0.2}
            y={pad + s * 0.45}
            width={s * 0.4}
            height={s * 0.05}
          />
        </g>
      ) : (
        <g>
          <text
            x={s / 2}
            y={pad + s * 0.28}
            fontSize={s * 0.12}
            fontWeight="bold"
            fill={t.sec}
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            MENU
          </text>
          <path d={burgerPath} stroke={t.sec} strokeWidth={s * 0.04} />
        </g>
      )}
    </svg>
  );
};

// --- BRAND ASSETS ---

/**
 * Asset: BrandMorph
 * Concept: The Pot drawing itself into The Cloud and back (Stroke Morphing)
 */
export const BrandMorph: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState,
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;
  const pad = (lod as string) === "micro" ? s * 0.05 : s * 0.2;

  const potPathRef = useRef<SVGPathElement>(null);
  const potTextRef = useRef<SVGTextElement>(null);
  const cloudPathRef = useRef<SVGPathElement>(null);
  const headbandRef = useRef<SVGPathElement>(null);

  useAnimationLoop((tick) => {
    const cycle = (tick % 400) / 400;
    const setDash = (
      el: SVGPathElement | null,
      len: number,
      progress: number,
    ) => {
      if (el) el.style.strokeDasharray = `${len * progress} ${len}`;
    };

    if (cycle < 0.5) {
      let progress = 0;
      if (cycle < 0.2) progress = cycle / 0.2;
      else if (cycle < 0.3) progress = 1;
      else progress = 1 - (cycle - 0.3) / 0.2;

      if (cloudPathRef.current) cloudPathRef.current.style.opacity = "0";
      if (headbandRef.current) headbandRef.current.style.opacity = "0";
      if (potPathRef.current) {
        potPathRef.current.style.opacity = "1";
        setDash(potPathRef.current, s * 4, progress);
      }
      if (potTextRef.current)
        potTextRef.current.style.opacity = progress.toString();
    } else {
      const sub = cycle - 0.5;
      let progress = 0;
      if (sub < 0.2) progress = sub / 0.2;
      else if (sub < 0.3) progress = 1;
      else progress = 1 - (sub - 0.3) / 0.2;

      if (potPathRef.current) potPathRef.current.style.opacity = "0";
      if (potTextRef.current) potTextRef.current.style.opacity = "0";
      if (cloudPathRef.current) {
        cloudPathRef.current.style.opacity = "1";
        setDash(cloudPathRef.current, 300, progress);
      }
      if (headbandRef.current) {
        headbandRef.current.style.opacity = "1";
        setDash(headbandRef.current, 100, progress);
      }
    }
  }, true);

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        ref={potPathRef}
        d={`M${pad},${pad + s * 0.2} L${pad},${pad + s * 0.5} Q${pad},${s - pad} ${s / 2},${s - pad} Q${s - pad},${s - pad} ${s - pad},${pad + s * 0.5} L${s - pad},${pad + s * 0.2}`}
        stroke={t.main}
        strokeWidth={s * 0.08}
      />
      <text
        ref={potTextRef}
        x={s / 2}
        y={pad + s * 0.15}
        fill={t.sec}
        fontSize={s * 0.35}
        fontWeight="bold"
        fontFamily="monospace"
        textAnchor="middle"
        dominantBaseline="hanging"
      >
        {">_"}
      </text>

      {/* Cloud Part - Scaled up for Micro */}
      <g
        transform={`translate(${s / 2},${s / 2}) scale(${(lod as string) === "micro" ? (s / 100) * 1.5 : s / 100}) translate(-50, ${(lod as string) === "micro" ? -45 : -50})`}
      >
        <path
          ref={cloudPathRef}
          d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
          stroke={t.main}
          strokeWidth={(lod as string) === "micro" ? 6 : 4}
        />
        <path
          ref={headbandRef}
          d="M30 65 L70 65"
          stroke={t.sec}
          strokeWidth={4}
        />
      </g>
    </svg>
  );
};

/**
 * Asset: BrandHatGear
 * Concept: "Mecha-Chef"
 */
export const BrandHatGear: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;
  const baseScale = (lod as string) === "micro" ? 1.2 : 1.0;

  const gearRef = useRef<SVGGElement>(null);

  useAnimationLoop((tick) => {
    if (animState === "static" || !gearRef.current) return;
    const speed = animState === "loading" ? 2 : 0.5;
    const rot = (tick * speed) % 360;
    gearRef.current.setAttribute(
      "transform",
      `translate(50, 72) rotate(${rot})`,
    );
  }, true);

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g
        transform={`translate(${s / 2},${s / 2}) scale(${(s / 100) * baseScale}) translate(-50,-50)`}
      >
        <g ref={gearRef} transform="translate(50, 72)">
          <circle r="16" fill={t.sec} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="-6"
              y="-24"
              width="12"
              height="14"
              fill={t.sec}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r="7" fill={t.bg} />
        </g>
        <path
          d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
          fill={t.bg}
          stroke={t.main}
          strokeWidth={4}
        />
        <path d="M30 65 L70 65" stroke={t.sec} strokeWidth={4} />
        {lod === "macro" && (
          <path d="M30 72 L70 72" stroke={t.sec} strokeWidth={4} />
        )}
      </g>
    </svg>
  );
};

/**
 * Asset: BrandWhisk
 */
export const BrandWhisk: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;
  const pad = (lod as string) === "micro" ? s * 0.05 : s * 0.2;

  const bulbRef = useRef<SVGGElement>(null);
  useAnimationLoop((tick) => {
    if (!bulbRef.current || animState === "static") return;
    if (animState === "loading") {
      const scale = Math.cos(tick / 15);
      bulbRef.current.setAttribute(
        "transform",
        `translate(${s / 2}, ${s * 0.65}) scale(${scale}, 1)`,
      );
    } else {
      const rot = Math.sin(tick / 60) * 10;
      bulbRef.current.setAttribute(
        "transform",
        `translate(${s / 2}, ${s * 0.65}) rotate(${rot})`,
      );
    }
  }, animState !== "static");

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line
        x1={s / 2}
        y1={pad}
        x2={s / 2}
        y2={s * 0.45}
        stroke={t.sec}
        strokeWidth={s * 0.08}
      />
      <g ref={bulbRef} transform={`translate(${s / 2}, ${s * 0.65})`}>
        <text
          x="0"
          y="0"
          fill={t.main}
          fontSize={s * 0.6}
          fontWeight={(lod as string) === "micro" ? "normal" : "bold"}
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
 * Asset: BrandCloud
 */
export const BrandCloud: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;

  // FIX: Micro scaling (1.5x) and centering
  const baseScale = (lod as string) === "micro" ? 1.5 : 1.0;
  const yOffset = (lod as string) === "micro" ? -45 : -50;

  const style =
    animState === "loading"
      ? { animation: "draw-path 2s infinite linear" }
      : animState === "subtle"
        ? { animation: "fade-pulse 2s infinite" }
        : {};

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <style>{`@keyframes draw-path { 0% { stroke-dashoffset: 300; } 50% { stroke-dashoffset: 0; } } @keyframes fade-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
      <g
        transform={`translate(${s / 2},${s / 2}) scale(${(s / 100) * baseScale}) translate(-50, ${yOffset})`}
      >
        <path
          d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
          stroke={t.main}
          strokeWidth={(lod as string) === "micro" ? 6 : 4}
          strokeDasharray={animState === "loading" ? "300" : "none"}
          style={style}
        />
        {lod !== "micro" && (
          <path d="M30 65 L70 65" stroke={t.sec} strokeWidth={4} />
        )}
      </g>
    </svg>
  );
};

export const BrandKitchenLine: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <style>{`@keyframes draw-path { 0% { stroke-dashoffset: 300; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }`}</style>
      <g transform={`scale(${s / 100})`}>
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="25"
          stroke={t.sec}
          strokeWidth={3}
        />
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
      </g>
    </svg>
  );
};

/**
 * Asset: KioskLogo
 */
export const KioskLogo: React.FC<AtelierLogoProps> = ({
  size = 64,
  environment,
  animState = "static",
  lod: forcedLod,
  ...props
}) => {
  const t = getTheme(environment);
  const lod = (forcedLod || getLOD(size)) as "micro" | "medium" | "macro";
  const s = size;

  return (
    <svg
      viewBox="0 0 100 100"
      width={s}
      height={s}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect
        x="20"
        y="20"
        width="60"
        height="45"
        rx="8"
        stroke={t.main}
        strokeWidth="6"
      />
      <path d="M35 80 L65 80 M50 65 L50 80" stroke={t.main} strokeWidth="6" />
      <path
        d="M40 42 L45 42 L48 35 L60 35 L57 42 L65 42"
        stroke={t.sec}
        strokeWidth="4"
      />
      <circle cx="48" cy="50" r="3" fill={t.sec} />
      <circle cx="57" cy="50" r="3" fill={t.sec} />
    </svg>
  );
};
