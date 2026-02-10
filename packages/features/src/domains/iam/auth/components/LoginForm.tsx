"use client";

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button, Card, Input, Logo, View, Text, DialogClose } from "@sous/ui";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export const LoginForm = ({ onSuccess, showClose = false }: { onSuccess?: () => void, showClose?: boolean }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-12 w-full max-w-md mx-auto shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-card border-border/50 rounded-[2.5rem] relative">
      {showClose && (
        <DialogClose className="absolute right-8 top-8 rounded-full p-2 bg-secondary/50 hover:bg-secondary transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </DialogClose>
      )}

      <div className="flex flex-col items-center mb-16">
        <Logo size={60} />
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <label className="text-[10px] font-black text-foreground uppercase mb-3 ml-1 block tracking-[0.15em]">
            Email Address
          </label>
          <Input
            placeholder="chef@dtown.cafe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="h-16 bg-muted/30 border-border/50 rounded-2xl px-6 text-foreground text-base focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-foreground uppercase mb-3 ml-1 block tracking-[0.15em]">
            Password
          </label>
          <Input
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="h-16 bg-muted/30 border-border/50 rounded-2xl px-6 text-foreground text-base focus:border-primary/50 focus:ring-primary/20"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl">
            <p className="text-destructive text-xs font-bold text-center uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="h-16 mt-4 bg-sky-500 w-full rounded-2xl shadow-[0_8px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_40px_rgba(14,165,233,0.4)] transition-all"
        >
          <span className="text-white font-black italic uppercase tracking-widest text-lg">
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </span>
        </Button>

        <button className="flex flex-col items-center mt-4">
          <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:text-foreground transition-colors">
            Lost Access?
          </span>
        </button>
      </div>
    </Card>
  );
};
