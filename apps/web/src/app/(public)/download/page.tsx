"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Button, Card, ScrollView, Logo } from "@sous/ui";
import { client as config } from "@sous/config";

import {
  Monitor,
  Smartphone,
  Watch,
  Apple,
  Laptop,
  Terminal,
  Info,
  ShieldAlert
} from "lucide-react";

const RELEASES_URL = "https://your-supabase-project.supabase.co/storage/v1/object/public/media/releases/latest/manifest.json"; // Placeholder, needs actual URL

export default function DownloadPage() {
  const [userOS, setUserOS] = useState<
    "windows" | "macos" | "linux" | "android" | "ios" | "unknown"
  >("linux");
  const [manifest, setManifest] = useState<Record<string, string>>({});

  // Determine environment
  const env = config.features.appEnv || "development";

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ua.includes("win")) setUserOS("windows");
    else if (ua.includes("mac")) setUserOS("macos");
    else if (ua.includes("linux")) setUserOS("linux");
    else if (ua.includes("android")) setUserOS("android");
    else if (ua.includes("iphone") || ua.includes("ipad")) setUserOS("ios");

    // Fetch manifest
    // In a real scenario, you'd put the actual Supabase URL here.
    // For now, I'll use a placeholder logic or try to fetch if URL was known.
    // fetch(RELEASES_URL).then(r => r.json()).then(setManifest).catch(console.error);
  }, []);

  const platforms = [
    {
      id: "windows",
      name: "Windows",
      icon: Laptop,
      ext: ".exe",
      version: "Latest",
      url: manifest.tools || "#" // Use manifest
    },
    { id: "macos", name: "macOS", icon: Apple, ext: ".dmg", version: "Latest", url: "#" },
    {
      id: "linux",
      name: "Linux",
      icon: Terminal,
      ext: ".AppImage",
      version: "Latest",
      url: "#"
    },
    {
      id: "android",
      name: "Android",
      icon: Smartphone,
      ext: ".apk",
      version: "Latest",
      url: manifest.signage || "#" // Default to signage or specific flavor
    },
  ];

  const suggested = platforms.find((p) => p.id === userOS) || platforms[2];

  return (
    <ScrollView className="flex-1 bg-[#0a0a0a]">
      <View className="px-8 py-24 items-center">
        <View className="bg-sky-500/10 border border-sky-500/20 px-4 py-1 rounded-full mb-8">
            <Text className="text-sky-500 font-black text-[9px] uppercase tracking-[0.2em]">
                {env.toUpperCase()} CHANNEL
            </Text>
        </View>
        <Logo variant="circuit" size={48} showWordmark={false} />
        <Text className="text-5xl font-black text-white tracking-tighter uppercase mt-8 mb-4">
          Install Terminal
        </Text>
        <Text className="text-zinc-500 text-lg max-w-xl text-center mb-16 font-medium">
          Deploy the specialized Sous Tools interface to your local hardware. 
          Real-time synchronization and safety-mode persistence built-in.
        </Text>

        {/* Suggested Download */}
        <Card className="p-12 w-full max-w-2xl bg-sky-500 border-none shadow-[0_0_50px_rgba(14,165,233,0.2)] mb-12 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <suggested.icon size={240} color="white" />
          </div>
          
          <View className="flex-row items-center justify-between relative z-10">
            <View>
              <Text className="text-sky-900 font-black uppercase text-[10px] tracking-[0.2em] mb-4">
                Recommended for you
              </Text>
              <Text className="text-5xl font-black text-white uppercase tracking-tighter italic">
                {suggested.name}
              </Text>
              <Text className="text-sky-100 font-mono text-xs mt-4 font-bold">
                {suggested.version} • {suggested.ext}
              </Text>
            </View>
          </View>
          <Button 
            className="mt-12 bg-white h-20 shadow-2xl relative z-10 hover:bg-zinc-100 transition-colors"
            onClick={() => window.open(suggested.url, '_blank')}
          >
            <Text className="text-sky-600 font-black text-xl uppercase tracking-widest italic">
              Download Installer
            </Text>
          </Button>
        </Card>

        {env === "staging" && (
            <View className="w-full max-w-2xl bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 mb-16">
                <View className="flex-row items-center gap-4 mb-4">
                    <ShieldAlert className="text-amber-500" size={24} />
                    <Text className="text-amber-500 font-black uppercase text-sm tracking-tighter italic">Staging Instructions</Text>
                </View>
                <Text className="text-zinc-400 text-sm leading-relaxed mb-6 font-medium">
                    You are accessing the Staging channel. These builds contain the latest features but may be unstable. 
                    To install on Android, you must enable "Install from Unknown Sources" in your device settings.
                </Text>
                <View className="flex flex-col gap-3">
                    <View className="flex-row items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Text className="text-amber-500 font-black text-[10px]">1</Text>
                        </div>
                        <Text className="text-zinc-500 text-xs font-bold">Download the .apk file above</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Text className="text-amber-500 font-black text-[10px]">2</Text>
                        </div>
                        <Text className="text-zinc-500 text-xs font-bold">Open the file on your device</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Text className="text-amber-500 font-black text-[10px]">3</Text>
                        </div>
                        <Text className="text-zinc-500 text-xs font-bold">Follow prompts to "Install Anyway"</Text>
                    </View>
                </View>
            </View>
        )}

        {/* All Platforms */}
        <View className="flex-row flex-wrap gap-6 justify-center w-full max-w-5xl">
          {platforms
            .filter((p) => p.id !== suggested.id)
            .map((p) => (
              <Card
                key={p.id}
                className="p-8 flex-1 min-w-[240px] bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col group"
              >
                <p.icon size={32} className="text-zinc-600 group-hover:text-sky-500 transition-colors mb-6" />
                <Text className="text-xl font-black text-white uppercase tracking-tight italic">
                  {p.name}
                </Text>
                <Text className="text-zinc-600 font-mono text-[10px] mt-2 mb-8 font-bold">
                  {p.version} • {p.ext}
                </Text>
                <Button 
                    className="h-12 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    onClick={() => window.open(p.url, '_blank')}
                >
                  <Text className="text-zinc-300 font-black uppercase text-[10px] tracking-widest">
                    Download
                  </Text>
                </Button>
              </Card>
            ))}
        </View>

        <View className="mt-24 items-center bg-zinc-900/30 border border-zinc-800 rounded-3xl p-10 max-w-lg w-full">
          <Watch size={40} className="text-zinc-700 mb-6" />
          <Text className="text-white font-black uppercase text-sm tracking-widest mb-4">
            Specialized Wear OS App
          </Text>
          <Text className="text-zinc-500 text-sm text-center leading-relaxed font-medium">
            Keep your hands free while managing timers and alerts. Search for <Text className="text-sky-500 italic font-black">"Sous Tools"</Text> directly on the Google Play Store from your watch.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}