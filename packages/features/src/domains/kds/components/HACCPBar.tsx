import React, { useEffect, useState } from 'react';
import { View, Text } from '@sous/ui';
import { bridge, BLEDevice } from '@sous/native-bridge';

export const HACCPBar = () => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const scanned = await bridge.scanForBLE();
      setDevices(scanned);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="h-[60px] bg-black border-t border-border flex-row items-center px-4 gap-4">
      <Text className="text-muted-foreground font-bold">HACCP MONITOR</Text>
      {devices.map(d => (
        <View key={d.id} className="bg-card px-3 py-1 rounded-full flex-row gap-2 border border-border">
          <Text className="text-xs">{d.name}</Text>
          <Text className={`font-mono font-bold ${d.temperature && d.temperature > 40 ? 'text-destructive' : 'text-success'}`}>
            {d.temperature}°C
          </Text>
        </View>
      ))}
    </View>
  );
};
