"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, cn } from "@sous/ui";
import { Truck, Plus, Search, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@sous/features";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const GET_SUPPLIERS = gql`
  query GetSuppliers($orgId: String!) {
    suppliers(orgId: $orgId) {
      id
      name
      email
      phone
      address
      status
    }
  }
`;

const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($orgId: String!, $input: CreateSupplierInput!) {
    createSupplier(orgId: $orgId, input: $input) {
      id
      name
    }
  }
`;

const DAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

export default function SuppliersPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState<any>({ 
    name: "", 
    contactEmail: "", 
    contactPhone: "", 
    address: "",
    deliveryDays: [],
    cutoffTime: "16:00",
    minOrderValue: 0
  });

  const { data, loading, refetch } = useQuery<any>(GET_SUPPLIERS, {
    variables: { orgId },
    skip: !orgId,
  });

  const [createSupplier, { loading: creating }] = useMutation(CREATE_SUPPLIER);

  const handleCreate = async () => {
    try {
      await createSupplier({
        variables: {
          orgId,
          input: {
            ...newSupplier,
            minOrderValue: parseInt(newSupplier.minOrderValue) * 100 // Convert to cents
          },
        },
      });
      setShowAddModal(false);
      setNewSupplier({ 
        name: "", 
        contactEmail: "", 
        contactPhone: "", 
        address: "",
        deliveryDays: [],
        cutoffTime: "16:00",
        minOrderValue: 0
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDay = (day: number) => {
    const current = [...newSupplier.deliveryDays];
    if (current.includes(day)) {
      setNewSupplier({ ...newSupplier, deliveryDays: current.filter(d => d !== day) });
    } else {
      setNewSupplier({ ...newSupplier, deliveryDays: [...current, day].sort() });
    }
  };

  const suppliers = data?.suppliers || [];

  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Procurement / Partners
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Suppliers
          </Text>
        </View>
        <Button
          className="bg-sky-500 hover:bg-sky-600 px-6 h-12"
          onClick={() => setShowAddModal(true)}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={18} color="white" />
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              Add Supplier
            </Text>
          </View>
        </Button>
      </View>

      {loading ? (
        <Text className="text-muted-foreground">Loading suppliers...</Text>
      ) : suppliers.length === 0 ? (
        <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
          <Truck size={48} className="text-muted-foreground/20 mb-4" />
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            No Suppliers Found
          </Text>
          <Text className="text-muted-foreground/60 text-sm max-w-xs text-center">
            Start by adding your vendors to track invoices and ingredient
            pricing trends.
          </Text>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier: any) => (
            <Card
              key={supplier.id}
              className="p-6 bg-card border-border hover:border-primary/50 transition-all group"
            >
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-3 bg-muted border border-border rounded-xl">
                  <Truck
                    size={20}
                    className="text-muted-foreground group-hover:text-sky-500 transition-colors"
                  />
                </View>
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Active
                </div>
              </View>

              <Text className="text-xl font-black text-foreground uppercase tracking-tight mb-4">
                {supplier.name}
              </Text>

              <div className="space-y-4">
                <div className="space-y-2">
                  {supplier.contactEmail && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail size={14} />
                      <span className="text-xs font-mono">{supplier.contactEmail}</span>
                    </div>
                  )}
                  {supplier.contactPhone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone size={14} />
                      <span className="text-xs font-mono">{supplier.contactPhone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50 space-y-3">
                   <div className="flex justify-between items-center">
                      <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Delivery Days</Text>
                      <div className="flex gap-1">
                        {DAYS.map(d => (
                          <div 
                            key={d.value}
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black",
                              supplier.deliveryDays?.includes(d.value) ? "bg-sky-500 text-white" : "bg-muted text-muted-foreground/40"
                            )}
                          >
                            {d.label}
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="flex justify-between items-center">
                      <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order Min</Text>
                      <Text className="text-[10px] font-black text-foreground">${(supplier.minOrderValue / 100).toFixed(2)}</Text>
                   </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black uppercase tracking-tight">
              Add New Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">Name</Text>
                <Input
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="Vendor Name"
                />
              </div>
              <div className="grid gap-2">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">Min Order ($)</Text>
                <Input
                  type="number"
                  value={newSupplier.minOrderValue}
                  onChange={(e) => setNewSupplier({ ...newSupplier, minOrderValue: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">Email</Text>
                <Input
                  value={newSupplier.contactEmail}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="orders@vendor.com"
                />
              </div>
              <div className="grid gap-2">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">Phone</Text>
                <Input
                  value={newSupplier.contactPhone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPhone: e.target.value })}
                  className="bg-muted border-border"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">Delivery Schedule</Text>
              <div className="flex justify-between bg-muted p-3 rounded-2xl border border-border">
                {DAYS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                      newSupplier.deliveryDays.includes(d.value) 
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 scale-110" 
                        : "bg-background text-muted-foreground hover:bg-white/50"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest ml-1">Address</Text>
              <Input
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                className="bg-muted border-border"
                placeholder="123 Vendor St, City, ST"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="bg-sky-500 hover:bg-sky-600 w-full h-12 shadow-xl shadow-sky-500/20">
              <Text className="text-white font-bold uppercase text-xs tracking-widest">
                {creating ? "Creating..." : "Create Supplier Partner"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}
