import React from 'react';
import { Svg, G, Path, Text as SvgText } from 'react-native-svg';
import { LogoProps } from '../logo-types';
import { getEnvColor as getEnvColorUtil } from '../logo-utils';
import { cn } from '../../lib/utils';

export const LinkLogo: React.FC<LogoProps> = ({
  environment = 'production',
  size = 64,
  showWordmark,
  wordmark = "sous.tools",
  className,
  ...props
}) => {
  const brandColor = getEnvColorUtil(environment);
  const sizeNum = typeof size === 'number' ? size : parseInt(String(size)) || 64;
  const effectiveShowWordmark = showWordmark ?? sizeNum >= 32;
  const dimension = sizeNum;
  const viewWidth = effectiveShowWordmark ? 350 : 100;

  const parts = wordmark.split('.');
  const main = parts[0] || 'sous';
  const tld = parts[1] || 'tools';

  return (
    <Svg
      viewBox={`0 0 ${viewWidth} 100`}
      width={effectiveShowWordmark ? dimension * 3.5 : dimension}
      height={dimension}
      className={cn("overflow-visible", className)}
      {...props}
    >
      <G translate="10, 10">
        <Path
          d="M60 20 H30 Q20 20 20 30 V45 Q20 55 30 55 H50 Q60 55 60 65 V80"
          stroke={brandColor}
          strokeWidth="18"
          strokeLinecap="butt"
          fill="none"
        />
        <Path
          d="M20 60 H50 Q60 60 60 50 V35 Q60 25 50 25 H20"
          stroke={brandColor}
          strokeWidth="18"
          strokeLinecap="butt"
          fill="none"
          opacity="0.8"
        />
      </G>
      
      {effectiveShowWordmark && (
        <G translate="110, 32">
          <SvgText x="0" y="35" fill="white" fontSize="52" fontWeight="900">{main}</SvgText>
          <SvgText x={main.length * 27 + 2} y="35" fill={brandColor} fontSize="52" fontWeight="900">.</SvgText>
          <SvgText x={main.length * 27 + 20} y="32" fill="white" fillOpacity="0.6" fontSize="32" fontWeight="500">{tld}</SvgText>
        </G>
      )}
    </Svg>
  );
};
