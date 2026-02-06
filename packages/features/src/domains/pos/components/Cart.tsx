import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card, View, Text } from '@sous/ui';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  onPay: () => void;
  onClear: () => void;
}

export const Cart = ({ items, onPay, onClear }: Props) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View className="w-[400px] border-l border-border bg-card p-4 flex-col">
      <Text className="text-2xl font-bold mb-4">Current Order</Text>
      
      <ScrollView className="flex-1 mb-4">
        {items.map((item, idx) => (
          <View key={idx} className="flex-row justify-between items-center py-3 border-b border-border">
            <View>
              <Text className="font-medium">{item.name}</Text>
              <Text className="text-sm text-muted-foreground">x{item.quantity}</Text>
            </View>
            <Text className="font-mono">${(item.price * item.quantity / 100).toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="gap-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-bold">Total</Text>
          <Text className="text-3xl font-mono text-primary">${(total / 100).toFixed(2)}</Text>
        </View>

        <View className="flex-row gap-4">
          <Button variant="destructive" className="flex-1" onPress={onClear}>
            <Text>Clear</Text>
          </Button>
          <Button className="flex-[2] bg-green-600" onPress={onPay}>
            <Text className="text-xl">Pay</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};
