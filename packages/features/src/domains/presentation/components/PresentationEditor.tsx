import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, Input, View, Text } from '@sous/ui';
import { getHttpClient } from '@sous/client-sdk';
import { TemplateStructure, TemplateSlot } from '../types/presentation.types';

interface Template {
  id: string;
  name: string;
  structure: string; // JSON string from DB
}

export const PresentationEditor = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [bindings, setBindings] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const http = await getHttpClient();
        const data = await http.get<Template[]>('/presentation/templates');
        setTemplates(data);
      } catch (e) {
        console.error('Failed to fetch templates:', e);
      }
    };
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setStatus('loading');
    try {
      const http = await getHttpClient();
      // Placeholder: In a real app we'd also select a Display
      // await http.post('/presentation/assignments', {
      //   templateId: selectedTemplate.id,
      //   content: { bindings }
      // });
      setStatus('success');
    } catch (e) {
      setStatus('error');
    }
  };

  const parsedStructure: TemplateStructure | null = selectedTemplate 
    ? JSON.parse(selectedTemplate.structure) 
    : null;

  return (
    <ScrollView className="flex-1 p-6">
      <Text className="text-3xl font-bold mb-8">Presentation Editor</Text>
      
      <View className="flex-row gap-6">
        {/* Template List */}
        <View className="flex-1">
          <Text className="text-xl font-semibold mb-4">1. Select Template</Text>
          <View className="gap-4">
            {templates.map(t => (
              <Card 
                key={t.id} 
                className={`p-4 border-2 ${selectedTemplate?.id === t.id ? 'border-primary' : 'border-transparent'}`}
                onPress={() => {
                  setSelectedTemplate(t);
                  setBindings({});
                }}
              >
                <Text className="font-bold">{t.name}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Slot Editor */}
        <View className="flex-[2]">
          <Text className="text-xl font-semibold mb-4">2. Assign Content</Text>
          {parsedStructure ? (
            <Card className="p-6">
              <Text className="text-lg font-medium mb-4">{selectedTemplate?.name}</Text>
              <View className="gap-6">
                {parsedStructure.slots.map(slot => (
                  <View key={slot.id}>
                    <Text className="font-medium mb-2">{slot.name} ({slot.type})</Text>
                    <Input 
                      placeholder={`Enter URL or data for ${slot.type}`}
                      value={bindings[slot.id]?.value || ''}
                      onChangeText={(val) => setBindings(prev => ({
                        ...prev,
                        [slot.id]: { type: slot.type, value: val }
                      }))}
                    />
                  </View>
                ))}
              </View>
              
              <Button className="mt-8" onPress={handleSave} disabled={status === 'loading'}>
                <Text>{status === 'loading' ? 'Saving...' : 'Save Presentation'}</Text>
              </Button>
              
              {status === 'success' && (
                <Text className="mt-4 text-success font-medium">✅ Saved successfully!</Text>
              )}
            </Card>
          ) : (
            <Text className="text-muted-foreground italic">Select a template to begin editing.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};
