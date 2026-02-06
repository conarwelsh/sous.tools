'use client';

import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button, Card } from '@sous/ui';
import { getHttpClient } from '@sous/client-sdk';

export const PairingWorkflow = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handlePair = async () => {
    if (code.length !== 6) return;
    
    setStatus('loading');
    try {
      const http = await getHttpClient();
      await http.post('/hardware/pair', { code });
      setStatus('success');
    } catch (e) {
      console.error('Pairing failed:', e);
      setStatus('error');
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <Text className="text-2xl font-bold mb-4">Pair New Device</Text>
      <Text className="text-muted-foreground mb-6">
        Enter the 6-digit code displayed on your device screen.
      </Text>
      
      <TextInput
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
        placeholder="ABC123"
        maxLength={6}
        className="bg-muted p-4 rounded-xl text-3xl text-center font-mono mb-6 border border-border"
      />
      
      <Button onPress={handlePair} disabled={status === 'loading'}>
        <Text>{status === 'loading' ? 'Pairing...' : 'Pair Device'}</Text>
      </Button>
      
      {status === 'success' && (
        <Text className="mt-4 text-success text-center font-medium">
          ✅ Device paired successfully!
        </Text>
      )}
      {status === 'error' && (
        <Text className="mt-4 text-destructive text-center font-medium">
          ❌ Invalid or expired code.
        </Text>
      )}
    </Card>
  );
};
