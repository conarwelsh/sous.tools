"use client";

import React, { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@sous/features";
import { View, Text, Button, Logo, ScrollView, useTheme } from "@sous/ui";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@sous/ui";

import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  Monitor,
  Cpu,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Activity,
  FileText,
  Link as LinkIcon,
  Menu,
  X,
  Palette,
  Sun,
  Moon,
} from "lucide-react";

function AdminContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // @ts-expect-error - Necessary for SSR hydration pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && !isAuthenticated) {
      console.log("[AdminLayout] User not authenticated, redirecting to login...");
      router.replace("/login");
    }
  }, [isMounted, loading, isAuthenticated, router]);

  if (loading || !isMounted || !isAuthenticated) {
    return (
      <View className="flex-1 bg-background flex justify-center items-center h-screen">
        <Logo variant="plate" size={48} suffix="tools" animate />
      </View>
    );
  }

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Procurement", icon: ShoppingCart, href: "/procurement" },
    { label: "Culinary", icon: UtensilsCrossed, href: "/culinary" },
    { label: "Inventory", icon: Package, href: "/inventory" },
    { label: "Intelligence", icon: Activity, href: "/intelligence" },
    { label: "Accounting", icon: FileText, href: "/accounting" },
    { label: "Presentation", icon: Monitor, href: "/presentation" },
    { label: "Hardware", icon: Cpu, href: "/hardware" },
    { label: "Integrations", icon: LinkIcon, href: "/integrations" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <View className="flex flex-col md:flex-row bg-background min-h-screen w-full relative">
      {/* Mobile Header */}
      <View className="md:hidden flex flex-row items-center justify-between p-4 border-b border-border/50 bg-background/20 backdrop-blur-xl sticky top-0 z-[60] pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Logo variant="plate" size={20} suffix="tools" />
        <View className="flex flex-row items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative w-10 h-10 flex items-center justify-center overflow-hidden z-[70]"
          >
            <div className="relative w-6 h-5">
              <span 
                className={cn(
                  "absolute block w-6 h-0.5 bg-sky-500 transition-all duration-300 ease-in-out",
                  isMobileMenuOpen ? "rotate-45 top-2" : "top-0"
                )} 
              />
              <span 
                className={cn(
                  "absolute block w-6 h-0.5 bg-sky-500 transition-all duration-300 ease-in-out top-2",
                  isMobileMenuOpen ? "opacity-0 -left-full" : "opacity-100 left-0"
                )} 
              />
              <span 
                className={cn(
                  "absolute block w-6 h-0.5 bg-sky-500 transition-all duration-300 ease-in-out",
                  isMobileMenuOpen ? "-rotate-45 top-2" : "top-4"
                )} 
              />
            </div>
          </Button>
        </View>
      </View>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <View className="md:hidden fixed inset-0 z-50 bg-background p-6 pt-20">
          <SidebarContent 
            mobile 
            isCollapsed={isCollapsed} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            menuItems={menuItems} 
            pathname={pathname} 
            router={router} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
          />
        </View>
      )}

      {/* Desktop Sidebar */}
      <View 
        className={cn(
          "border-r border-border/50 p-6 flex flex-col hidden md:flex shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out group/sidebar relative",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        <ScrollView className="flex-1 -mx-6 px-6">
          <SidebarContent 
            isCollapsed={isCollapsed} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            menuItems={menuItems} 
            pathname={pathname} 
            router={router} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
          />
        </ScrollView>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all z-50 shadow-xl"
        >
          <div className={cn(
            "w-4 h-4 flex items-center justify-center transition-transform duration-300",
            isCollapsed ? "rotate-180" : "rotate-0"
          )}>
            <ChevronLeft size={16} className="text-primary" />
          </div>
        </button>
      </View>

      {/* Content Area */}
      <View className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden relative">
        <View className="flex-1 overflow-auto">
          {children}
        </View>
      </View>
    </View>
  );
}

function SidebarContent({ 
  mobile = false, 
  isCollapsed, 
  theme, 
  toggleTheme, 
  menuItems, 
  pathname, 
  router, 
  setIsMobileMenuOpen 
}: any) {
  return (
    <View className="flex flex-col h-full justify-between">
      <View>
        <View className={cn("mb-12 transition-all duration-300 flex flex-row items-center justify-between", isCollapsed && !mobile ? "ml-0 justify-center" : "ml-2")}>
          <Logo variant="plate" size={24} suffix={isCollapsed && !mobile ? undefined : "tools"} showWordmark={!isCollapsed || mobile} />
          {(!isCollapsed || mobile) && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all mr-2"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </View>

        <View className="flex flex-col gap-2">
          {menuItems.map((item: any) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => {
                  router.push(item.href);
                  if (mobile) setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center p-4 rounded-xl transition-all w-full group relative",
                  isActive
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50 border border-transparent",
                  isCollapsed && !mobile ? "justify-center px-0" : "justify-between"
                )}
              >
                <View className="flex flex-row items-center gap-4">
                  <item.icon
                    size={20}
                    className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}
                  />
                  {(!isCollapsed || mobile) && (
                    <Text
                      className={cn(
                        "font-bold uppercase text-[10px] tracking-[0.1em] whitespace-nowrap",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Text>
                  )}
                </View>
                {!isCollapsed || mobile ? (
                  isActive && <ChevronRight size={14} className="text-primary" />
                ) : null}

                {/* Tooltip for collapsed state */}
                {isCollapsed && !mobile && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-foreground whitespace-nowrap">
                      {item.label}
                    </Text>
                  </div>
                )}
              </Button>
            );
          })}
        </View>
      </View>

      <View>
        <Button
          variant="ghost"
          onClick={() => router.push("/logout")}
          className={cn(
            "flex items-center p-4 rounded-xl hover:bg-destructive/10 group w-full transition-all",
            isCollapsed && !mobile ? "justify-center" : "gap-4"
          )}
        >
          <LogOut
            size={20}
            className="text-muted-foreground group-hover:text-destructive transition-colors"
          />
          {(!isCollapsed || mobile) && (
            <Text className="text-muted-foreground group-hover:text-destructive font-bold uppercase text-[10px] tracking-widest transition-colors">
              Sign Out
            </Text>
          )}
        </Button>
      </View>
    </View>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View className="font-sans antialiased bg-background text-foreground min-h-screen">
      <AdminContent>{children}</AdminContent>
    </View>
  );
}
