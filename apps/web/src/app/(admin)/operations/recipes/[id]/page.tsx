"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Button,
  Card,
  GoogleDriveLogo,
  ScrollView,
  InlineInput,
  InlineTextArea,
  cn,
} from "@sous/ui";
import {
  ChefHat,
  Scale,
  ArrowLeft,
  Loader2,
  Sparkles,
  Clock,
  ListChecks,
  Trash2,
  Save,
  Plus,
  Play,
} from "lucide-react";
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

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe(
    $orgId: String!
    $id: String!
    $input: UpdateRecipeInput!
  ) {
    updateRecipe(orgId: $orgId, id: $id, input: $input) {
      id
      name
    }
  }
`;

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($orgId: String!, $id: String!) {
    deleteRecipe(orgId: $orgId, id: $id) {
      id
    }
  }
`;

const TRIGGER_AI_INGESTION = gql`
  mutation TriggerRecipeAiIngestion($recipeId: String!, $orgId: String!) {
    triggerRecipeAiIngestion(recipeId: $recipeId, orgId: $orgId)
  }
`;

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId || "";

  const { data, loading, refetch } = useQuery<any>(GET_RECIPE, {
    variables: { id, orgId },
    skip: !orgId || !id,
  });

  const [updateRecipe, { loading: isSaving }] = useMutation(UPDATE_RECIPE);
  const [deleteRecipe] = useMutation(DELETE_RECIPE);
  const [triggerAiIngestion, { loading: isIngesting }] = useMutation(
    TRIGGER_AI_INGESTION,
    {
      onCompleted: () => refetch(),
    },
  );

  const [formData, setFormData] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data?.recipe && !isDirty) {
      setFormData(JSON.parse(JSON.stringify(data.recipe)));
    }
  }, [data, isDirty]);

  const handleFieldChange = (updates: any) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleIngredientChange = (idx: number, updates: any) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[idx] = { ...newIngredients[idx], ...updates };
    setFormData((prev: any) => ({ ...prev, ingredients: newIngredients }));
    setIsDirty(true);
  };

  const handleStepChange = (idx: number, updates: any) => {
    const newSteps = [...formData.steps];
    newSteps[idx] = { ...newSteps[idx], ...updates };
    setFormData((prev: any) => ({ ...prev, steps: newSteps }));
    setIsDirty(true);
  };

  const addIngredient = () => {
    const newIngredients = [
      ...(formData.ingredients || []),
      {
        id: `new-${Date.now()}`,
        amount: 0,
        unit: "g",
        ingredient: { id: "", name: "New Ingredient" },
      },
    ];
    setFormData((prev: any) => ({ ...prev, ingredients: newIngredients }));
    setIsDirty(true);
  };

  const addStep = () => {
    const newSteps = [
      ...(formData.steps || []),
      {
        id: `new-${Date.now()}`,
        order: (formData.steps?.length || 0) + 1,
        instruction: "New instruction step...",
        timerDuration: null,
      },
    ];
    setFormData((prev: any) => ({ ...prev, steps: newSteps }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateRecipe({
        variables: {
          orgId,
          id,
          input: {
            name: formData.name,
            yieldAmount: parseInt(formData.yieldAmount),
            yieldUnit: formData.yieldUnit,
            ingredients: formData.ingredients.map((ri: any) => ({
              ingredientId: ri.ingredient.id,
              ingredientName: ri.ingredient.name, // Will be handled by service to find or create
              amount: parseFloat(ri.amount),
              unit: ri.unit,
            })),
            steps: formData.steps.map((s: any, i: number) => ({
              order: i + 1,
              instruction: s.instruction,
              timerDuration: s.timerDuration ? parseInt(s.timerDuration) : null,
            })),
          },
        },
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to wipe this IP?")) return;
    try {
      await deleteRecipe({ variables: { orgId, id } });
      router.push("/operations/recipes");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !formData) {
    return (
      <View className="flex-1 bg-background p-8 items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest">
          Loading Recipe IP...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-8 relative">
      <View className="max-w-6xl mx-auto w-full pb-32">
        {/* Top Header */}
        <View className="mb-12">
          <View className="flex-row justify-between items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Repository
            </Button>

            <div className="flex flex-row gap-3">
              <Button
                onClick={() => router.push(`/operations/recipes/${id}/cook`)}
                className="bg-emerald-500 hover:bg-emerald-600 gap-2 h-10 px-6 rounded-xl shadow-xl shadow-emerald-500/20"
              >
                <Play size={16} fill="white" />
                <Text className="text-white font-black uppercase text-[10px] tracking-widest">
                  Cook Mode
                </Text>
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 gap-2 h-10 px-4 rounded-xl"
              >
                <Trash2 size={16} />
                <Text className="text-[10px] font-black uppercase tracking-widest">
                  Wipe IP
                </Text>
              </Button>
            </div>
          </View>

          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mb-3">
                Culinary / IP Asset
              </Text>
              <InlineInput
                value={formData.name}
                onValueChange={(val) => handleFieldChange({ name: val })}
                className="text-5xl font-black text-foreground uppercase tracking-tighter mb-6 hover:bg-muted/10 p-2 -ml-2"
              />

              <div className="flex flex-row gap-4 items-center">
                <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
                  <Scale size={14} className="text-sky-500" />
                  <div className="flex flex-row items-center gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Yield:
                    </span>
                    <InlineInput
                      value={String(formData.yieldAmount || "0")}
                      onValueChange={(val) =>
                        handleFieldChange({ yieldAmount: val })
                      }
                      className="w-12 text-center font-mono font-bold"
                    />
                    <InlineInput
                      value={formData.yieldUnit || "---"}
                      onValueChange={(val) =>
                        handleFieldChange({ yieldUnit: val })
                      }
                      className="w-16 text-center font-mono font-bold"
                    />
                  </div>
                </div>
                {formData.sourceType === "google-drive" && (
                  <Button
                    variant="ghost"
                    className="h-10 gap-2 text-[10px] font-black uppercase tracking-widest border border-border/50 rounded-xl"
                    onClick={() => window.open(formData.sourceUrl, "_blank")}
                  >
                    <GoogleDriveLogo size={14} />
                    View Source
                  </Button>
                )}
                {!formData.ingredients.length && (
                  <Button
                    className="bg-primary/10 hover:bg-primary/20 text-primary gap-2 h-10 px-6 rounded-xl border border-primary/20"
                    onClick={() =>
                      triggerAiIngestion({ variables: { recipeId: id, orgId } })
                    }
                    disabled={isIngesting}
                  >
                    {isIngesting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <Text className="font-black uppercase text-[10px] tracking-widest">
                      Parse with AI
                    </Text>
                  </Button>
                )}
              </div>
            </View>
          </View>
        </View>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Ingredients Column */}
          <View className="lg:col-span-4">
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  <ListChecks size={16} className="text-sky-500" />
                </div>
                <Text className="font-black uppercase text-xs tracking-[0.2em]">
                  Components
                </Text>
              </View>
              <Button
                onClick={addIngredient}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-sky-500/10 text-sky-500"
              >
                <Plus size={18} />
              </Button>
            </View>

            <Card className="bg-card border-border/50 divide-y divide-border/30 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20">
              {formData.ingredients.map((ri: any, idx: number) => (
                <View
                  key={ri.id}
                  className="p-5 flex-row justify-between items-center group"
                >
                  <InlineInput
                    value={ri.ingredient.name}
                    onValueChange={(val) =>
                      handleIngredientChange(idx, {
                        ingredient: { ...ri.ingredient, name: val },
                      })
                    }
                    className="font-bold text-foreground flex-1 text-sm uppercase tracking-tight"
                  />
                  <div className="flex flex-row items-center gap-2 bg-muted/20 p-1 rounded-lg border border-border/50 opacity-60 group-hover:opacity-100 transition-opacity">
                    <InlineInput
                      value={String(ri.amount)}
                      onValueChange={(val) =>
                        handleIngredientChange(idx, { amount: val })
                      }
                      className="w-12 text-center font-mono text-xs font-bold"
                    />
                    <InlineInput
                      value={ri.unit}
                      onValueChange={(val) =>
                        handleIngredientChange(idx, { unit: val })
                      }
                      className="w-8 text-center font-mono text-xs font-bold"
                    />
                  </div>
                </View>
              ))}
              {!formData.ingredients.length && (
                <View className="p-12 items-center justify-center opacity-30">
                  <Text className="text-[10px] font-black uppercase tracking-widest">
                    No Ingredients Yet
                  </Text>
                </View>
              )}
            </Card>
          </View>

          {/* Steps Column */}
          <View className="lg:col-span-8">
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <ChefHat size={16} className="text-amber-500" />
                </div>
                <Text className="font-black uppercase text-xs tracking-[0.2em]">
                  Execution Protocol
                </Text>
              </View>
              <Button
                onClick={addStep}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-amber-500/10 text-amber-500"
              >
                <Plus size={18} />
              </Button>
            </View>

            <View className="gap-8">
              {formData.steps
                .sort((a: any, b: any) => a.order - b.order)
                .map((step: any, idx: number) => (
                  <View key={step.id} className="flex-row gap-8 group">
                    <View className="items-center">
                      <View className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/50 group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition-all">
                        <Text className="text-muted-foreground font-black text-xs group-hover:text-amber-500">
                          {idx + 1}
                        </Text>
                      </View>
                      {idx < formData.steps.length - 1 && (
                        <View className="w-px flex-1 bg-border/30 my-3" />
                      )}
                    </View>
                    <View className="flex-1 pb-4">
                      <Card className="p-6 bg-card border-border/50 rounded-3xl hover:border-amber-500/20 transition-all shadow-xl shadow-black/5 relative">
                        <InlineTextArea
                          value={step.instruction}
                          onValueChange={(val) =>
                            handleStepChange(idx, { instruction: val })
                          }
                          className="text-foreground leading-relaxed text-sm min-h-[60px]"
                        />

                        <div className="mt-4 flex flex-row items-center gap-4">
                          <div className="flex flex-row items-center gap-2 text-muted-foreground/60 bg-muted/20 px-3 py-1.5 rounded-xl border border-border/50">
                            <Clock size={12} />
                            <div className="flex flex-row items-center gap-1">
                              <InlineInput
                                value={
                                  step.timerDuration
                                    ? String(
                                        Math.floor(step.timerDuration / 60),
                                      )
                                    : ""
                                }
                                placeholder="0"
                                onValueChange={(val) =>
                                  handleStepChange(idx, {
                                    timerDuration: parseInt(val) * 60 || null,
                                  })
                                }
                                className="w-8 text-center font-mono text-[10px] font-black"
                              />
                              <span className="text-[8px] font-black uppercase">
                                mins
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </View>
                  </View>
                ))}
              {!formData.steps.length && (
                <Card className="p-20 border-dashed border-border/50 items-center justify-center rounded-[3rem] bg-muted/5">
                  <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em]">
                    Empty Protocol
                  </Text>
                </Card>
              )}
            </View>
          </View>
        </div>
      </View>

      {/* FAB Save Button */}
      {isDirty && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-16 px-10 rounded-[2rem] bg-sky-500 hover:bg-sky-400 shadow-[0_20px_50px_rgba(14,165,233,0.4)] gap-4 ring-4 ring-background"
          >
            {isSaving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Save size={24} className="text-white" />
            )}
            <View>
              <Text className="text-white font-black uppercase text-sm tracking-tighter leading-none mb-0.5">
                Commit Changes
              </Text>
              <Text className="text-sky-100 text-[8px] font-black uppercase tracking-[0.2em] leading-none">
                Save to Repository
              </Text>
            </View>
          </Button>
        </div>
      )}
    </View>
  );
}
