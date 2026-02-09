"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Book, Lightbulb, FileText } from "lucide-react";
import { type DocFile } from "../types.js";

interface Props {
  doc: DocFile;
}

export const KnowledgeDocView: React.FC<Props> = ({ doc }) => {
  const categories = {
    readme: { icon: Book, label: "Documentation" },
    adr: { icon: Lightbulb, label: "Architectural Decisions" },
    spec: { icon: FileText, label: "Specifications" },
  } as any;

  const Icon = categories[doc.category]?.icon || Book;

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 md:px-16 md:py-24">
      <div className="mb-16 relative">
        <div className="absolute -left-12 top-0 bottom-0 w-1 bg-sky-500/20 rounded-full hidden md:block" />
        <div className="flex items-center space-x-3 text-sky-500 mb-8">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <Icon size={20} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">
            {categories[doc.category]?.label || "General"}
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-brand font-black tracking-tighter text-white mb-6 leading-[0.9]">
          {doc.title}
        </h1>
        <p className="text-zinc-500 font-medium tracking-tight">
          System Document • v0.0.0
        </p>
      </div>

      <div
        className="prose prose-invert prose-sky max-w-none 
        prose-headings:font-brand prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
        prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-zinc-800
        prose-p:text-zinc-400 prose-p:text-lg prose-p:leading-relaxed
        prose-a:text-sky-400 prose-a:font-bold prose-a:no-underline hover:prose-a:text-sky-300 transition-colors
        prose-code:text-sky-300 prose-code:bg-sky-500/5 prose-code:border prose-code:border-sky-500/10 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-zinc-900/30 prose-pre:backdrop-blur-sm prose-pre:border prose-pre:border-zinc-800/50 prose-pre:rounded-2xl prose-pre:p-6
        prose-strong:text-zinc-100 prose-strong:font-bold
        prose-ul:list-none prose-ul:pl-0
        prose-li:text-zinc-400 prose-li:relative prose-li:pl-8 prose-li:mb-4
        prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:w-2 prose-li:before:h-2 prose-li:before:bg-sky-500/30 prose-li:before:rounded-full
        prose-hr:border-zinc-800 prose-hr:my-16"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
      </div>
    </article>
  );
};
