'use client';

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { OrderTicket } from './components/OrderTicket';
import { HACCPBar } from './components/HACCPBar';

export const KDSFeature = () => {
  const [orders, setOrders] = useState([
    { id: '1', number: 101, createdAt: new Date(Date.now() - 1000 * 60 * 2), items: [{ name: 'Burger', quantity: 1 }] },
    { id: '2', number: 102, createdAt: new Date(Date.now() - 1000 * 60 * 12), items: [{ name: 'Fries', quantity: 2 }] },
  ]);

  const handleBump = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {orders.map(order => (
          <OrderTicket key={order.id} order={order} onBump={handleBump} />
        ))}
      </ScrollView>
      <HACCPBar />
    </View>
  );
};
