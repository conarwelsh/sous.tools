"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, GoogleDriveLogo } from "@sous/ui";
import { ChefHat, Plus, Scale, ArrowRight, HardDrive, Loader2, CloudUpload } from "lucide-react";
import { useAuth, DrivePicker, GoogleDriveFile } from "@sous/features";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { getHttpClient } from "@sous/client-sdk";

const GET_RECIPES = gql`
  query GetRecipes($orgId: String!) {
    recipes(orgId: $orgId) {
      id
      name
      yieldAmount
      yieldUnit
      sourceType
      sourceUrl
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
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: "", yieldAmount: "", yieldUnit: "" });
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasGDrive, setHasGDrive] = useState(false);

  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        const http = await getHttpClient();
        const data = await http.get<any[]>("/integrations");
        setHasGDrive(data.some(i => i.provider === 'google-drive' && (i.isActive || i.is_active)));
      } catch (e) {
        // Ignore error
      }
    };
    if (orgId) checkIntegrations();
  }, [orgId]);

  const { data, loading, refetch } = useQuery<any>(GET_RECIPES, {
    variables: { orgId },
    skip: !orgId,
  });

  const [createRecipe, { loading: creating }] = useMutation(CREATE_RECIPE);

  const handleDriveImport = async (selectedFiles: GoogleDriveFile[]) => {
    setIsSyncing(true);
    setShowDrivePicker(false);
    try {
      const http = await getHttpClient();
      
      // In a real flow, this would trigger the AI ingestion sessions
      // For now, we process them individually
      for (const file of selectedFiles) {
        await http.post("/integrations/sync", { 
          provider: "google-drive",
          fileId: file.id 
        });
      }
      
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreate = async () => {
    try {
      const input: any = {
        name: newRecipe.name,
      };

      if (newRecipe.yieldAmount) {
        input.yieldAmount = parseFloat(newRecipe.yieldAmount);
      }

      if (newRecipe.yieldUnit) {
        input.yieldUnit = newRecipe.yieldUnit;
      }

      await createRecipe({
        variables: {
          orgId,
          input,
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
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Operations / Intellectual Property
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Recipes
          </Text>
        </View>
        <div className="flex flex-row gap-3">
          {hasGDrive && (
            <Button 
              variant="outline"
              className="border-border hover:bg-primary/5 px-6 h-12"
              onClick={() => setShowDrivePicker(true)}
              disabled={isSyncing}
            >
              <View className="flex-row items-center gap-2">
                {isSyncing ? (
                  <Loader2 size={18} className="animate-spin text-primary" />
                ) : (
                  <CloudUpload size={18} />
                )}
                <Text className="text-foreground font-black uppercase text-[10px] tracking-widest">
                  {isSyncing ? "Importing..." : "Upload From Google Drive"}
                </Text>
              </View>
            </Button>
          )}
          <Button 
            className="bg-primary hover:bg-primary/90 px-6 h-12"
            onClick={() => setShowAddModal(true)}
          >
            <View className="flex-row items-center gap-2">
              <Plus size={18} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
                New Recipe
              </Text>
            </View>
          </Button>
        </div>
      </View>

      <DrivePicker 
        open={showDrivePicker}
        onSelect={handleDriveImport}
        onCancel={() => setShowDrivePicker(false)}
        multiSelect
      />

      {loading ? (
        <Text className="text-muted-foreground">Loading recipes...</Text>
      ) : recipes.length === 0 ? (
        <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
          <ChefHat size={48} className="text-muted-foreground mb-4" />
          <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest mb-2">
            Recipe Box is Empty
          </Text>
          <Text className="text-muted-foreground text-sm max-w-xs text-center mb-8">
            Digitize your culinary library. Support for advanced scaling, 
            AI-driven extraction, and bakers percentages.
          </Text>
          
          <View className="flex-row gap-4">
            <Button 
              className="bg-primary hover:bg-primary/90 px-8 h-12"
              onClick={() => setShowAddModal(true)}
            >
              <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
                Create First Recipe
              </Text>
            </Button>
            
            {!hasGDrive && (
              <Button 
                variant="outline"
                className="border-border hover:bg-muted px-8 h-12 gap-2"
                onClick={() => router.push("/settings/integrations")}
              >
                <GoogleDriveLogo size={18} />
                <Text className="text-foreground font-black uppercase text-xs tracking-widest">
                  Connect Drive
                </Text>
              </Button>
            )}
          </View>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => (
            <Card 
              key={recipe.id} 
              className="p-6 bg-card border-border hover:border-primary/50 transition-all group cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/operations/recipes/${recipe.id}`)}
            >
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-3 bg-muted border border-border rounded-xl">
                  {recipe.sourceType === 'google-drive' ? (
                    <GoogleDriveLogo size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <ChefHat size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </View>
                <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </View>
              
              <Text className="text-xl font-black text-foreground uppercase tracking-tight mb-4 truncate">
                {recipe.name}
              </Text>

              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border w-fit">
                  <Scale size={14} />
                  <span className="text-xs font-mono font-bold uppercase">
                    Yield: {recipe.yieldAmount || '0'} {recipe.yieldUnit || '---'}
                  </span>
                </div>
                {recipe.sourceType === 'google-drive' && (
                  <Text className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">Drive Asset</Text>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black uppercase tracking-tight">New Recipe</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Recipe Name</Text>
              <Input
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                className="bg-muted border-border"
                placeholder="Beef Wellington"
              />
            </div>
            <div className="flex gap-4">
              <div className="grid gap-2 flex-1">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Yield Amount</Text>
                <Input
                  value={newRecipe.yieldAmount}
                  onChange={(e) => setNewRecipe({ ...newRecipe, yieldAmount: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="10"
                  type="number"
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Yield Unit</Text>
                <Input
                  value={newRecipe.yieldUnit}
                  onChange={(e) => setNewRecipe({ ...newRecipe, yieldUnit: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="portions"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="bg-primary w-full">
              <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
                {creating ? "Creating..." : "Create Recipe"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}