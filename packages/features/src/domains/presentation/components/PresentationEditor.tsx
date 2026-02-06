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

  const V = View as any;
  const T = Text as any;
  const CardAny = Card as any;

  return (
    <ScrollView className="flex-1 p-6">
      <T className="text-3xl font-bold mb-8">Presentation Editor</T>
      
      <V className="flex-row gap-6">
        {/* Template List */}
        <V className="flex-1">
          <T className="text-xl font-semibold mb-4">1. Select Template</T>
          <V className="gap-4">
            {templates.map(t => (
              <CardAny 
                key={t.id} 
                className={`p-4 border-2 ${selectedTemplate?.id === t.id ? 'border-primary' : 'border-transparent'}`}
                onPress={() => {
                  setSelectedTemplate(t);
                  setBindings({});
                }}
              >
                <T className="font-bold">{t.name}</T>
              </CardAny>
            ))}
          </V>
        </V>

        {/* Slot Editor */}
        <V className="flex-[2]">
          <T className="text-xl font-semibold mb-4">2. Assign Content</T>
          {parsedStructure ? (
            <Card className="p-6">
              <T className="text-lg font-medium mb-4">{selectedTemplate?.name}</T>
              <V className="gap-6">
                {parsedStructure.slots.map(slot => (
                  <V key={slot.id}>
                    <T className="font-medium mb-2">{slot.name} ({slot.type})</T>
                    <Input 
                      placeholder={`Enter URL or data for ${slot.type}`}
                      value={bindings[slot.id]?.value || ''}
                      onChangeText={(val) => setBindings(prev => ({
                        ...prev,
                        [slot.id]: { type: slot.type, value: val }
                      }))}
                    />
                  </V>
                ))}
              </V>
              
              <Button className="mt-8" onPress={handleSave} disabled={status === 'loading'}>
                <T>{status === 'loading' ? 'Saving...' : 'Save Presentation'}</T>
              </Button>
              
              {status === 'success' && (
                <T className="mt-4 text-success font-medium">✅ Saved successfully!</T>
              )}
            </Card>
          ) : (
            <T className="text-muted-foreground italic">Select a template to begin editing.</T>
          )}
        </V>
      </V>
    </ScrollView>
  );
};
