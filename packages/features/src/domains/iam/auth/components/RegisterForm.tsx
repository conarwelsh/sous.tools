"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Button,
  Card,
  Input,
  Logo,
  Text,
  CardHeader,
  CardContent,
  GoogleLogo,
  GithubLogo,
  FacebookLogo,
} from "@sous/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, ChefHat } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";

export function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [invitedOrg, setInvitedOrg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) {
      setInviteToken(tokenParam);
      // Validate invite and get org name
      void (async () => {
        try {
          const client = await getHttpClient();
          const invite = await client.get(`/invitations/validate?token=${tokenParam}`) as any;
          setInvitedOrg(invite.organization.name);
        } catch (e) {
          setError("Invitation link is invalid or has expired.");
        }
      })();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ 
        firstName, 
        lastName, 
        email, 
        password,
        organizationName: inviteToken ? undefined : organizationName,
        inviteToken: inviteToken || undefined
      });
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}-login`;
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <Logo size={120} animate loading showWordmark={false} />
        </div>
      )}

      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-primary/5 bg-card border-border/50 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-col items-center pt-12 pb-8 bg-muted/30 border-b border-border/50 relative">
          <button 
            onClick={() => router.push("/login")}
            className="absolute left-8 top-12 p-2 hover:bg-background/50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <Logo size={60} showWordmark variant="neon" />
          <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-4">Join the kitchen</Text>
        </CardHeader>

        <CardContent className="p-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">First Name</label>
                <Input
                  placeholder="Marco"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12 bg-muted/20 border-border/50 rounded-2xl px-5 text-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">Last Name</label>
                <Input
                  placeholder="Pierre"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12 bg-muted/20 border-border/50 rounded-2xl px-5 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">Email Address</label>
              <Input
                placeholder="chef@dtown.cafe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="h-12 bg-muted/20 border-border/50 rounded-2xl px-5 text-sm"
              />
            </div>

            {!inviteToken ? (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">Kitchen Name</label>
                <Input
                  placeholder="e.g. My Awesome Restaurant"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="h-12 bg-muted/20 border-border/50 rounded-2xl px-5 text-sm"
                />
              </div>
            ) : invitedOrg ? (
              <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">You're Joining</p>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight">{invitedOrg}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChefHat size={14} className="text-primary" />
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-foreground uppercase ml-1 block tracking-[0.2em]">Password</label>
              <Input
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="h-12 bg-muted/20 border-border/50 rounded-2xl px-5 text-sm"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl">
                <p className="text-destructive text-[10px] font-black text-center uppercase tracking-widest">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl shadow-xl shadow-primary/10 transition-all font-black italic uppercase tracking-tighter text-lg mt-4"
            >
              Create Account
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[8px] uppercase font-black">
                <span className="bg-card px-4 text-muted-foreground tracking-[0.3em]">Or Sign Up With</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                onClick={() => handleSocialLogin("google")}
                variant="outline"
                className="h-12 rounded-xl border-border/50 bg-muted/10 hover:bg-muted p-0"
              >
                <GoogleLogo size={18} />
              </Button>
              <Button
                type="button"
                onClick={() => handleSocialLogin("github")}
                variant="outline"
                className="h-12 rounded-xl border-border/50 bg-muted/10 hover:bg-muted p-0"
              >
                <GithubLogo size={18} />
              </Button>
              <Button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                variant="outline"
                className="h-12 rounded-xl border-border/50 bg-muted/10 hover:bg-muted p-0"
              >
                <FacebookLogo size={18} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
