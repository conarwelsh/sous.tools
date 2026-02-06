import React from 'react';
import { View, Text } from 'react-native';
import { Logo } from '@sous/ui';

interface Props {
  code: string;
}

export const PairingView: React.FC<Props> = ({ code }) => {
  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Logo size={64} className="mb-12" />
      
      <Text className="text-3xl font-bold text-foreground mb-4">
        Pairing Required
      </Text>
      
      <Text className="text-lg text-muted-foreground text-center mb-12">
        To activate this signage node, enter the code below in the Sous Admin dashboard.
      </Text>
      
      <View className="bg-muted px-12 py-6 rounded-2xl border border-border">
        <Text className="text-6xl font-black tracking-widest text-primary font-mono">
          {code}
        </Text>
      </View>
      
      <Text className="mt-12 text-sm text-muted-foreground italic">
        Waiting for pairing...
      </Text>
    </View>
  );
};
