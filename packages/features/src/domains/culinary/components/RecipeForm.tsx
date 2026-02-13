"use client";

import React, { useState } from "react";
import { View, Text, Button, Input, Card, ScrollView, cn } from "@sous/ui";
import { Plus, Trash2, Save, X, ListChecks, ChefHat, Scale, Clock } from "lucide-react";

export interface RecipeFormProps {
  initialData?: any;
  ingredients: any[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function RecipeForm({ initialData, ingredients, onSave, onCancel }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    yieldAmount: initialData?.yieldAmount?.toString() || "",
    yieldUnit: initialData?.yieldUnit || "",
    ingredients: initialData?.ingredients?.map((ri: any) => ({
      ingredientId: ri.ingredient.id,
      amount: ri.amount.toString(),
      unit: ri.unit
    })) || [],
    steps: initialData?.steps?.sort((a: any, b: any) => a.order - b.order).map((s: any) => ({
      order: s.order,
      instruction: s.instruction,
      timerDuration: s.timerDuration?.toString() || ""
    })) || []
  });

  const [isSaving, setIsSaving] = useState(false);

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: "", amount: "", unit: "" }]
    });
  };

  const removeIngredient = (index: number) => {
    const next = [...formData.ingredients];
    next.splice(index, 1);
    setFormData({ ...formData, ingredients: next });
  };

  const updateIngredient = (index: number, updates: any) => {
    const next = [...formData.ingredients];
    next[index] = { ...next[index], ...updates };
    setFormData({ ...formData, ingredients: next });
  };

  const addStep = () => {
    const nextOrder = formData.steps.length > 0 
      ? Math.max(...formData.steps.map((s: any) => s.order)) + 1 
      : 1;
    setFormData({
      ...formData,
      steps: [...formData.steps, { order: nextOrder, instruction: "", timerDuration: "" }]
    });
  };

  const removeStep = (index: number) => {
    const next = [...formData.steps];
    next.splice(index, 1);
    setFormData({ ...formData, steps: next });
  };

  const updateStep = (index: number, updates: any) => {
    const next = [...formData.steps];
    next[index] = { ...next[index], ...updates };
    setFormData({ ...formData, steps: next });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        yieldAmount: formData.yieldAmount ? parseFloat(formData.yieldAmount) : null,
        ingredients: formData.ingredients
          .filter((i: any) => i.ingredientId && i.amount)
          .map((i: any) => ({
            ...i,
            amount: parseFloat(i.amount)
          })),
        steps: formData.steps
          .filter((s: any) => s.instruction)
          .map((s: any, idx: number) => ({
            ...s,
            order: idx + 1,
            timerDuration: s.timerDuration ? parseInt(s.timerDuration) : null
          }))
      };
      await onSave(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 gap-8">
      {/* Basic Info */}
      <Card className="p-6 bg-card border-border gap-6">
        <View className="gap-2">
          <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Recipe Name</Text>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Grandma's Sourdough"
            className="h-12 bg-muted/50 border-border text-lg font-bold uppercase"
          />
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Yield Amount</Text>
            <Input 
              value={formData.yieldAmount}
              onChange={(e) => setFormData({ ...formData, yieldAmount: e.target.value })}
              type="number"
              placeholder="1000"
              className="h-10 bg-muted/50 border-border"
            />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Yield Unit</Text>
            <Input 
              value={formData.yieldUnit}
              onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
              placeholder="grams"
              className="h-10 bg-muted/50 border-border"
            />
          </View>
        </View>
      </Card>

      {/* Ingredients */}
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <ListChecks size={18} className="text-primary" />
            <Text className="font-black uppercase text-sm tracking-widest">Ingredients</Text>
          </View>
          <Button size="sm" variant="outline" onClick={addIngredient} className="h-8 border-primary/20 hover:bg-primary/5 gap-2">
            <Plus size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase">Add Item</span>
          </Button>
        </View>
        
        <View className="gap-3">
          {formData.ingredients.map((ing: any, idx: number) => (
            <Card key={idx} className="p-3 bg-muted/20 border-border flex-row items-center gap-3">
              <div className="flex-1">
                <select 
                  value={ing.ingredientId}
                  onChange={(e) => updateIngredient(idx, { ingredientId: e.target.value })}
                  className="w-full h-10 rounded-lg bg-background border border-border px-3 text-xs font-bold uppercase appearance-none"
                >
                  <option value="">Select Ingredient...</option>
                  {ingredients.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
              <Input 
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, { amount: e.target.value })}
                placeholder="Qty"
                className="w-20 h-10 bg-background border-border text-center font-mono"
              />
              <Input 
                value={ing.unit}
                onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                placeholder="Unit"
                className="w-24 h-10 bg-background border-border text-center uppercase text-[10px] font-bold"
              />
              <Button size="sm" variant="ghost" onClick={() => removeIngredient(idx)} className="h-10 w-10 p-0 hover:bg-red-500/10 hover:text-red-500">
                <Trash2 size={14} />
              </Button>
            </Card>
          ))}
          {formData.ingredients.length === 0 && (
            <View className="p-8 items-center border border-dashed border-border rounded-2xl opacity-30">
              <Text className="text-[10px] font-black uppercase">No ingredients added</Text>
            </View>
          )}
        </View>
      </View>

      {/* Steps */}
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <ChefHat size={18} className="text-primary" />
            <Text className="font-black uppercase text-sm tracking-widest">Instructions</Text>
          </View>
          <Button size="sm" variant="outline" onClick={addStep} className="h-8 border-primary/20 hover:bg-primary/5 gap-2">
            <Plus size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase">Add Step</span>
          </Button>
        </View>

        <View className="gap-4">
          {formData.steps.map((step: any, idx: number) => (
            <View key={idx} className="flex-row gap-4 group">
              <View className="items-center">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                  <Text className="text-[10px] font-black">{idx + 1}</Text>
                </div>
                <div className="w-px flex-1 bg-border my-2" />
              </View>
              <Card className="flex-1 p-4 bg-muted/20 border-border gap-4">
                <textarea 
                  value={step.instruction}
                  onChange={(e) => updateStep(idx, { instruction: e.target.value })}
                  placeholder="e.g. Combine dry ingredients and whisk until incorporated..."
                  className="w-full min-h-[80px] bg-transparent border-0 focus:ring-0 text-sm leading-relaxed resize-none text-foreground placeholder:text-muted-foreground/50"
                />
                <View className="flex-row items-center justify-between border-t border-border/30 pt-3">
                  <View className="flex-row items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <Input 
                      value={step.timerDuration}
                      onChange={(e) => updateStep(idx, { timerDuration: e.target.value })}
                      placeholder="Timer (sec)"
                      className="w-24 h-7 bg-background border-border text-[9px] text-center font-mono"
                    />
                  </View>
                  <Button size="sm" variant="ghost" onClick={() => removeStep(idx)} className="h-8 px-2 hover:bg-red-500/10 hover:text-red-500 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                    <span className="text-[9px] font-black uppercase">Remove</span>
                  </Button>
                </View>
              </Card>
            </View>
          ))}
        </View>
      </View>

      {/* Footer Actions */}
      <View className="flex-row justify-end gap-3 mt-8 border-t border-border pt-8">
        <Button variant="ghost" onClick={onCancel} className="h-12 px-8">
          <Text className="font-black uppercase text-xs tracking-widest">Cancel</Text>
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90 h-12 px-12 shadow-xl shadow-primary/20 gap-3"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={18} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
            {isSaving ? "Saving..." : "Save Recipe"}
          </Text>
        </Button>
      </View>
    </View>
  );
}
