"use client";

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Button,
  Card,
  Input,
  ScrollView,
  cn,
  Checkbox,
} from "@sous/ui";
import {
  ShoppingBag,
  Plus,
  Search,
  ChevronRight,
  Truck,
  Calendar,
  Package,
  Database,
  ArrowRight,
  Loader2,
  Trash2,
  MoreVertical,
  Check,
  Zap,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "@sous/features";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_PROCUREMENT_DATA = gql`
  query GetProcurementData($orgId: String!) {
    shoppingList(orgId: $orgId) {
      id
      quantity
      unit
      status
      createdAt
      ingredient {
        id
        name
        currentPrice
      }
      preferredSupplier {
        id
        name
        deliveryDays
      }
    }
    suppliers(orgId: $orgId) {
      id
      name
      deliveryDays
      cutoffTime
    }
    ingredients(orgId: $orgId) {
      id
      name
      baseUnit
    }
  }
`;

const ADD_TO_LIST = gql`
  mutation AddToShoppingList($orgId: String!, $input: AddToShoppingListInput!) {
    addToShoppingList(orgId: $orgId, input: $input) {
      id
    }
  }
`;

const UPDATE_LIST_ITEM = gql`
  mutation UpdateShoppingListItem(
    $orgId: String!
    $id: ID!
    $input: UpdateShoppingListItemInput!
  ) {
    updateShoppingListItem(orgId: $orgId, id: $id, input: $input) {
      id
    }
  }
`;

const PLACE_ORDER = gql`
  mutation PlaceOrder($orgId: String!, $supplierId: ID!, $itemIds: [ID!]!) {
    placeOrder(orgId: $orgId, supplierId: $supplierId, itemIds: $itemIds) {
      id
      status
    }
  }
`;

interface ShoppingListItem {
  id: string;
  quantity: number;
  unit: string;
  status: string;
  createdAt: string;
  ingredient: {
    id: string;
    name: string;
    currentPrice: number;
  };
  preferredSupplier: {
    id: string;
    name: string;
    deliveryDays: number[];
  };
}

interface Supplier {
  id: string;
  name: string;
  deliveryDays: number[];
  cutoffTime: string;
}

interface Ingredient {
  id: string;
  name: string;
  baseUnit: string;
}

interface ProcurementData {
  shoppingList: ShoppingListItem[];
  suppliers: Supplier[];
  ingredients: Ingredient[];
}

export default function OrderManagerPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );

  const { data, loading, refetch } = useQuery<ProcurementData>(
    GET_PROCUREMENT_DATA,
    {
      variables: { orgId },
      skip: !orgId,
    },
  );

  const [addToList] = useMutation(ADD_TO_LIST, {
    onCompleted: () => refetch(),
  });
  const [updateItem] = useMutation(UPDATE_LIST_ITEM, {
    onCompleted: () => refetch(),
  });
  const [placeOrder, { loading: isPlacingOrder }] = useMutation(PLACE_ORDER, {
    onCompleted: () => {
      refetch();
      alert("Order placed successfully!");
    },
  });

  const shoppingList = data?.shoppingList || [];
  const suppliers = data?.suppliers || [];
  const ingredients = data?.ingredients || [];

  // Group items by supplier
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    shoppingList.forEach((item: any) => {
      const supplierId = item.preferredSupplier?.id || "unassigned";
      if (!groups[supplierId]) groups[supplierId] = [];
      groups[supplierId].push(item);
    });
    return groups;
  }, [shoppingList]);

  // Next delivery helper
  const getNextDelivery = (deliveryDays: number[]) => {
    if (!deliveryDays || deliveryDays.length === 0) return "No schedule";
    const today = new Date().getDay();
    const sortedDays = [...deliveryDays].sort();
    const nextDay = sortedDays.find((d) => d > today) ?? sortedDays[0];
    const daysUntil = nextDay > today ? nextDay - today : 7 - today + nextDay;

    const date = new Date();
    date.setDate(date.getDate() + daysUntil);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleQuickAdd = async (ingredient: any) => {
    try {
      await addToList({
        variables: {
          orgId,
          input: {
            ingredientId: ingredient.id,
            quantity: 1,
            unit: ingredient.baseUnit || "ea",
          },
        },
      });
      setSearchQuery("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateQty = (id: string, qty: string) => {
    const val = parseFloat(qty);
    if (isNaN(val)) return;
    updateItem({ variables: { orgId, id, input: { quantity: val } } });
  };

  const filteredIngredients = useMemo(() => {
    if (!searchQuery) return [];
    return ingredients
      .filter((i: any) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5);
  }, [searchQuery, ingredients]);

  return (
    <View className="flex-1 bg-background p-8">
      {/* Header */}
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] mb-2">
            Procurement / Living Order List
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Order Manager
          </Text>
        </View>
        <View className="flex-row gap-3">
          <div className="flex bg-muted/50 rounded-2xl p-1 border border-border">
            <Button
              variant="ghost"
              className="h-10 px-6 rounded-xl bg-background shadow-sm"
            >
              <Text className="text-[10px] font-black uppercase tracking-widest text-primary">
                Living List
              </Text>
            </Button>
            <Button variant="ghost" className="h-10 px-6 rounded-xl">
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Order History
              </Text>
            </Button>
          </div>
        </View>
      </View>

      <View className="flex-row gap-8">
        {/* Main List Area */}
        <View className="flex-[3] gap-8">
          {/* Quick Add Bar */}
          <div className="relative z-[100]">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="I noticed we are low on..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 bg-card border-border rounded-2xl shadow-xl font-bold text-lg uppercase tracking-tight"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full"
                >
                  <X size={20} />
                </Button>
              )}
            </div>

            {filteredIngredients.length > 0 && (
              <Card className="absolute top-20 left-0 right-0 p-2 bg-card border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                {filteredIngredients.map((ing: any) => (
                  <div
                    key={ing.id}
                    onClick={() => handleQuickAdd(ing)}
                    className="flex flex-row items-center justify-between p-4 hover:bg-primary/10 rounded-xl cursor-pointer transition-colors group"
                  >
                    <View className="flex-row items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border group-hover:bg-primary/20">
                        <Plus
                          size={18}
                          className="text-muted-foreground group-hover:text-primary"
                        />
                      </div>
                      <Text className="font-black uppercase tracking-tight text-foreground">
                        {ing.name}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {ing.baseUnit}
                    </Text>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {loading ? (
            <View className="p-20 items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={48} />
            </View>
          ) : shoppingList.length === 0 ? (
            <Card className="p-20 bg-card border-border border-dashed items-center justify-center rounded-[2.5rem]">
              <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                <ShoppingBag size={48} className="text-muted-foreground/20" />
              </div>
              <Text className="text-muted-foreground font-black uppercase text-xs tracking-widest mb-2">
                Everything looks good
              </Text>
              <Text className="text-muted-foreground/60 text-sm max-w-xs text-center mb-8">
                Your living order list is empty. Add items as you notice they
                are low, or wait for system suggestions.
              </Text>
            </Card>
          ) : (
            <View className="gap-12">
              {Object.entries(groupedItems).map(([supplierId, items]) => {
                const supplier = suppliers.find(
                  (s: any) => s.id === supplierId,
                );
                const isUnassigned = supplierId === "unassigned";

                return (
                  <View key={supplierId} className="gap-6">
                    {/* Group Header */}
                    <View className="flex-row items-center justify-between px-2">
                      <View className="flex-row items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center border",
                            isUnassigned
                              ? "bg-muted/20 border-border"
                              : "bg-sky-500/10 border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]",
                          )}
                        >
                          <Truck
                            size={24}
                            className={
                              isUnassigned
                                ? "text-muted-foreground"
                                : "text-sky-500"
                            }
                          />
                        </div>
                        <View>
                          <Text className="font-black uppercase text-xl tracking-tighter text-foreground">
                            {isUnassigned ? "Unassigned Items" : supplier?.name}
                          </Text>
                          {!isUnassigned && (
                            <View className="flex-row items-center gap-3">
                              <div className="flex flex-row items-center gap-1.5 text-sky-500">
                                <Calendar size={12} />
                                <Text className="text-[10px] font-black uppercase tracking-widest">
                                  Next:{" "}
                                  {getNextDelivery(
                                    supplier?.deliveryDays || [],
                                  )}
                                </Text>
                              </div>
                              <Text className="text-muted-foreground/30 text-[10px]">
                                •
                              </Text>
                              <div className="flex flex-row items-center gap-1.5 text-muted-foreground">
                                <Clock size={12} />
                                <Text className="text-[10px] font-black uppercase tracking-widest">
                                  Cutoff: {supplier?.cutoffTime || "None"}
                                </Text>
                              </div>
                            </View>
                          )}
                        </View>
                      </View>

                      {!isUnassigned && (
                        <Button
                          onClick={() =>
                            placeOrder({
                              variables: {
                                orgId,
                                supplierId,
                                itemIds: items.map((i) => i.id),
                              },
                            })
                          }
                          disabled={isPlacingOrder}
                          className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 gap-3 group"
                        >
                          <Check
                            size={18}
                            className="text-primary-foreground group-hover:scale-110 transition-transform"
                          />
                          <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
                            Place Order ({items.length})
                          </Text>
                        </Button>
                      )}
                    </View>

                    {/* Group Items */}
                    <View className="gap-3">
                      {items.map((item: any) => (
                        <Card
                          key={item.id}
                          className="p-4 bg-card border-border hover:border-primary/30 transition-all flex flex-row items-center justify-between rounded-2xl group/item"
                        >
                          <View className="flex-row items-center gap-4 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center border border-border group-hover/item:bg-primary/5 transition-colors">
                              <Package
                                size={18}
                                className="text-muted-foreground group-hover/item:text-primary transition-colors"
                              />
                            </div>
                            <View className="flex-1">
                              <Text className="font-black uppercase text-sm tracking-tight text-foreground">
                                {item.ingredient.name}
                              </Text>
                              <View className="flex-row items-center gap-3">
                                <Text className="text-[10px] text-muted-foreground/60 font-black uppercase">
                                  Last: Sysco
                                </Text>
                                {item.source === "system_suggestion" && (
                                  <div className="flex flex-row items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    <Zap size={8} fill="currentColor" />
                                    <Text className="text-[7px] font-black uppercase tracking-widest">
                                      Suggested
                                    </Text>
                                  </div>
                                )}
                              </View>
                            </View>
                          </View>

                          <View className="flex-row items-center gap-6">
                            <View className="items-end">
                              <div className="flex flex-row items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/50">
                                <input
                                  type="number"
                                  defaultValue={item.quantity}
                                  onBlur={(e) =>
                                    handleUpdateQty(item.id, e.target.value)
                                  }
                                  className="w-12 bg-transparent text-center font-black text-sm outline-none"
                                />
                                <Text className="text-[10px] font-black uppercase text-muted-foreground pr-3 border-l border-border/50 pl-2">
                                  {item.unit}
                                </Text>
                              </div>
                            </View>

                            <select
                              value={item.preferredSupplier?.id || ""}
                              onChange={(e) =>
                                updateItem({
                                  variables: {
                                    orgId,
                                    id: item.id,
                                    input: {
                                      preferredSupplierId:
                                        e.target.value || null,
                                    },
                                  },
                                })
                              }
                              className="bg-muted/50 border border-border rounded-xl px-3 h-10 text-[10px] font-black uppercase appearance-none min-w-[120px]"
                            >
                              <option value="">Move to...</option>
                              {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>

                            <Button
                              variant="ghost"
                              className="h-10 w-10 p-0 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </View>
                        </Card>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Sidebar Panel */}
        <View className="flex-1 flex flex-col gap-8">
          <Card className="p-6 bg-card border-border rounded-3xl shadow-2xl">
            <Text className="text-foreground font-black uppercase text-xs tracking-[0.2em] mb-6 flex flex-row items-center gap-2">
              <Zap size={14} className="text-amber-500" fill="currentColor" />
              Insights
            </Text>
            <View className="gap-6">
              <View className="gap-2">
                <Text className="text-[10px] font-black uppercase text-muted-foreground leading-tight">
                  Cutoff Reminders
                </Text>
                <Card className="p-4 bg-muted/20 border-border border-dashed rounded-2xl items-center justify-center">
                  <Clock size={24} className="text-muted-foreground/20 mb-2" />
                  <Text className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest text-center">
                    No orders reaching cutoff in next 4h
                  </Text>
                </Card>
              </View>

              <View className="gap-2">
                <Text className="text-[10px] font-black uppercase text-muted-foreground leading-tight">
                  Supplier Schedule
                </Text>
                <View className="gap-2">
                  {suppliers.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-row items-center justify-between p-3 bg-muted/10 border border-border/30 rounded-xl"
                    >
                      <Text className="text-[9px] font-black uppercase text-foreground/70">
                        {s.name}
                      </Text>
                      <Text className="text-[8px] font-black uppercase text-sky-500">
                        {getNextDelivery(s.deliveryDays)}
                      </Text>
                    </div>
                  ))}
                </View>
              </View>
            </View>
          </Card>

          <Card className="p-6 bg-sky-500 border-sky-400 rounded-3xl shadow-2xl shadow-sky-500/20">
            <View className="flex-row items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Plus size={16} className="text-white" />
              </div>
              <Text className="text-white font-black uppercase text-[10px] tracking-widest">
                New Supplier
              </Text>
            </View>
            <Text className="text-white/80 text-xs mb-6 font-medium leading-relaxed">
              Expand your network to optimize pricing and availability.
            </Text>
            <Button
              variant="ghost"
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl h-10"
            >
              <span className="font-black uppercase text-[10px] tracking-widest">
                Add Vendor
              </span>
            </Button>
          </Card>
        </View>
      </View>
    </View>
  );
}
