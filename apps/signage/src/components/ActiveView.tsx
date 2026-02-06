import React from 'react';
import { View, Text } from 'react-native';
import { PresentationRenderer } from '@sous/features';

interface Props {
  assignment?: any;
}

export const ActiveView: React.FC<Props> = ({ assignment }) => {
  if (!assignment) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-xl text-muted-foreground">
          Waiting for content assignment...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <PresentationRenderer 
        structure={assignment.structure} 
        content={assignment.content} 
      />
    </View>
  );
};