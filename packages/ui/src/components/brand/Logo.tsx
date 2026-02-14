import React from "react";
import { theme } from "../../theme/tokens";
import {
  ApiLogo,
  AtelierLogo,
  DocsLogo,
  PosLogo,
  KdsLogo,
  SignageLogo,
  KioskLogo,
  BrandMorph,
  BrandCloud,
  BrandWhisk,
  BrandHatGear,
  BrandKitchenLine,
  LogoAnimState,
  LogoEnvironment,
} from "./AtelierLogos";

export type LogoVariant =
  | "cloud"
  | "api"
  | "morph"
  | "whisk"
  | "hat-and-gear"
  | "kitchen-line"
  | "pos"
  | "kds"
  | "signage"
  | "kiosk"
  | "tools"
  | "neon"
  | "circuit"
  | "line"
  | "plate";

export type Environment = "production" | "development" | "staging";

export interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  showWordmark?: boolean;
  suffix?: string;
  environment?: Environment;
  animate?: boolean;
  loading?: boolean;
  className?: string;
  color?: string; // Manual override
}

const getEnvironmentColor = (env: Environment) => {
  switch (env) {
    case "development":
      return theme.colors.success;
    case "staging":
      return theme.colors.warning;
    case "production":
    default:
      return theme.colors.primary;
  }
};

export const Wordmark: React.FC<{
  size?: number;
  suffix?: string;
  className?: string;
  color?: string;
  environment?: Environment;
}> = ({
  size = 24,
  suffix = "tools",
  className,
  color,
  environment = "production",
}) => {
  const baseColor = color || getEnvironmentColor(environment);

  return (
    <div className={`flex flex-row items-baseline ${className}`}>
      <span
        className="text-foreground"
        style={{
          fontSize: size * 0.75,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          fontFamily: "var(--font-brand)",
        }}
      >
        SOUS
      </span>
      <span
        style={{
          fontSize: size * 0.75,
          fontWeight: 400,
          color: baseColor,
          marginLeft: 2,
          fontFamily: "var(--font-mono)",
        }}
      >
        .
      </span>
      <span
        style={{
          fontSize: size * 0.75,
          fontWeight: 400,
          color: "var(--color-muted-foreground, #52525b)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {suffix}
      </span>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = "cloud",
  size = 32,
  showWordmark = true,
  suffix = "tools",
  environment = "production",
  animate = false,
  loading = false,
  className,
  color,
}) => {
  const animState: LogoAnimState = loading
    ? "loading"
    : animate
      ? "subtle"
      : "static";
  const logoEnv: LogoEnvironment = environment;

  const renderIcon = () => {
    switch (variant) {
      case "api":
        return (
          <ApiLogo size={size} environment={logoEnv} animState={animState} />
        );
      case "neon":
      case "cloud":
        return (
          <BrandCloud size={size} environment={logoEnv} animState={animState} />
        );
      case "morph":
        return (
          <BrandMorph size={size} environment={logoEnv} animState={animState} />
        );
      case "whisk":
        return (
          <BrandWhisk size={size} environment={logoEnv} animState={animState} />
        );
      case "circuit":
      case "hat-and-gear":
        return (
          <BrandHatGear
            size={size}
            environment={logoEnv}
            animState={animState}
          />
        );
      case "plate":
      case "kitchen-line":
        return (
          <BrandKitchenLine
            size={size}
            environment={logoEnv}
            animState={animState}
          />
        );
      case "pos":
        return (
          <PosLogo size={size} environment={logoEnv} animState={animState} />
        );
      case "kds":
        return (
          <KdsLogo size={size} environment={logoEnv} animState={animState} />
        );
      case "signage":
        return (
          <SignageLogo
            size={size}
            environment={logoEnv}
            animState={animState}
          />
        );
      case "kiosk":
        return (
          <KioskLogo size={size} environment={logoEnv} animState={animState} />
        );
      case "tools":
      case "line":
        return (
          <DocsLogo size={size} environment={logoEnv} animState={animState} />
        );
      default:
        return (
          <BrandCloud size={size} environment={logoEnv} animState={animState} />
        );
    }
  };

  return (
    <div
      className={`flex flex-row items-center ${className}`}
      style={{ gap: size * 0.25 }}
    >
      <div style={{ width: size, height: size }}>{renderIcon()}</div>
      {showWordmark && (
        <Wordmark
          size={size}
          suffix={suffix}
          color={color || getEnvironmentColor(environment)}
          environment={environment}
        />
      )}
    </div>
  );
};
