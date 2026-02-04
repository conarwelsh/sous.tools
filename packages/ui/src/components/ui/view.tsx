import { View as RNView } from 'react-native';
import { cssInterop } from 'react-native-css-interop';

export const View = RNView;

cssInterop(View, {
  className: 'style',
});
