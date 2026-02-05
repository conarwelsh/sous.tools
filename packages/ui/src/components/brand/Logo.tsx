import React from 'react';
import Svg, { Path, Circle, Rect, G, Defs, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';
import { theme } from '../../theme/tokens';
import { View } from '../ui/view';
import { Text } from '../ui/text';

export type LogoVariant = 
  | 'toque-tall' 
  | 'hat-and-gear' 
  | 'chef-line' 
  | 'line' 
  | 'neon'
  | 'beaker';

export type Environment = 'production' | 'development' | 'staging';

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
    case 'development': return theme.colors.success;
    case 'staging': return theme.colors.warning;
    case 'production': default: return theme.colors.primary;
  }
};

export const Wordmark: React.FC<{
  size?: number;
  suffix?: string;
  className?: string;
  color?: string;
  environment?: Environment;
  wordmark?: string; // For backward compatibility
}> = ({ size = 24, suffix, wordmark, className, color, environment = 'production' }) => {
  const displaySuffix = suffix || (wordmark?.startsWith('sous.') ? wordmark.split('.')[1] : wordmark) || 'tools';
  const baseColor = color || getEnvironmentColor(environment);

  return (
    // @ts-ignore
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }} className={className}>
      {/* @ts-ignore */}
      <Text style={{ 
        fontSize: size * 0.75, 
        fontWeight: '900' as any, 
        letterSpacing: -1, 
        color: baseColor 
      }}>
        SOUS
      </Text>
      {/* @ts-ignore */}
      <Text style={{ 
        fontSize: size * 0.75, 
        fontWeight: '400' as any, 
        color: theme.colors.muted,
        marginLeft: 2,
        fontFamily: 'monospace'
      }}>
        .{displaySuffix}
      </Text>
    </View>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'neon',
  size = 32,
  showWordmark = true,
  suffix = 'tools',
  environment = 'production',
  animate = false,
  loading = false,
  className,
  color,
}) => {
  const baseColor = color || getEnvironmentColor(environment);
  const iconSize = size;
  const strokeWidth = 1.5;

  const renderIcon = () => {
    switch (variant) {
      case 'beaker':
        return (
          <G>
            <Path d="M9 3h6M10 3v7L5 20h14l-5-10V3" />
            <Path d="M8 15h8" strokeOpacity={0.5} />
            {loading && (
              <G transform="translate(12, 12)">
                <Circle cx="-2" cy="0" r="1" fill={baseColor} stroke="none" {...({ className: "animate-pulse" } as any)} />
                <Circle cx="2" cy="-3" r="1" fill={baseColor} stroke="none" {...({ className: "animate-pulse" } as any)} style={{ animationDelay: '0.5s' }} />
                <Circle cx="0" cy="-6" r="1" fill={baseColor} stroke="none" {...({ className: "animate-pulse" } as any)} style={{ animationDelay: '1s' }} />
              </G>
            )}
            {animate && !loading && (
               <Path d="M10 6h4M10 9h4" strokeOpacity={0.3} />
            )}
          </G>
        );

      case 'toque-tall':
        return (
          <G>
            {/* Pulse Border - Circle around the hat */}
            {animate && (
              <Circle 
                cx="12" 
                cy="12" 
                r="11" 
                {...({ className: "animate-[draw_2s_ease-in-out_infinite]" } as any)}
                strokeOpacity={0.5}
              />
            )}
            
            {/* The Hat */}
            <Path d="M7 18h10V6c0-1-1-2-2-2h-6c-1 0-2 1-2 2v12z" />
            <Path d="M7 14h10M10 4v10M14 4v10" />
            <Path d="M6 18h12v3H6v-3z" />
            
            {/* Loading Gear */}
            {loading && (
              <G transform="translate(18, 18)">
                 <G {...({ className: "animate-spin" } as any)} style={{ originX: 0, originY: 0 }}>
                    <Path d="M-3 0h6M0 -3v6" strokeWidth={2} />
                    <Circle r="2" stroke="none" fill={baseColor} />
                 </G>
              </G>
            )}
          </G>
        );

      case 'hat-and-gear':
        return (
          <G transform="scale(0.24)">
            <Circle cx="50" cy="50" r="39" strokeWidth="3.5" />
            <G transform="translate(50, 74)">
               <G {...({ className: loading || animate ? "animate-spin" : "" } as any)} style={{ originX: 0, originY: 0 }}>
                  <Circle cx="0" cy="0" r="14" fill={baseColor} stroke="none" />
                  <Circle cx="0" cy="0" r="8" fill="white" stroke="none" />
                  <Circle cx="0" cy="0" r="5" fill={baseColor} stroke="none" />
               </G>
            </G>
            <G transform="translate(0, 4)">
               <Circle cx="34" cy="38" r="11" fill="none" strokeWidth="3" />
               <Circle cx="66" cy="38" r="11" fill="none" strokeWidth="3" />
               <Circle cx="50" cy="30" r="13" fill="none" strokeWidth="3" />
               <Rect x="28" y="48" width="44" height="16" fill="none" strokeWidth="3" rx="1" />
            </G>
          </G>
        );

      case 'chef-line':
        return (
          <G transform="scale(0.24)">
             <Path
                d="M30 65 H70 M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
                strokeWidth="4"
             />
             <Path
                d="M25 50 H40 L45 35 L55 65 L60 50 H75"
                strokeWidth="5"
                {...({ className: animate ? "animate-pulse" : "" } as any)}
             />
          </G>
        );

      case 'line':
        return (
          <G transform="scale(0.24)">
             <Path
                d="M10 50 H30 L40 30 L50 70 L60 50 H90"
                strokeWidth="8"
                {...({ className: animate ? "animate-pulse" : "" } as any)}
             />
             <Circle cx="50" cy="50" r="45" strokeWidth="1" strokeOpacity="0.2" />
          </G>
        );

      case 'neon':
        return (
          <G transform="scale(0.24)">
             <Defs>
                <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <FeMerge>
                    <FeMergeNode in="coloredBlur" />
                    <FeMergeNode in="SourceGraphic" />
                  </FeMerge>
                </Filter>
             </Defs>
             <G filter="url(#glow)">
                <Path d="M30 65 H70" strokeWidth="4" />
                <Path d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65" strokeWidth="4" />
             </G>
          </G>
        );

      default:
        return <Circle cx="12" cy="12" r="10" />;
    }
  };

  return (
    // @ts-ignore
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.25 }} className={className}>
      {/* @ts-ignore */}
      <View style={{ width: iconSize, height: iconSize }}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
          <G fill="none" stroke={baseColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            {renderIcon()}
          </G>
        </Svg>
      </View>
      {showWordmark && (
        <Wordmark size={size} suffix={suffix} color={baseColor} environment={environment} />
      )}
    </View>
  );
};