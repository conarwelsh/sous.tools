"use client";

import React, { useState } from "react";
import { useOAuthClients } from "../hooks/useOAuthClients";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Input,
  Button,
  View,
  Text,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle
} from "@sous/ui";
import { Plus, Copy, Key, Trash2, Globe, Loader2 } from "lucide-react";

export const DeveloperPortal: React.FC = () => {
  const { clients, loading, registerClient } = useOAuthClients();
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRedirectUri, setNewRedirectUri] = useState("");

  const handleRegister = async () => {
    await registerClient(newName, [newRedirectUri]);
    setIsRegistering(false);
    setNewName("");
    setNewRedirectUri("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  if (loading) return (
    <View className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-primary" size={32} />
    </View>
  );

  return (
    <View className="space-y-8">
      <View className="flex flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-black italic uppercase tracking-tighter">Developer Applications</Text>
          <Text className="text-muted-foreground">Manage your OAuth2 integrations.</Text>
        </View>
        <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl font-bold uppercase italic tracking-tight">
              <Plus size={16} />
              Register App
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">New Application</DialogTitle>
              <DialogDescription>Create a new OAuth2 client for your integration.</DialogDescription>
            </DialogHeader>
            <View className="space-y-4 py-4">
              <View className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">App Name</label>
                <Input placeholder="e.g. My Inventory Sync" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </View>
              <View className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Redirect URI</label>
                <Input placeholder="https://myapp.com/callback" value={newRedirectUri} onChange={(e) => setNewRedirectUri(e.target.value)} />
              </View>
              <Button onClick={handleRegister} className="w-full font-bold uppercase italic">Create Client</Button>
            </View>
          </DialogContent>
        </Dialog>
      </View>

      <View className="grid grid-cols-1 gap-6">
        {clients.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/5">
            <CardContent className="p-12 text-center">
              <Text className="text-muted-foreground italic">No applications registered yet.</Text>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id} className="border-border/50 shadow-lg hover:border-primary/30 transition-all rounded-[1.5rem] overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-4">
                  <View className="p-2 bg-primary/10 rounded-lg">
                    <Globe size={20} className="text-primary" />
                  </View>
                  <View>
                    <CardTitle className="text-lg font-bold uppercase tracking-tight">{client.name}</CardTitle>
                    <CardDescription className="font-mono text-[10px]">{client.clientId}</CardDescription>
                  </View>
                </View>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2 size={16} />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <View className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client Secret</label>
                  <View className="flex flex-row gap-2">
                    <Input value={client.clientSecret} readOnly type="password" className="font-mono text-xs bg-muted/50" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(client.clientSecret)}>
                      <Copy size={14} />
                    </Button>
                  </View>
                  <Text className="text-[10px] text-amber-500 font-bold uppercase tracking-tight">
                    Keep this secret! Never share it or commit it to code.
                  </Text>
                </View>
                <View className="pt-4 border-t border-border/50 flex flex-row justify-between items-center">
                  <View className="flex flex-row gap-4">
                    <View className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-muted-foreground">Redirect URI</span>
                      <span className="text-xs font-mono">{(client.redirectUris as string[])[0]}</span>
                    </View>
                  </View>
                  <Button variant="outline" size="sm" className="rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2">
                    <Key size={12} />
                    Rotate Secret
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </View>
    </View>
  );
};
