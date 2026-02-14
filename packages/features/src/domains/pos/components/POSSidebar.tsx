import React from "react";
import { View, Button, Logo, cn } from "@sous/ui";
import {
  Home,
  Grid,
  Armchair,
  Settings,
  LogOut,
  User,
  History,
} from "lucide-react";

interface POSSidebarProps {
  activeTab: "home" | "orders" | "tables" | "settings";
  onTabChange: (tab: any) => void;
  user: any;
  onLogout: () => void;
  onLogin: () => void;
}

export const POSSidebar = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  onLogin,
}: POSSidebarProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "orders", icon: Grid, label: "Menu" },
    { id: "tables", icon: Armchair, label: "Tables" },
    { id: "history", icon: History, label: "Orders" },
  ];

  return (
    <View className="w-24 bg-zinc-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-8 justify-between z-20">
      <div className="flex flex-col items-center gap-12 w-full">
        <div className="hover:scale-110 transition-transform duration-500">
          <Logo variant="pos" size={32} showWordmark={false} animate={false} />
        </div>

        <div className="flex flex-col gap-4 w-full px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                  isActive
                    ? "text-sky-400 bg-sky-500/10 neon-glow border border-sky-500/20 shadow-lg shadow-sky-500/10"
                    : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent",
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-50" />
                )}
                <Icon
                  size={22}
                  className={cn(
                    "transition-all duration-500 z-10",
                    isActive
                      ? "scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                      : "group-hover:scale-105",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] z-10">
                  {tab.label}
                </span>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-sky-400 rounded-r-full shadow-[0_0_10px_#0ea5e9]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full px-2">
        <button
          onClick={() => onTabChange("settings")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 py-4 rounded-2xl transition-all duration-500 group border border-transparent",
            activeTab === "settings"
              ? "text-white bg-white/10 border-white/10"
              : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5",
          )}
        >
          <Settings
            size={20}
            className={cn(
              "transition-transform duration-500",
              activeTab === "settings" ? "rotate-90" : "group-hover:rotate-45",
            )}
          />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
            Setup
          </span>
        </button>

        {user ? (
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 py-4 w-full rounded-2xl transition-all duration-500 bg-emerald-500/5 hover:bg-red-500/10 text-emerald-500 hover:text-red-500 group relative border border-emerald-500/10 hover:border-red-500/20 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:hidden transition-all">
              {user.firstName?.[0] || "U"}
            </div>
            <LogOut
              size={20}
              className="hidden group-hover:block animate-in zoom-in duration-300"
            />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 group-hover:hidden truncate w-full px-1 text-center">
              {user.firstName || "User"}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1 hidden group-hover:block animate-in fade-in duration-300">
              Logout
            </span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex flex-col items-center justify-center gap-1 py-4 rounded-2xl transition-all duration-500 text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent group"
          >
            <User
              size={22}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">
              Login
            </span>
          </button>
        )}
      </div>
    </View>
  );
};
