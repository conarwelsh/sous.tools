import React from "react";
import { View } from "../ui/view";
import { Logo } from "./Logo";

export const KioskLoading = ({ suffix }: { suffix?: string }) => {
  return (
    <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
      <Logo variant="cloud" size={64} animate suffix={suffix} />
    </View>
  );
};
