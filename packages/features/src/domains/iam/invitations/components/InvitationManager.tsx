"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Button, Input, Card, cn } from "@sous/ui";
import {
  Plus,
  Mail,
  Shield,
  Clock,
  XCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
} from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";

export function InvitationManager() {
  const [invites, setInvites] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [submitting, setLoadingSubmitting] = useState(false);

  const fetchInvites = async () => {
    try {
      const client = await getHttpClient();
      const data = (await client.get("/invitations")) as any[];
      setInvites(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmitting(true);
    try {
      const client = await getHttpClient();
      await client.post("/invitations", { email, role });
      setEmail("");
      await fetchInvites();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const client = await getHttpClient();
      await client.post(`/invitations/${id}/revoke`);
      await fetchInvites();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="gap-8">
      {/* Invite Form */}
      <Card className="p-8 bg-card border-border gap-6">
        <View className="gap-1">
          <Text className="text-xl font-black uppercase tracking-tight">
            Invite Team Member
          </Text>
          <Text className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Add new chefs to your kitchen
          </Text>
        </View>

        <form onSubmit={handleInvite} className="flex-row gap-4 items-end">
          <View className="flex-1 gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Email Address
            </label>
            <Input
              placeholder="chef@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-muted/20 border-border/50 rounded-2xl px-6"
            />
          </View>

          <View className="w-48 gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 w-full rounded-2xl bg-muted/20 border border-border/50 px-4 text-xs font-black uppercase tracking-widest appearance-none"
            >
              <option value="user">Team Member</option>
              <option value="admin">Administrator</option>
            </select>
          </View>

          <Button
            disabled={submitting}
            className="h-12 px-8 rounded-2xl shadow-xl shadow-primary/10 font-black uppercase italic tracking-tighter"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Send Invite"
            )}
          </Button>
        </form>
      </Card>

      {/* Invites List */}
      <View className="gap-4">
        <View className="flex-row items-center gap-3 ml-1">
          <Clock size={16} className="text-primary" />
          <Text className="font-black uppercase tracking-widest text-sm">
            Pending Invitations
          </Text>
        </View>

        {loading ? (
          <View className="p-12 items-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </View>
        ) : invites.length === 0 ? (
          <Card className="p-12 items-center border-dashed bg-transparent opacity-40">
            <UserPlus size={40} className="mb-4 text-muted-foreground" />
            <Text className="text-[10px] font-black uppercase tracking-[0.3em]">
              No pending invitations
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {invites.map((invite) => (
              <Card
                key={invite.id}
                className={cn(
                  "p-4 flex-row items-center justify-between border-border transition-all",
                  invite.acceptedAt
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-card",
                )}
              >
                <View className="flex-row items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      invite.acceptedAt ? "bg-emerald-500/10" : "bg-primary/5",
                    )}
                  >
                    {invite.acceptedAt ? (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    ) : (
                      <Mail size={18} className="text-primary" />
                    )}
                  </div>
                  <View>
                    <Text className="font-black uppercase text-sm tracking-tight">
                      {invite.email}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {invite.role}
                      </span>
                      <span className="text-[8px] text-muted-foreground/40">
                        •
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        Invited by {invite.invitedBy.firstName}
                      </span>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  {!invite.acceptedAt && (
                    <View className="items-end mr-4">
                      <Text className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                        Expires
                      </Text>
                      <Text className="text-[10px] font-bold text-foreground uppercase tracking-tight">
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {invite.acceptedAt ? (
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full">
                      <Text className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                        Joined
                      </Text>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => handleRevoke(invite.id)}
                      className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <XCircle size={18} />
                    </Button>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
