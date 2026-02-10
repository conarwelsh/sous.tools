"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Logo, Input } from "@sous/ui";
import { AuthService } from "@sous/features";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await AuthService.register({
        email,
        passwordHash: password, // Note: The API hashes it
        firstName,
        lastName,
        organizationName,
      });
      router.push("/login");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-[#0a0a0a] min-h-screen">
      <View className="flex flex-col justify-center items-center px-8 py-24 min-h-screen">
        <Button
          onClick={() => router.push("/")}
          className="absolute top-12 left-12 flex flex-row items-center gap-2"
        >
          <ChevronLeft size={20} className="text-zinc-500" />
          <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">
            Back to Site
          </Text>
        </Button>

        <View className="mb-12 flex flex-col items-center">
          <Logo size={48} showWordmark={false} />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mt-6">
            Create Organization
          </h1>
        </View>

        <Card className="p-8 w-full max-w-lg bg-zinc-900 border-zinc-800 shadow-2xl">
          <View className="flex flex-col gap-6">
            <View>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-2 ml-1 block">
                Business Name
              </label>
              <Input
                placeholder="Kitchen Intelligence Ltd"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </View>

            <View className="flex flex-row gap-4">
              <View className="flex-1">
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 ml-1 block">
                  First Name
                </label>
                <Input
                  placeholder="Auguste"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </View>
              <View className="flex-1">
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 ml-1 block">
                  Last Name
                </label>
                <Input
                  placeholder="Escoffier"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </View>
            </View>

            <View>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-2 ml-1 block">
                Email Address
              </label>
              <Input
                placeholder="chef@sous.tools"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </View>

            <View>
              <label className="text-xs font-bold text-zinc-400 uppercase mb-2 ml-1 block">
                Password
              </label>
              <Input
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </View>

            {error && (
              <View className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
                <p className="text-destructive text-sm font-medium text-center">
                  {error}
                </p>
              </View>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-14 mt-2 bg-sky-500"
            >
              <Text className="text-white font-bold uppercase tracking-widest">
                {loading ? "Processing..." : "Create Account"}
              </Text>
            </Button>
          </View>
        </Card>

        <View className="mt-8 flex flex-row items-center gap-2">
          <Text className="text-zinc-600 text-sm">
            Already have an account?
          </Text>
          <Button onClick={() => router.push("/login")}>
            <Text className="text-sky-500 font-bold text-sm hover:underline">
              Sign In
            </Text>
          </Button>
        </View>
      </View>
    </main>
  );
}
