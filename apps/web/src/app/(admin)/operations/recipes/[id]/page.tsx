"use client";

import React, { use } from "react";
import { View, Text, Button, Card, GoogleDriveLogo } from "@sous/ui";
import { ChefHat, Scale, ArrowLeft, Loader2, Sparkles, Clock, ListChecks } from "lucide-react";
import { useAuth } from "@sous/features";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_RECIPE = gql`
  query GetRecipe($id: String!, $orgId: String!) {
    recipe(id: $id, orgId: $orgId) {
      id
      name
      yieldAmount
      yieldUnit
      sourceType
      sourceUrl
      ingredients {
        id
        amount
        unit
        ingredient {
          id
          name
        }
      }
      steps {
        id
        order
        instruction
        timerDuration
      }
    }
  }
`;

const TRIGGER_AI_INGESTION = gql`
  mutation TriggerRecipeAiIngestion($recipeId: String!, $orgId: String!) {
    triggerRecipeAiIngestion(recipeId: $recipeId, orgId: $orgId)
  }
`;

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId || "";

  const { data, loading, refetch } = useQuery<any>(GET_RECIPE, {
    variables: { id, orgId },
    skip: !orgId || !id,
  });

  const [triggerAiIngestion, { loading: isIngesting }] = useMutation(TRIGGER_AI_INGESTION, {
    onCompleted: () => refetch(),
  });

  const recipe = data?.recipe;

  if (loading) {
    return (
      <View className="flex-1 bg-background p-8 items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest">Loading Recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View className="flex-1 bg-background p-8 items-center justify-center">
        <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest">Recipe Not Found</Text>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          Go Back
        </Button>
      </View>
    );
  }

  const hasContent = recipe.ingredients.length > 0 || recipe.steps.length > 0;

  return (
    <View className="flex-1 bg-background p-8">
      <View className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="p-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Recipes
        </Button>

        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
              Recipe Details
            </Text>
            <Text className="text-4xl font-black text-foreground uppercase tracking-tighter mb-4">
              {recipe.name}
            </Text>
            <div className="flex flex-row gap-4 items-center">
              <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
                <Scale size={14} />
                <span className="text-xs font-mono font-bold uppercase">
                  Yield: {recipe.yieldAmount || '0'} {recipe.yieldUnit || '---'}
                </span>
              </div>
              {recipe.sourceType === 'google-drive' && (
                 <Button 
                    variant="ghost" 
                    className="h-8 gap-2 text-xs"
                    onClick={() => window.open(recipe.sourceUrl, '_blank')}
                 >
                    <GoogleDriveLogo size={14} />
                    View Original
                 </Button>
              )}
            </div>
          </View>

          {recipe.sourceType && (
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2 h-12 px-6"
              onClick={() => triggerAiIngestion({ variables: { recipeId: id, orgId } })}
              disabled={isIngesting}
            >
              {isIngesting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
                {isIngesting ? "Parsing..." : "Parse with AI"}
              </Text>
            </Button>
          )}
        </View>
      </View>

      {!hasContent ? (
        <Card className="p-12 bg-card border-border items-center justify-center border-dashed">
          <Sparkles size={48} className="text-muted-foreground mb-4" />
          <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest mb-2">
            This recipe is empty
          </Text>
          <Text className="text-muted-foreground text-sm max-w-xs text-center mb-8">
            This recipe only has a source link. Use the AI parser to extract ingredients and instructions automatically.
          </Text>
          <Button 
            className="bg-primary hover:bg-primary/90 px-8 h-12"
            onClick={() => triggerAiIngestion({ variables: { recipeId: id, orgId } })}
            disabled={isIngesting}
          >
            <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
              Start AI Parsing
            </Text>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Ingredients Column */}
          <View className="lg:col-span-1">
            <View className="flex-row items-center gap-2 mb-6">
              <ListChecks size={20} className="text-primary" />
              <Text className="font-black uppercase text-sm tracking-widest">Ingredients</Text>
            </View>
            <Card className="bg-card border-border divide-y divide-border">
              {recipe.ingredients.map((ri: any) => (
                <View key={ri.id} className="p-4 flex-row justify-between items-center">
                  <Text className="font-bold text-foreground">{ri.ingredient.name}</Text>
                  <Text className="font-mono text-sm text-muted-foreground">
                    {ri.amount} {ri.unit}
                  </Text>
                </View>
              ))}
            </Card>
          </View>

          {/* Steps Column */}
          <View className="lg:col-span-2">
            <View className="flex-row items-center gap-2 mb-6">
              <ChefHat size={20} className="text-primary" />
              <Text className="font-black uppercase text-sm tracking-widest">Instructions</Text>
            </View>
            <View className="gap-6">
              {recipe.steps.sort((a: any, b: any) => a.order - b.order).map((step: any, index: number) => (
                <View key={step.id} className="flex-row gap-6">
                  <View className="items-center">
                    <View className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background ring-2 ring-primary/20">
                      <Text className="text-primary-foreground font-black text-xs">{index + 1}</Text>
                    </View>
                    {index < recipe.steps.length - 1 && (
                      <View className="w-0.5 flex-1 bg-border my-2" />
                    )}
                  </View>
                  <View className="flex-1 pb-8">
                    <Card className="p-6 bg-card border-border">
                      <Text className="text-foreground leading-relaxed mb-4">
                        {step.instruction}
                      </Text>
                      {step.timerDuration && (
                        <View className="flex-row items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 w-fit">
                          <Clock size={14} />
                          <Text className="text-[10px] font-black uppercase tracking-widest">
                            {Math.floor(step.timerDuration / 60)} mins
                          </Text>
                        </View>
                      )}
                    </Card>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </div>
      )}
    </View>
  );
}
