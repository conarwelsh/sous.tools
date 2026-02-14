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
  Globe,
  LifeBuoy,
  ShieldAlert,
  Code2,
} from "lucide-react";
import { FeedbackModal } from "@sous/features";

function AdminContent({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && !isAuthenticated) {
      console.log("[AdminLayout] User not authenticated, redirecting to login...");
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }

    if (isMounted && !loading && isAuthenticated && user?.organization?.planStatus === "pending_payment" && pathname !== "/checkout") {
      console.log("[AdminLayout] Organization payment pending, redirecting to checkout...");
      router.replace("/checkout");
    }
  }, [isMounted, loading, isAuthenticated, router, pathname, user]);

  if (loading || !isMounted || !isAuthenticated) {
    return (
      <View className="flex-1 bg-background flex justify-center items-center h-screen">
        <Logo variant="cloud" size={48} suffix="tools" animate />
      </View>
    );
  }

  const menuGroups = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        ...(user?.role === "salesman" || user?.role === "superadmin"
          ? [{ label: "Sales Portal", icon: TrendingUp, href: "/sales" }]
          : []),
      ]
    },
    {
      title: "Procurement",
      items: [
        { label: "Suppliers", icon: UtensilsCrossed, href: "/procurement/suppliers" },
        { label: "Invoices", icon: FileText, href: "/procurement/invoices" },
        { label: "Orders", icon: ShoppingCart, href: "/procurement/orders" },
      ]
    },
    {
      title: "Operations",
      items: [
        { label: "Recipes", icon: UtensilsCrossed, href: "/operations/recipes" },
        { label: "Ingredients", icon: Package, href: "/operations/ingredients" },
        { label: "Inventory", icon: Package, href: "/inventory" },
        { label: "Finances", icon: Activity, href: "/operations/intelligence" },
      ]
    },
    {
      title: "Presentation",
      items: [
        { label: "Signage", icon: Monitor, href: "/presentation/signage" },
        { label: "Web Pages", icon: Globe, href: "/presentation/pages" },
        { label: "Layouts", icon: LayoutDashboard, href: "/presentation/layouts" },
        { label: "Labels", icon: Palette, href: "/presentation/labels" },
      ]
    },
    {
      title: "System",
      items: [
        { label: "Settings", icon: Settings, href: "/settings/organization" },
        ...(user?.role === "admin" || user?.role === "superadmin"
          ? [{ label: "Developer", icon: Code2, href: "/settings/developer" }]
          : []),
        ...(user?.role === "superadmin" 
          ? [
              { label: "Platform", icon: ShieldAlert, href: "/platform" },
              { label: "Platform Settings", icon: Settings, href: "/settings/platform" }
            ] 
          : []),
        { label: "Support", icon: LifeBuoy, href: "/support" },
      ]
    },
  ];

  return (
    <View className="flex flex-col md:flex-row bg-background min-h-screen w-full relative">
      {/* Mobile Header */}
      <View className="md:hidden flex flex-row items-center justify-between p-4 border-b border-border/50 bg-background/20 backdrop-blur-xl sticky top-0 z-[60] pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Logo variant="cloud" size={20} suffix="tools" />
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
            menuGroups={menuGroups} 
            pathname={pathname} 
            router={router} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
          />
        </View>
      )}

      {/* Desktop Sidebar */}
      <View 
        className={cn(
          "border-r border-border/50 flex flex-col hidden md:flex shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out group/sidebar relative",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        {/* Header (Fixed) */}
        <View className="p-6">
          <SidebarHeader 
            isCollapsed={isCollapsed} 
            theme={theme} 
            toggleTheme={toggleTheme} 
          />
        </View>

        {/* Menu (Scrollable) */}
        <ScrollView className="flex-1 px-6">
          <SidebarMenu 
            isCollapsed={isCollapsed} 
            menuGroups={menuGroups} 
            pathname={pathname} 
            router={router} 
          />
        </ScrollView>

        {/* Footer (Fixed) */}
        <View className="p-6 space-y-2">
          <FeedbackModal>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center p-4 rounded-xl hover:bg-primary/10 group w-full transition-all justify-start gap-4",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Activity
                size={20}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
              {!isCollapsed && (
                <Text className="text-muted-foreground group-hover:text-primary font-bold uppercase text-[10px] tracking-widest transition-colors">
                  Feedback
                </Text>
              )}
            </Button>
          </FeedbackModal>
          <SidebarFooter 
            isCollapsed={isCollapsed} 
            router={router} 
          />
        </View>

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

function SidebarHeader({ 
  mobile = false, 
  isCollapsed, 
  theme, 
  toggleTheme 
}: any) {
  return (
    <View className={cn("mb-6 transition-all duration-300 flex flex-row items-center justify-between", isCollapsed && !mobile ? "ml-0 justify-center" : "ml-2")}>
      <Logo variant="cloud" size={24} suffix={isCollapsed && !mobile ? undefined : "tools"} showWordmark={!isCollapsed || mobile} />
      {(!isCollapsed || mobile) && (
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all mr-2"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      )}
    </View>
  );
}

function SidebarMenu({ 
  mobile = false, 
  isCollapsed, 
  menuGroups, 
  pathname, 
  router, 
  setIsMobileMenuOpen 
}: any) {
  return (
    <View className="flex flex-col gap-8 pb-8">
      {menuGroups.map((group: any) => (
        <View key={group.title} className="flex flex-col gap-2">
          {(!isCollapsed || mobile) && (
            <Text className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">
              {group.title}
            </Text>
          )}
          <View className="flex flex-col gap-1">
            {group.items.map((item: any) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.href);
                    if (mobile) setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center p-3 rounded-xl transition-all w-full group relative",
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent",
                    isCollapsed && !mobile ? "justify-center px-0" : "justify-between"
                  )}
                >
                  <View className="flex flex-row items-center gap-3">
                    <item.icon
                      size={18}
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
                    isActive && <ChevronRight size={12} className="text-primary" />
                  ) : null}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !mobile && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
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
      ))}
    </View>
  );
}

function SidebarFooter({ 
  mobile = false, 
  isCollapsed, 
  router 
}: any) {
  return (
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
  );
}

function SidebarContent({ 
  mobile = false, 
  isCollapsed, 
  theme, 
  toggleTheme, 
  menuGroups, 
  pathname, 
  router, 
  setIsMobileMenuOpen 
}: any) {
  return (
    <View className="flex flex-col h-full justify-between pb-8">
      <View>
        <SidebarHeader 
          mobile={mobile} 
          isCollapsed={isCollapsed} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
        <SidebarMenu 
          mobile={mobile} 
          isCollapsed={isCollapsed} 
          menuGroups={menuGroups} 
          pathname={pathname} 
          router={router} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </View>

      <View>
        <SidebarFooter 
          mobile={mobile} 
          isCollapsed={isCollapsed} 
          router={router} 
        />
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