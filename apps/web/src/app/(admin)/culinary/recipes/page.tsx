"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from "@sous/ui";
import { ChefHat, Plus, Scale, ArrowRight } from "lucide-react";
import { useAuth } from "@sous/features";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_RECIPES = gql`
  query GetRecipes($orgId: String!) {
    recipes(orgId: $orgId) {
      id
      name
      yieldAmount
      yieldUnit
    }
  }
`;

const CREATE_RECIPE = gql`
  mutation CreateRecipe($orgId: String!, $input: CreateRecipeInput!) {
    createRecipe(orgId: $orgId, input: $input) {
      id
      name
    }
  }
`;

export default function RecipesPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: "", yieldAmount: "", yieldUnit: "" });

  const { data, loading, refetch } = useQuery<any>(GET_RECIPES, {
    variables: { orgId },
    skip: !orgId,
  });

  const [createRecipe, { loading: creating }] = useMutation(CREATE_RECIPE);

  const handleCreate = async () => {
    try {
      await createRecipe({
        variables: {
          orgId,
          input: {
            ...newRecipe,
            yieldAmount: parseFloat(newRecipe.yieldAmount) || 0,
          },
        },
      });
      setShowAddModal(false);
      setNewRecipe({ name: "", yieldAmount: "", yieldUnit: "" });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const recipes = data?.recipes || [];

  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Culinary / Intellectual Property
          </Text>
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            Recipes
          </Text>
        </View>
        <Button 
          className="bg-sky-500 px-6 h-12"
          onClick={() => setShowAddModal(true)}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={18} color="white" />
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              New Recipe
            </Text>
          </View>
        </Button>
      </View>

      {loading ? (
        <Text className="text-zinc-500">Loading recipes...</Text>
      ) : recipes.length === 0 ? (
        <Card className="p-8 bg-zinc-900 border-zinc-800 items-center justify-center border-dashed min-h-[400px]">
          <ChefHat size={48} className="text-zinc-800 mb-4" />
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Recipe Box is Empty
          </Text>
          <Text className="text-zinc-700 text-sm max-w-xs text-center">
            Digitize your culinary library. Support for advanced scaling and
            bakers percentages.
          </Text>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => (
            <Card key={recipe.id} className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all group cursor-pointer hover:bg-zinc-900/50">
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-3 bg-black border border-zinc-800 rounded-xl">
                  <ChefHat size={20} className="text-zinc-400 group-hover:text-purple-500 transition-colors" />
                </View>
                <ArrowRight size={16} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              </View>
              
              <Text className="text-xl font-black text-white uppercase tracking-tight mb-4 truncate">
                {recipe.name}
              </Text>

              <div className="flex items-center gap-2 text-zinc-500 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50 w-fit">
                <Scale size={14} />
                <span className="text-xs font-mono font-bold uppercase">
                  Yield: {recipe.yieldAmount} {recipe.yieldUnit}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white font-black uppercase tracking-tight">New Recipe</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Recipe Name</Text>
              <Input
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="Beef Wellington"
              />
            </div>
            <div className="flex gap-4">
              <div className="grid gap-2 flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Yield Amount</Text>
                <Input
                  value={newRecipe.yieldAmount}
                  onChange={(e) => setNewRecipe({ ...newRecipe, yieldAmount: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="10"
                  type="number"
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Yield Unit</Text>
                <Input
                  value={newRecipe.yieldUnit}
                  onChange={(e) => setNewRecipe({ ...newRecipe, yieldUnit: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                  placeholder="portions"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="bg-sky-500 w-full">
              <Text className="text-white font-bold uppercase text-xs tracking-widest">
                {creating ? "Creating..." : "Create Recipe"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}