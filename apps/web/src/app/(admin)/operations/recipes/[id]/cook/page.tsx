"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import { View, Text, Button, Card, ScrollView, cn, Logo } from "@sous/ui";
import {
  ChefHat,
  Scale,
  ArrowLeft,
  Loader2,
  Clock,
  ListChecks,
  Maximize2,
  Minimize2,
  Timer,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { useAuth } from "@sous/features";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { MessageSquare, Send } from "lucide-react";

const GET_RECIPE_FOR_COOK = gql`
  query GetRecipeForCook($id: String!, $orgId: String!) {
    recipe(id: $id, orgId: $orgId) {
      id
      name
      yieldAmount
      yieldUnit
      ingredients {
        id
        amount
        unit
        isBase
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
      notes {
        id
        note
        createdAt
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

const ADD_COOK_NOTE = gql`
  mutation AddCookNote($input: AddCookNoteInput!) {
    addCookNote(input: $input) {
      id
      note
      createdAt
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

function StepTimer({ duration, label }: { duration: number; label: string }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Button
      onClick={() => setIsRunning(!isRunning)}
      variant={isRunning ? "default" : "outline"}
      className={cn(
        "h-12 px-6 rounded-2xl gap-3 transition-all",
        isRunning
          ? "bg-amber-500 hover:bg-amber-600 animate-pulse border-amber-400"
          : "border-border hover:bg-muted",
      )}
    >
      <Timer
        size={18}
        className={isRunning ? "text-white" : "text-amber-500"}
      />
      <Text
        className={cn(
          "font-mono font-bold text-lg",
          isRunning ? "text-white" : "text-foreground",
        )}
      >
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Text>
      <Text
        className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          isRunning ? "text-amber-100" : "text-muted-foreground",
        )}
      >
        {label}
      </Text>
    </Button>
  );
}

export default function RecipeCookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const orgId = user?.organizationId || "";

  const { data, loading, refetch } = useQuery<any>(GET_RECIPE_FOR_COOK, {
    variables: { id, orgId },
    skip: !orgId || !id,
  });

  const [addNote, { loading: isAddingNote }] = useMutation(ADD_COOK_NOTE, {
    onCompleted: () => {
      setNewNote("");
      refetch();
    }
  });

  const [yieldOverride, setYieldOverride] = useState<number | null>(null);
  const [lockedIngredientId, setLockedIngredientId] = useState<string | null>(
    null,
  );
  const [lockedWeight, setLockedWeight] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredIngredientId, setHoveredIngredientId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");

  // Wake Lock Implementation
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          console.log("[CookMode] Wake Lock Active");
        }
          } catch (err) {
            // Ignore
          }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);

  const recipe = data?.recipe;

  // Smart Highlighting Engine
  const renderHighlightedInstruction = (text: string) => {
    if (!recipe?.ingredients) return text;
    
    // Sort by length descending to match longest names first (e.g. "Salted Butter" before "Butter")
    const sortedIngs = [...recipe.ingredients].sort((a, b) => b.ingredient.name.length - a.ingredient.name.length);
    let parts: (string | React.ReactNode)[] = [text];

    sortedIngs.forEach((ri) => {
      const name = ri.ingredient.name;
      const regex = new RegExp(`\\b(${name}s?)\\b`, 'gi'); // Handle plurals basic
      
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach(part => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }
        
        const segments = part.split(regex);
        for (let i = 0; i < segments.length; i++) {
          if (i % 2 === 1) { // Match
            newParts.push(
              <span 
                key={`${ri.id}-${i}`}
                onMouseEnter={() => setHoveredIngredientId(ri.id)}
                onMouseLeave={() => setHoveredIngredientId(null)}
                className={cn(
                  "text-sky-400 font-bold border-b-2 border-sky-400/20 cursor-help transition-all px-1 rounded-md",
                  hoveredIngredientId === ri.id ? "bg-sky-400/20 border-sky-400/50 scale-105" : "hover:bg-sky-400/10"
                )}
              >
                {segments[i]}
              </span>
            );
          } else if (segments[i]) {
            newParts.push(segments[i]);
          }
        }
      });
      parts = newParts;
    });

    return parts;
  };

  // Baker's Math & Scaling Engine
  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];

    const baseIngredients = recipe.ingredients;
    const originalYield = recipe.yieldAmount || 1;

    // Determine scale factor
    let scale = 1;

    if (lockedIngredientId && lockedWeight !== null) {
      const targetIng = baseIngredients.find(
        (i: any) => i.id === lockedIngredientId,
      );
      if (targetIng && targetIng.amount > 0) {
        scale = lockedWeight / targetIng.amount;
      }
    } else if (yieldOverride !== null) {
      scale = yieldOverride / originalYield;
    }

    return baseIngredients.map((ri: any) => ({
      ...ri,
      scaledAmount: ri.amount * scale,
    }));
  }, [recipe, yieldOverride, lockedIngredientId, lockedWeight]);

  const currentYield = yieldOverride || recipe?.yieldAmount || 0;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote({
      variables: {
        input: {
          recipeId: id,
          note: newNote
        }
      }
    });
  };

  if (loading || !recipe) {
    return (
      <View className="flex-1 bg-background items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <Text className="text-muted-foreground font-black uppercase text-xs tracking-[0.2em]">
          Synchronizing Protocol...
        </Text>
      </View>
    );
  }

  return (
    <View
      className={cn(
        "flex-1 bg-[#050505] text-white flex flex-col h-screen overflow-hidden",
        isFullscreen ? "fixed inset-0 z-[1000]" : "",
      )}
    >
      {/* HUD Header */}
      <View className="h-24 border-b border-white/5 flex flex-row items-center justify-between px-8 bg-black/40 backdrop-blur-xl">
        <View className="flex-row items-center gap-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-white/40 hover:text-white p-0"
          >
            <ArrowLeft size={24} />
          </Button>
          <View>
            <Text className="text-sky-500 font-black uppercase text-[10px] tracking-[0.3em] mb-1">
              Cook Protocol Alpha
            </Text>
            <Text className="text-2xl font-black uppercase tracking-tight">
              {recipe.name}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4">
          <div className="flex flex-row items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
            <Scale size={18} className="text-sky-500" />
            <div className="flex flex-col">
              <Text className="text-[8px] font-black uppercase text-white/40 leading-none mb-1">
                Target Yield
              </Text>
              <div className="flex flex-row items-end gap-1.5">
                <input
                  type="number"
                  value={currentYield}
                  onChange={(e) => {
                    setYieldOverride(parseFloat(e.target.value));
                    setLockedIngredientId(null);
                  }}
                  className="bg-transparent border-none p-0 text-xl font-black text-white w-20 outline-none focus:text-sky-400 transition-colors"
                />
                <Text className="text-xs font-black uppercase text-white/60 mb-1">
                  {recipe.yieldUnit}
                </Text>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            variant="ghost"
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 p-0"
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </Button>
        </View>
      </View>

      <View className="flex-1 flex-row overflow-hidden">
        {/* Components Panel (Left) */}
        <View className="w-[450px] border-r border-white/5 flex flex-col bg-black/20">
          <View className="p-8 border-b border-white/5 flex-row items-center gap-3">
            <ListChecks size={20} className="text-sky-500" />
            <Text className="font-black uppercase text-sm tracking-[0.2em]">
              Components
            </Text>
          </View>
          <ScrollView className="flex-1 p-6">
            <View className="gap-3">
              {scaledIngredients.map((ri: any) => {
                const isLocked = lockedIngredientId === ri.id;
                const isHighlighted = hoveredIngredientId === ri.id;
                return (
                  <Card 
                    key={ri.id} 
                    onMouseEnter={() => setHoveredIngredientId(ri.id)}
                    onMouseLeave={() => setHoveredIngredientId(null)}
                    className={cn(
                      "p-6 bg-white/[0.03] border-white/5 rounded-3xl flex flex-row items-center justify-between transition-all",
                      isLocked ? "border-sky-500 bg-sky-500/10 shadow-[0_0_30px_rgba(14,165,233,0.1)]" : "hover:bg-white/[0.05]",
                      isHighlighted ? "border-sky-400/50 bg-sky-400/5 ring-1 ring-sky-400/20" : ""
                    )}
                  >
                    <View className="flex-1">
                      <Text className={cn("font-black uppercase tracking-tight text-lg", (isLocked || isHighlighted) ? "text-sky-400" : "text-white")}>
                        {ri.ingredient.name}
                      </Text>
                      {ri.isBase && (
                        <div className="flex flex-row items-center gap-1.5 mt-1">
                          <Zap
                            size={10}
                            fill="#0ea5e9"
                            className="text-sky-500"
                          />
                          <Text className="text-[8px] font-black uppercase text-sky-500 tracking-widest">
                            Base Component
                          </Text>
                        </div>
                      )}
                    </View>
                    <div className="flex flex-row items-center gap-4">
                      <div className="flex flex-col items-end">
                        <div className="flex flex-row items-baseline gap-1.5">
                          <input
                            type="number"
                            value={ri.scaledAmount.toFixed(1)}
                            onChange={(e) => {
                              setLockedIngredientId(ri.id);
                              setLockedWeight(parseFloat(e.target.value));
                              setYieldOverride(null);
                            }}
                            className={cn(
                              "bg-transparent border-none p-0 text-2xl font-black w-24 text-right outline-none",
                              (isLocked || isHighlighted) ? "text-sky-400" : "text-white"
                            )}
                          />
                          <Text className="text-xs font-black uppercase text-white/40">
                            {ri.unit}
                          </Text>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isLocked) {
                            setLockedIngredientId(null);
                            setLockedWeight(null);
                          } else {
                            setLockedIngredientId(ri.id);
                            setLockedWeight(ri.scaledAmount);
                            setYieldOverride(null);
                          }
                        }}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isLocked
                            ? "bg-sky-500 text-white"
                            : "bg-white/5 text-white/20 hover:bg-white/10",
                        )}
                      >
                        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Protocol Panel (Right) */}
        <View className="flex-1 flex flex-col">
          <View className="p-8 border-b border-white/5 flex-row items-center justify-between bg-black/20">
            <View className="flex-row items-center gap-3">
              <ChefHat size={20} className="text-amber-500" />
              <Text className="font-black uppercase text-sm tracking-[0.2em]">Execution Protocol</Text>
            </View>
            <View className="flex-row items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <Text className="text-[10px] font-black uppercase tracking-widest text-white/40">Mode: Active</Text>
            </View>
          </View>
          
          <ScrollView className="flex-1 p-12">
            <View className="max-w-4xl mx-auto gap-16 pb-32">
              {recipe.steps
                .sort((a: any, b: any) => a.order - b.order)
                .map((step: any, idx: number) => (
                  <View
                    key={step.id}
                    className="flex flex-row gap-12 group/step"
                  >
                    <View className="items-center">
                      <View className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/step:border-amber-500/50 group-hover/step:bg-amber-500/5 transition-all duration-500">
                        <Text className="text-white/20 font-black text-xl group-hover/step:text-amber-500">
                          {idx + 1}
                        </Text>
                      </View>
                      {idx < recipe.steps.length - 1 && (
                        <View className="w-px flex-1 bg-white/5 my-4" />
                      )}
                    </View>
                    <View className="flex-1 pt-2">
                      <Text className="text-2xl font-medium leading-relaxed text-white/90 mb-8 select-text">
                        {renderHighlightedInstruction(step.instruction)}
                      </Text>

                      {step.timerDuration && (
                        <StepTimer
                          duration={step.timerDuration}
                          label={`Phase ${idx + 1} Timer`}
                        />
                      )}
                    </View>
                  </View>
                ))}

              {/* Cook Notes Section */}
              <View className="mt-32 pt-16 border-t border-white/10 gap-12">
                <View className="flex-row items-center gap-4">
                  <MessageSquare size={24} className="text-sky-500" />
                  <Text className="text-2xl font-black uppercase tracking-tight">Cook Log</Text>
                </View>

                {/* Add Note Input */}
                <View className="gap-4">
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter observation (e.g. 'Oven ran hot', 'Used extra flour')..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-sky-500/50 focus:bg-sky-500/5 transition-all"
                  />
                  <View className="flex-row justify-end">
                    <Button 
                      onClick={handleAddNote}
                      disabled={isAddingNote || !newNote.trim()}
                      className="bg-sky-500 h-12 px-8 rounded-xl gap-3"
                    >
                      {isAddingNote ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      <Text className="text-white font-black uppercase text-xs tracking-widest">Post Log Entry</Text>
                    </Button>
                  </View>
                </View>

                {/* Past Notes */}
                <View className="gap-6">
                  {recipe.notes?.map((note: any) => (
                    <Card key={note.id} className="p-6 bg-white/[0.02] border-white/5 rounded-2xl">
                      <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                            <Text className="text-sky-500 font-black text-[10px]">{note.user.firstName[0]}{note.user.lastName[0]}</Text>
                          </div>
                          <Text className="font-bold text-xs text-white/80">{note.user.firstName} {note.user.lastName}</Text>
                        </View>
                        <Text className="text-[10px] font-mono text-white/20">{new Date(note.createdAt).toLocaleString()}</Text>
                      </View>
                      <Text className="text-sm text-white/60 leading-relaxed italic">"{note.note}"</Text>
                    </Card>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Protocol HUD Footer */}
      <View className="h-20 border-t border-white/5 bg-black/60 backdrop-blur-xl px-8 flex flex-row items-center justify-between">
        <View className="flex-row items-center gap-8">
          <View className="flex-row items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">
              Bio-Metric Monitoring Active
            </Text>
          </View>
          <View className="h-4 w-px bg-white/10" />
          <View className="flex-row items-center gap-3 text-white/40">
            <Clock size={14} />
            <Text className="text-[10px] font-black uppercase tracking-widest">
              Protocol Started:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <Logo variant="cloud" size={24} suffix="os" className="opacity-20" />
      </View>
    </View>
  );
}
