import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "../utils/cn";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-blue-600 active:bg-blue-700",
    outline: "border border-blue-600 bg-transparent",
    ghost: "bg-transparent",
  };

  const textStyles = {
    primary: "text-white font-semibold",
    outline: "text-blue-600 font-semibold",
    ghost: "text-blue-600 font-medium",
  };

  return (
    <Pressable
      className={cn(
        "px-4 py-2 rounded-md items-center justify-center transition-all",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      <Text className={cn("text-sm", textStyles[variant])}>{children}</Text>
    </Pressable>
  );
}
