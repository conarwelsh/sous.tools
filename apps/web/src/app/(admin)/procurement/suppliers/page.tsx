"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@sous/ui";
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

export default function SuppliersPage() {
  const { user } = useAuth();
  const orgId = user?.organizationId || "";
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: "", email: "", phone: "" });

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
          input: newSupplier,
        },
      });
      setShowAddModal(false);
      setNewSupplier({ name: "", email: "", phone: "" });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const suppliers = data?.suppliers || [];

  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Procurement / Partners
          </Text>
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            Suppliers
          </Text>
        </View>
        <Button 
          className="bg-sky-500 px-6 h-12"
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
        <Text className="text-zinc-500">Loading suppliers...</Text>
      ) : suppliers.length === 0 ? (
        <Card className="p-8 bg-zinc-900 border-zinc-800 items-center justify-center border-dashed min-h-[400px]">
          <Truck size={48} className="text-zinc-800 mb-4" />
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            No Suppliers Found
          </Text>
          <Text className="text-zinc-700 text-sm max-w-xs text-center">
            Start by adding your vendors to track invoices and ingredient pricing
            trends.
          </Text>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier: any) => (
            <Card key={supplier.id} className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all group">
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-3 bg-black border border-zinc-800 rounded-xl">
                  <Truck size={20} className="text-zinc-400 group-hover:text-sky-500 transition-colors" />
                </View>
                <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Active
                </div>
              </View>
              
              <Text className="text-xl font-black text-white uppercase tracking-tight mb-4">
                {supplier.name}
              </Text>

              <div className="space-y-3">
                {supplier.email && (
                  <div className="flex items-center gap-3 text-zinc-500">
                    <Mail size={14} />
                    <span className="text-xs font-mono">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-3 text-zinc-500">
                    <Phone size={14} />
                    <span className="text-xs font-mono">{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-3 text-zinc-500">
                    <MapPin size={14} />
                    <span className="text-xs truncate">{supplier.address}</span>
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
            <DialogTitle className="text-white font-black uppercase tracking-tight">Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Name</Text>
              <Input
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="Vendor Name"
              />
            </div>
            <div className="grid gap-2">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Email</Text>
              <Input
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="orders@vendor.com"
              />
            </div>
            <div className="grid gap-2">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Phone</Text>
              <Input
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={creating} className="bg-sky-500 w-full">
              <Text className="text-white font-bold uppercase text-xs tracking-widest">
                {creating ? "Creating..." : "Create Supplier"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}