"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from "@sous/ui";
import { Apple, Plus, Scale, DollarSign } from "lucide-react";
import { useAuth } from "@sous/features";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_INGREDIENTS = gql`
  query GetIngredients($orgId: String!) {
    ingredients(orgId: $orgId) {
      id
      name
      baseUnit
      currentPrice
    }
  }
`;

const CREATE_INGREDIENT = gql`
  mutation CreateIngredient($orgId: String!, $input: CreateIngredientInput!) {
    createIngredient(orgId: $orgId, input: $input) {
      id
      name
    }
  }
`;

export default function IngredientsPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: "", baseUnit: "", currentPrice: "" });

  const { data, loading, refetch } = useQuery<any>(GET_INGREDIENTS, {
    variables: { orgId },
    skip: !orgId,
  });

  const [createIngredient, { loading: creating }] = useMutation(CREATE_INGREDIENT);

  const handleCreate = async () => {
    try {
      await createIngredient({
        variables: {
          orgId,
          input: {
            ...newIngredient,
            currentPrice: newIngredient.currentPrice ? parseInt(newIngredient.currentPrice) : undefined,
          },
        },
      });
      setShowAddModal(false);
      setNewIngredient({ name: "", baseUnit: "", currentPrice: "" });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const ingredients = data?.ingredients || [];

  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Culinary / Raw Materials
          </Text>
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            Ingredients
          </Text>
        </View>
        <Button 
          className="bg-sky-500 px-6 h-12"
          onClick={() => setShowAddModal(true)}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={18} color="white" />
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              Add Ingredient
            </Text>
          </View>
        </Button>
      </View>

      {loading ? (
        <Text className="text-zinc-500">Loading ingredients...</Text>
      ) : ingredients.length === 0 ? (
        <Card className="p-8 bg-zinc-900 border-zinc-800 items-center justify-center border-dashed min-h-[400px]">
          <Apple size={48} className="text-zinc-800 mb-4" />
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            No Ingredients Defined
          </Text>
          <Text className="text-zinc-700 text-sm max-w-xs text-center">
            Define your pantry items to link with invoices and track real-time
            costing.
          </Text>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient: any) => (
            <Card key={ingredient.id} className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all group">
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-3 bg-black border border-zinc-800 rounded-xl">
                  <Apple size={20} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                </View>
                <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Pantry
                </div>
              </View>
              
              <Text className="text-xl font-black text-white uppercase tracking-tight mb-4">
                {ingredient.name}
              </Text>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-zinc-500 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50">
                  <Scale size={14} />
                  <span className="text-xs font-mono font-bold uppercase">{ingredient.baseUnit}</span>
                </div>
                {ingredient.currentPrice && (
                  <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                    <DollarSign size={14} />
                    <span className="text-xs font-mono font-bold">{(ingredient.currentPrice / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white font-black uppercase tracking-tight">New Ingredient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Name</Text>
              <Input
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="Whole Milk"
              />
            </div>
            <div className="flex gap-4">
              <div className="grid gap-2 flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Base Unit</Text>
                <Input
                  value={newIngredient.baseUnit}
                  onChange={(e) => setNewIngredient({ ...newIngredient, baseUnit: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="gal"
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Price (Cents)</Text>
                <Input
                  value={newIngredient.currentPrice}
                  onChange={(e) => setNewIngredient({ ...newIngredient, currentPrice: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="450"
                  type="number"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="bg-sky-500 w-full">
              <Text className="text-white font-bold uppercase text-xs tracking-widest">
                {creating ? "Saving..." : "Save Ingredient"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}