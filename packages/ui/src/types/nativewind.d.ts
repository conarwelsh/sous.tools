import "react-native";
declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
}
import "react-native-svg";
declare module "react-native-svg" {
  interface SvgProps {
    className?: string;
  }
}
