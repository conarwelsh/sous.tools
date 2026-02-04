import React from 'react';
import { Svg, G, Path, Text as SvgText } from 'react-native-svg';
import { LogoProps } from '../logo-types';
import { getEnvColor as getEnvColorUtil } from '../logo-utils';
import { cn } from '../../lib/utils';

export const DotLogo: React.FC<LogoProps> = ({
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
      <G translate="20, 20">
        <Path d="M10 0 H50" stroke={brandColor} strokeWidth="16" strokeLinecap="round" />
        <Path d="M10 30 H50" stroke={brandColor} strokeWidth="16" strokeLinecap="round" />
        <Path d="M10 60 H50" stroke={brandColor} strokeWidth="16" strokeLinecap="round" />
        <Path d="M10 0 V30" stroke={brandColor} strokeWidth="16" strokeLinecap="round" />
        <Path d="M50 30 V60" stroke={brandColor} strokeWidth="16" strokeLinecap="round" />
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
