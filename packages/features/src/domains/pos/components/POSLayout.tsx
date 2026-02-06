import React from 'react';
import { View } from '@sous/ui';

export const POSLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View className="flex-1 flex-row h-screen bg-background">
      {children}
    </View>
  );
};
