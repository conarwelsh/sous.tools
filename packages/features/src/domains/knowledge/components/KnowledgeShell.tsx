'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, ChevronLeft, Layout, Palette, Zap, Menu, X, Lightbulb, FileText } from 'lucide-react';
import { Wordmark, Logo } from '@sous/ui';
import { type DocFile } from '../services/knowledge.service';

interface Props {
  children: React.ReactNode;
  docs: DocFile[];
}

export const KnowledgeShell: React.FC<Props> = ({ children, docs }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeMode = pathname.startsWith('/branding') ? 'branding' : pathname.startsWith('/playground') ? 'play' : 'docs';

  const renderNav = () => (
    <div className="flex flex-col h-full py-4">
      {/* Modes */}
      <div className="px-4 mb-8 space-y-1">
        <Link href="/docs" className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeMode === 'docs' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-zinc-500 hover:bg-zinc-900'}`}>
          <Book size={18} />
          <span className="text-sm font-bold uppercase tracking-tighter">Knowledge</span>
        </Link>
        <Link href="/branding" className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeMode === 'branding' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-zinc-500 hover:bg-zinc-900'}`}>
          <Palette size={18} />
          <span className="text-sm font-bold uppercase tracking-tighter">Branding Lab</span>
        </Link>
        <Link href="/playground/ui" className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${activeMode === 'play' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:bg-zinc-900'}`}>
          <Zap size={18} />
          <span className="text-sm font-bold uppercase tracking-tighter">Component CDD</span>
        </Link>
      </div>

      {activeMode === 'docs' && docs && (['readme', 'adr', 'spec'] as const).map((cat) => {
        const catDocs = docs.filter((d) => d.category === cat);
        if (catDocs.length === 0) return null;
        
        return (
          <div key={cat} className="mb-8 px-2">
            <div className="flex items-center px-4 mb-3 opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {cat.toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              {catDocs.map((doc) => {
                const isActive = pathname === `/docs/${doc.slug}`;
                return (
                  <Link
                    key={doc.slug}
                    href={`/docs/${doc.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full text-left flex items-center justify-between py-2.5 px-4 rounded-xl transition-all group ${
                      isActive 
                        ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20' 
                        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <span className="text-sm truncate pr-2">{doc.title}</span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-sky-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-sky-500/30">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isSidebarOpen ? 'w-[320px]' : 'w-20'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/50">
          <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
            <Logo variant="toque-tall" size={24} suffix="docs" environment="production" />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-500 hover:text-sky-500 transition-all border border-transparent hover:border-zinc-800"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Layout size={20} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isSidebarOpen ? renderNav() : (
            <div className="flex flex-col items-center py-10 space-y-8">
              <Link href="/docs" className={`p-3 rounded-xl cursor-pointer transition-all ${activeMode === 'docs' ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                <Book size={20} />
              </Link>
              <Link href="/branding" className={`p-3 rounded-xl cursor-pointer transition-all ${activeMode === 'branding' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                <Palette size={20} />
              </Link>
              <Link href="/playground" className={`p-3 rounded-xl cursor-pointer transition-all ${activeMode === 'play' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                <Zap size={20} />
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-zinc-950 border-r border-zinc-800 z-50 md:hidden transition-transform duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800">
          <Logo variant="toque-tall" size={28} suffix="docs" environment="production" />
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="text-zinc-500 p-2 hover:bg-zinc-900 rounded-xl"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {renderNav()}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {/* Header */}
        <header className="h-20 border-b border-zinc-800/50 flex items-center px-6 md:px-12 justify-between shrink-0 bg-zinc-950/50 backdrop-blur-xl z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 -ml-2 text-zinc-400 hover:text-white transition-all bg-zinc-900/50 rounded-xl border border-zinc-800 mr-4"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-3 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
              <span className="hidden sm:inline">Intelligence Hub</span>
              <span className="sm:hidden text-sky-500">IH</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex bg-zinc-900/50 border border-zinc-800/50 rounded-2xl px-4 py-2 items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">System Ready</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
