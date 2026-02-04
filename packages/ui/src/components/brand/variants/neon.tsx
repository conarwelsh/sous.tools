import React, { useId } from 'react';
import { Svg, G, Path, Circle, Defs, Filter, FeGaussianBlur, FeMerge, FeMergeNode, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { LogoProps } from '../logo-types';
import { getEnvColor as getEnvColorUtil } from '../logo-utils';
import { cn } from '../../lib/utils';

export const NeonLogo: React.FC<LogoProps> = ({
  isAnimated = false,
  isLoading = false,
  showWordmark,
  showTagline,
  detailLevel,
  environment = 'production',
  size = 64,
  className,
  style,
  simplified,
  wordmark = "sous.tools",
  tagline = "Restaurant Management OS",
  ...props
}) => {
  const glowId = useId();
  const cometGradientId = useId();
  const brandColor = getEnvColorUtil(environment);

  const sizeNum =
    typeof size === 'number' ? size : parseInt(String(size)) || 64;

  const effectiveDetailLevel = simplified
    ? 'low'
    : (detailLevel ??
      (sizeNum < 32 ? 'low' : sizeNum < 80 ? 'medium' : 'high'));

  const effectiveShowWordmark = showWordmark ?? sizeNum >= 32;
  const effectiveShowTagline = showTagline ?? sizeNum >= 80;

  const dimension = typeof size === 'number' ? size : parseInt(String(size)) || 64;
  const viewWidth = effectiveShowWordmark ? 350 : 100;
  const viewHeight = 100;

  const parts = wordmark.split('.');
  const main = parts[0] || 'sous';
  const tld = parts[1] || 'tools';

  return (
    <Svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      fill="none"
      className={cn(
        "overflow-visible",
        className,
      )}
      width={effectiveShowWordmark ? dimension * 3.5 : dimension}
      height={dimension}
      {...props}
    >
      <Defs>
        <Filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <FeGaussianBlur
            stdDeviation={
              effectiveDetailLevel === 'low'
                ? 0
                : effectiveDetailLevel === 'medium'
                  ? 1.5
                  : 3
            }
            result="coloredBlur"
          />
          <FeMerge>
            <FeMergeNode in="coloredBlur" />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>

        <LinearGradient id={cometGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={brandColor} stopOpacity="0" />
          <Stop offset="100%" stopColor={brandColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      <G filter={`url(#${glowId})`}>
        <Path
          d="M30 65 H70"
          stroke={brandColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {effectiveDetailLevel !== 'low' && (
          <Path
            d="M30 72 H70"
            stroke={brandColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        <Path
          d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65"
          stroke={brandColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {effectiveShowWordmark && (
        <G translate="110, 32">
          {/* Main wordmark text */}
          <SvgText
            x="0"
            y="35"
            fill="white"
            fontSize="52"
            fontWeight="900"
            fontFamily="System"
          >
            {main}
          </SvgText>
          
          <SvgText
            x={main.length * 27 + 2}
            y="35"
            fill={brandColor}
            fontSize="52"
            fontWeight="900"
          >
            .
          </SvgText>

          <SvgText
            x={main.length * 27 + 20}
            y="32"
            fill="white"
            fillOpacity="0.6"
            fontSize="32"
            fontWeight="500"
            letterSpacing="0.1em"
          >
            {tld}
          </SvgText>

          {effectiveShowTagline && effectiveDetailLevel !== 'low' && (
            <SvgText
              x="2"
              y="52"
              fill="white"
              fillOpacity="0.4"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.45em"
            >
              {tagline.toUpperCase()}
            </SvgText>
          )}
        </G>
      )}
    </Svg>
  );
};
