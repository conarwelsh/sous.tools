"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  GoogleDriveLogo,
  ScrollView,
  cn,
} from "@sous/ui";
import {
  ChefHat,
  Plus,
  Scale,
  ArrowRight,
  HardDrive,
  Loader2,
  CloudUpload,
  Search,
  Filter,
  Trash2,
  X,
} from "lucide-react";
import {
  useAuth,
  DrivePicker,
  GoogleDriveFile,
  RecipeForm,
} from "@sous/features";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { getHttpClient } from "@sous/client-sdk";

const GET_RECIPES = gql`
  query GetRecipes(
    $orgId: String!
    $search: String
    $source: String
    $tags: [String!]
  ) {
    recipes(orgId: $orgId, search: $search, source: $source, tags: $tags) {
      id
      name
      yieldAmount
      yieldUnit
      sourceType
      sourceUrl
    }
  }
`;

const GET_TAGS = gql`
  query GetTags($orgId: String!) {
    tags(orgId: $orgId) {
      id
      name
      color
    }
  }
`;

const GET_INGREDIENTS = gql`
  query GetIngredients($orgId: String!) {
    ingredients(orgId: $orgId) {
      id
      name
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

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($orgId: String!, $id: String!) {
    deleteRecipe(orgId: $orgId, id: $id) {
      id
    }
  }
`;

export default function RecipesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasGDrive, setHasGDrive] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        const http = await getHttpClient();
        const data = await http.get<any[]>("/integrations");
        setHasGDrive(
          data.some(
            (i) => i.provider === "google-drive" && (i.isActive || i.is_active),
          ),
        );
      } catch (e) {}
    };
    if (orgId) checkIntegrations();
  }, [orgId]);

  const { data, loading, refetch } = useQuery<any>(GET_RECIPES, {
    variables: {
      orgId,
      search: searchQuery || undefined,
      source: sourceFilter || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    },
    skip: !orgId,
  });

  const { data: tagData } = useQuery<any>(GET_TAGS, {
    variables: { orgId },
    skip: !orgId,
  });

  const { data: ingData } = useQuery<any>(GET_INGREDIENTS, {
    variables: { orgId },
    skip: !orgId || !showAddModal,
  });

  const [createRecipe] = useMutation(CREATE_RECIPE);
  const [deleteRecipe] = useMutation(DELETE_RECIPE);

  const handleDriveImport = async (selectedFiles: GoogleDriveFile[]) => {
    setIsSyncing(true);
    setShowDrivePicker(false);
    try {
      const http = await getHttpClient();
      for (const file of selectedFiles) {
        await http.post("/integrations/sync", {
          provider: "google-drive",
          fileId: file.id,
        });
      }
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveNew = async (recipeData: any) => {
    try {
      await createRecipe({
        variables: {
          orgId,
          input: {
            name: recipeData.name,
            yieldAmount: recipeData.yieldAmount,
            yieldUnit: recipeData.yieldUnit,
          },
        },
      });
      setShowAddModal(false);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await deleteRecipe({ variables: { orgId, id } });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const recipes = data?.recipes || [];
  const tags = tagData?.tags || [];

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSourceFilter(null);
    setSelectedTags([]);
  };

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
            className="bg-primary hover:bg-primary/90 px-6 h-12 shadow-xl shadow-primary/20"
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

      {/* Filters Toolbar */}
      <View className="gap-4 mb-8">
        <View className="flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search recipe box..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-card border-border rounded-xl font-bold uppercase text-xs"
            />
          </div>
          <div className="flex flex-row gap-2 bg-muted/30 p-1 rounded-xl border border-border">
            {[
              { id: null, label: "All Sources", icon: Filter },
              { id: "google-drive", label: "Drive", icon: GoogleDriveLogo },
              { id: "manual", label: "Manual", icon: ChefHat },
            ].map((s) => (
              <Button
                key={s.label}
                variant={sourceFilter === s.id ? "default" : "ghost"}
                onClick={() => setSourceFilter(s.id)}
                className={cn(
                  "h-10 px-4 gap-2",
                  sourceFilter === s.id
                    ? "bg-primary shadow-lg"
                    : "text-muted-foreground",
                )}
              >
                <s.icon size={14} />
                <span className="text-[10px] font-black uppercase">
                  {s.label}
                </span>
              </Button>
            ))}
          </div>
          {(searchQuery || sourceFilter || selectedTags.length > 0) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="h-12 px-4 text-sky-500 hover:text-sky-400"
            >
              <X size={16} className="mr-2" />
              <span className="text-[10px] font-black uppercase">Clear</span>
            </Button>
          )}
        </View>

        {tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            <div className="flex flex-row gap-2">
              {tags.map((tag: any) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <Button
                    key={tag.id}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleTag(tag.name)}
                    className={cn(
                      "h-7 px-3 rounded-full border-border transition-all",
                      isSelected && "bg-primary border-primary shadow-sm",
                    )}
                    style={isSelected ? { backgroundColor: tag.color } : {}}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {tag.name}
                    </span>
                  </Button>
                );
              })}
            </div>
          </ScrollView>
        )}
      </View>

      <DrivePicker
        open={showDrivePicker}
        onSelect={handleDriveImport}
        onCancel={() => setShowDrivePicker(false)}
        multiSelect
      />

      {loading ? (
        <View className="p-20 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </View>
      ) : recipes.length === 0 ? (
        <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
          <ChefHat size={48} className="text-muted-foreground mb-4" />
          <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest mb-2">
            No recipes found
          </Text>
          <Text className="text-muted-foreground text-sm max-w-xs text-center mb-8">
            Try adjusting your search filters or create a new recipe.
          </Text>
          <Button
            className="bg-primary hover:bg-primary/90 px-8 h-12"
            onClick={() => setShowAddModal(true)}
          >
            <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
              Create Recipe
            </Text>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => (
            <Card
              key={recipe.id}
              className="p-6 bg-card border-border hover:border-primary/50 transition-all group cursor-pointer hover:bg-muted/50 overflow-hidden"
              onClick={() => router.push(`/operations/recipes/${recipe.id}`)}
            >
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-3 bg-muted border border-border rounded-xl">
                  {recipe.sourceType === "google-drive" ? (
                    <GoogleDriveLogo
                      size={20}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  ) : (
                    <ChefHat
                      size={20}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  )}
                </View>
                <div className="flex flex-row items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={(e) => handleDelete(e, recipe.id)}
                    className="h-8 w-8 p-0 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </Button>
                  <ArrowRight
                    size={16}
                    className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                  />
                </div>
              </View>

              <Text className="text-xl font-black text-foreground uppercase tracking-tight mb-4 truncate">
                {recipe.name}
              </Text>

              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg border border-border w-fit">
                  <Scale size={14} />
                  <span className="text-xs font-mono font-bold uppercase">
                    Yield: {recipe.yieldAmount || "0"}{" "}
                    {recipe.yieldUnit || "---"}
                  </span>
                </div>
                {recipe.sourceType === "google-drive" && (
                  <Text className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                    Drive Asset
                  </Text>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Entry Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background border-border overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 border-b border-border flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-foreground font-black uppercase tracking-widest text-sm">
              Create New IP
            </DialogTitle>
            <Button
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X size={18} />
            </Button>
          </DialogHeader>
          <ScrollView className="flex-1 p-6">
            <RecipeForm
              ingredients={ingData?.ingredients || []}
              onSave={handleSaveNew}
              onCancel={() => setShowAddModal(false)}
            />
          </ScrollView>
        </DialogContent>
      </Dialog>
    </View>
  );
}
