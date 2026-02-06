import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, View, Text } from '@sous/ui';

interface Props {
  order: any;
  onBump: (id: string) => void;
}

export const OrderTicket = ({ order, onBump }: Props) => {
  const age = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60);
  const bgClass = age > 10 ? 'bg-destructive' : age > 5 ? 'bg-warning' : 'bg-card';

  return (
    <Card className={`w-[250px] m-2 overflow-hidden border-2 ${bgClass}`}>
      <View className="bg-muted p-2 flex-row justify-between">
        <Text className="font-bold">#{order.number}</Text>
        <Text>{age}m</Text>
      </View>
      <View className="p-2 gap-2">
        {order.items.map((item: any, idx: number) => (
          <Text key={idx} className="text-lg">
            {item.quantity}x {item.name}
          </Text>
        ))}
      </View>
      <TouchableOpacity 
        className="bg-primary p-3 items-center" 
        onPress={() => onBump(order.id)}
      >
        <Text className="text-primary-foreground font-bold">BUMP</Text>
      </TouchableOpacity>
    </Card>
  );
};
