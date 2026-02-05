import { Svg as RNSvg } from 'react-native-svg';
import { cssInterop } from 'react-native-css-interop';

export const Svg = RNSvg;

// @ts-ignore
cssInterop(Svg, {
  className: 'style',
});
