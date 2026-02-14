"use client";

import React, { useState } from "react";
import { usePlatformSettings } from "../hooks/usePlatformSettings";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Input,
  Button,
  View,
  Text
} from "@sous/ui";
import { Save, ShieldAlert, Loader2 } from "lucide-react";

export const PlatformSettingsView: React.FC = () => {
  const { settings, loading, updateSetting } = usePlatformSettings();
  const [supportEmail, setSupportEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync local state when settings load
  React.useEffect(() => {
    const emailSetting = settings.find(s => s.key === "support_email");
    if (emailSetting) setSupportEmail(emailSetting.value);
  }, [settings]);

  const handleSaveSupportEmail = async () => {
    setSaving(true);
    await updateSetting("support_email", supportEmail);
    setSaving(false);
  };

  if (loading) return (
    <View className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-primary" size={32} />
    </View>
  );

  return (
    <View className="space-y-8">
      <View className="flex flex-row items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
        <ShieldAlert className="text-amber-500" size={20} />
        <Text className="text-amber-500 font-bold uppercase tracking-tight text-sm">
          SuperAdmin restricted area. Changes here affect the entire platform.
        </Text>
      </View>

      <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
          <CardTitle className="text-xl font-bold uppercase tracking-tight">Support Configuration</CardTitle>
          <CardDescription>
            Configure where internal support alerts and GitHub issues are routed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <View className="space-y-2">
            <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">
              Support Alert Email
            </label>
            <View className="flex flex-row gap-3">
              <Input
                placeholder="support@sous.tools"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="h-12 bg-muted/20 border-border/50 rounded-xl px-6 text-foreground focus:border-primary/50 transition-all max-w-md"
              />
              <Button 
                onClick={handleSaveSupportEmail} 
                disabled={saving}
                className="h-12 gap-2 rounded-xl font-bold uppercase italic tracking-tighter"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Setting
              </Button>
            </View>
            <Text className="text-muted-foreground italic text-sm">
              Fallback if not set: {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@sous.tools'}
            </Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};
