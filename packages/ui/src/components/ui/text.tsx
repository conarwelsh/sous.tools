import { Text as RNText } from 'react-native';
import { cssInterop } from 'react-native-css-interop';

export const Text = RNText;

// @ts-ignore
cssInterop(Text, {
  className: 'style',
});