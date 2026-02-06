import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Card, View, Text } from '@sous/ui';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  color?: string;
}

interface Props {
  items: MenuItem[];
  onItemPress: (item: MenuItem) => void;
}

export const OrderGrid = ({ items, onItemPress }: Props) => {
  return (
    <ScrollView className="flex-1 p-4">
      <View className="flex-row flex-wrap gap-4">
        {items.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => onItemPress(item)}
            className="w-[150px] h-[120px]"
          >
            <Card className="flex-1 items-center justify-center p-4 bg-muted border border-border active:bg-accent">
              <Text className="text-lg font-bold text-center">{item.name}</Text>
              <Text className="text-muted-foreground mt-2">${(item.price / 100).toFixed(2)}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
