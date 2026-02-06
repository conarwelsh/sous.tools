'use client';

import React, { useState } from 'react';
import { POSLayout } from './components/POSLayout';
import { OrderGrid } from './components/OrderGrid';
import { Cart } from './components/Cart';
import { bridge } from '@sous/native-bridge';

export const POSFeature = () => {
  const [cart, setCart] = useState<any[]>([]);

  const handleAddItem = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handlePay = async () => {
    // 1. Process Payment (Mock)
    console.log('Processing payment...');
    
    // 2. Print Receipt via Bridge
    const receiptData = cart.map(i => `${i.name} x${i.quantity}`).join('\n');
    await bridge.printReceipt('default', receiptData);

    // 3. Clear
    setCart([]);
  };

  // Mock Menu
  const menuItems = [
    { id: '1', name: 'Burger', price: 1200 },
    { id: '2', name: 'Fries', price: 500 },
    { id: '3', name: 'Soda', price: 300 },
    { id: '4', name: 'Salad', price: 900 },
  ];

  return (
    <POSLayout>
      <OrderGrid items={menuItems} onItemPress={handleAddItem} />
      <Cart items={cart} onPay={handlePay} onClear={() => setCart([])} />
    </POSLayout>
  );
};
