import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Sidebar, SidebarItem } from './Sidebar.js';
import { Hamburger } from './Hamburger.js';
import { View } from '../ui/view.js';

interface Props {
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  sidebarChildren?: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ 
  sidebarItems, 
  children, 
  headerContent,
  sidebarChildren 
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [collapsed, setCollapsed] = useState(isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ViewAny = View as any;

  return (
    <ViewAny className="flex-1 flex-row bg-zinc-950">
      {/* Sidebar - Hidden on mobile, sliding on mobile, or mini on desktop */}
      {!isMobile && (
        <Sidebar 
          items={sidebarItems} 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)}
        >
          {sidebarChildren}
        </Sidebar>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <ViewAny 
          className={`absolute top-0 left-0 bottom-0 z-50 w-full max-w-[280px] transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar 
            items={sidebarItems} 
            collapsed={false} 
            onToggle={() => setMobileMenuOpen(false)}
          >
            {sidebarChildren}
          </Sidebar>
        </ViewAny>
      )}

      {/* Mobile Overlay Background */}
      {isMobile && mobileMenuOpen && (
        <ViewAny 
          className="absolute inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
          onTouchStart={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <ViewAny className="flex-1 flex-column h-screen overflow-hidden">
        {/* Header */}
        <ViewAny className="h-16 border-b border-zinc-800 px-4 flex-row items-center justify-between">
          <ViewAny className="flex-row items-center">
            {isMobile && (
              <Hamburger 
                active={mobileMenuOpen} 
                onPress={() => setMobileMenuOpen(!mobileMenuOpen)} 
              />
            )}
            {headerContent}
          </ViewAny>
        </ViewAny>

        {/* Scrollable Content */}
        <ViewAny className="flex-1 overflow-auto">
          {children}
        </ViewAny>
      </ViewAny>
    </ViewAny>
  );
};
