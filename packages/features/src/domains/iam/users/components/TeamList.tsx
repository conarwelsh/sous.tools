"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Button, Card, cn } from "@sous/ui";
import { Shield, User, Trash2, Loader2 } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";
import { useAuth } from "../../auth/hooks/useAuth";

export function TeamList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchMembers = async () => {
    try {
      const client = await getHttpClient();
      const data = (await client.get("/iam/users")) as any[];
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      const client = await getHttpClient();
      await client.patch(`/iam/users/${id}/role`, { role });
      await fetchMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to remove this member from the organization?",
      )
    )
      return;
    try {
      const client = await getHttpClient();
      await client.delete(`/iam/users/${id}`);
      await fetchMembers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View className="p-12 items-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3 ml-1">
        <User size={16} className="text-primary" />
        <Text className="font-black uppercase tracking-widest text-sm">
          Active Team Members
        </Text>
      </View>

      <View className="gap-3">
        {members.map((member) => (
          <Card
            key={member.id}
            className="p-4 flex-row items-center justify-between border-border bg-card"
          >
            <View className="flex-row items-center gap-4">
              <div className="h-10 w-10 border border-border rounded-full flex items-center justify-center bg-primary/5">
                <Text className="text-primary text-[10px] font-black uppercase">
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </Text>
              </div>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-black uppercase text-sm tracking-tight">
                    {member.firstName} {member.lastName}
                  </Text>
                  {member.id === currentUser?.id && (
                    <div className="px-2 py-0.5 bg-primary/10 rounded-full">
                      <Text className="text-[8px] font-black text-primary uppercase tracking-widest">
                        You
                      </Text>
                    </div>
                  )}
                </View>
                <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {member.email}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              {/* Role Badge / Switcher */}
              <div className="flex-row gap-1 bg-muted/20 p-1 rounded-xl border border-border/50">
                <Button
                  variant={member.role === "admin" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest",
                    member.role !== "admin" &&
                      "text-muted-foreground hover:bg-background",
                  )}
                  onClick={() =>
                    member.role !== "admin" &&
                    handleUpdateRole(member.id, "admin")
                  }
                  disabled={member.id === currentUser?.id}
                >
                  <Shield size={10} className="mr-1.5" /> Admin
                </Button>
                <Button
                  variant={member.role === "user" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest",
                    member.role !== "user" &&
                      "text-muted-foreground hover:bg-background",
                  )}
                  onClick={() =>
                    member.role !== "user" &&
                    handleUpdateRole(member.id, "user")
                  }
                  disabled={member.id === currentUser?.id}
                >
                  <User size={10} className="mr-1.5" /> Member
                </Button>
              </div>

              {/* Actions */}
              {member.id !== currentUser?.id && (
                <Button
                  variant="ghost"
                  onClick={() => handleRemove(member.id)}
                  className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
