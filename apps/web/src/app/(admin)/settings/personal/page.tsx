"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Input, GoogleLogo } from "@sous/ui";
import {
  User,
  Save,
  Lock,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";
import { useAuth, AuthService } from "@sous/features";

export default function PersonalSettingsPage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPass: "",
    newPass: "",
    confirmPass: "",
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirmPass) {
      setPassError("Passwords do not match");
      return;
    }
    setIsChangingPass(true);
    setPassError(null);
    try {
      // Mock call or AuthService.changePassword
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPassSuccess(true);
      setPasswords({ currentPass: "", newPass: "", confirmPass: "" });
    } catch (e) {
      setPassError("Failed to update password");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLinkGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`;
  };

  return (
    <View className="flex-1 bg-background p-8">
      {/* ... header ... */}

      <View className="gap-8 max-w-4xl">
        <Card className="p-8 bg-card border-border">
          <View className="flex-row items-center gap-4 mb-8">
            <View className="p-3 bg-muted rounded-xl">
              <User size={24} className="text-emerald-500" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-foreground font-bold uppercase text-lg tracking-tight">
                    User Profile
                  </Text>
                  <Text className="text-muted-foreground text-xs uppercase tracking-widest">
                    Your account preferences
                  </Text>
                </View>

                {!(user as any)?.googleId ? (
                  <Button
                    onClick={handleLinkGoogle}
                    variant="outline"
                    className="h-10 border-border hover:bg-muted gap-2"
                  >
                    <GoogleLogo size={16} />
                    <Text className="text-[10px] font-black uppercase tracking-widest">
                      Link Google Profile
                    </Text>
                  </Button>
                ) : (
                  <View className="flex-row items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <Text className="text-emerald-500 font-black uppercase text-[8px] tracking-widest">
                      Google Linked
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="flex-row gap-6">
            <View className="flex-1">
              <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">
                First Name
              </Text>
              <View className="h-12 bg-muted/20 border border-border rounded-xl px-4 justify-center">
                <Text className="text-foreground/80">
                  {user?.firstName || "Loading..."}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">
                Last Name
              </Text>
              <View className="h-12 bg-muted/20 border border-border rounded-xl px-4 justify-center">
                <Text className="text-foreground/80">
                  {user?.lastName || "Loading..."}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card className="p-8 bg-card border-border">
          <View className="flex-row items-center gap-4 mb-8">
            <View className="p-3 bg-muted rounded-xl">
              <Lock size={24} className="text-amber-500" />
            </View>
            <View>
              <Text className="text-foreground font-bold uppercase text-lg tracking-tight">
                Security
              </Text>
              <Text className="text-muted-foreground text-xs uppercase tracking-widest">
                Update your credentials
              </Text>
            </View>
          </View>

          <View className="gap-6">
            <View className="gap-2">
              <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest ml-1">
                Current Password
              </Text>
              <Input
                type="password"
                value={passwords.currentPass}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPass: e.target.value })
                }
                className="bg-muted/20 border-border h-12"
              />
            </View>

            <View className="flex-row gap-6">
              <View className="flex-1 gap-2">
                <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest ml-1">
                  New Password
                </Text>
                <Input
                  type="password"
                  value={passwords.newPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPass: e.target.value })
                  }
                  className="bg-muted/20 border-border h-12"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest ml-1">
                  Confirm New Password
                </Text>
                <Input
                  type="password"
                  value={passwords.confirmPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPass: e.target.value })
                  }
                  className="bg-muted/20 border-border h-12"
                />
              </View>
            </View>

            {passError && (
              <View className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <Text className="text-destructive text-xs font-bold uppercase text-center">
                  {passError}
                </Text>
              </View>
            )}

            {passSuccess && (
              <View className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex-row items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <Text className="text-emerald-500 text-xs font-bold uppercase">
                  Password updated successfully
                </Text>
              </View>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={
                isChangingPass || !passwords.currentPass || !passwords.newPass
              }
              className="h-12 bg-primary hover:bg-primary/90 mt-2"
            >
              {isChangingPass ? (
                <Loader2
                  size={18}
                  className="animate-spin text-primary-foreground"
                />
              ) : (
                <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">
                  Update Password
                </Text>
              )}
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );
}
