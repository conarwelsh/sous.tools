'use client';

import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button, Card } from '@sous/ui';
import { bridge } from '@sous/native-bridge';

export const LabelEditor = () => {
  const [content, setContent] = useState('Item: Prep\nDate: 2026-02-06\nExp: 2026-02-09');

  const handlePrint = async () => {
    // Generate ZPL (Mock)
    const zpl = `^XA^FO50,50^ADN,36,20^FD${content}^FS^XZ`;
    await bridge.printLabel('default', zpl);
  };

  return (
    <Card className="p-6 max-w-md">
      <Text className="text-xl font-bold mb-4">Label Printer</Text>
      <TextInput 
        multiline
        numberOfLines={4}
        value={content}
        onChangeText={setContent}
        className="bg-muted p-4 mb-4 font-mono border border-border"
      />
      <Button onPress={handlePrint}>
        <Text>Print Label</Text>
      </Button>
    </Card>
  );
};
