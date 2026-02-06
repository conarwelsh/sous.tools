'use client';

import React from 'react';
import { Button, View, Text } from '@sous/ui';

export const HomeView = () => {
  const V = View as any;
  const T = Text as any;
  return (
    <V className="flex-1 items-center justify-center bg-background">
      <T className="text-4xl font-bold text-foreground mb-4">
        Welcome to Sous
      </T>
      <T className="text-xl text-muted-foreground mb-8">
        The mission-critical platform for modern kitchens.
      </T>
      <Button onPress={() => console.log('Get Started pressed')}>
        <T>Get Started</T>
      </Button>
    </V>
  );
};
