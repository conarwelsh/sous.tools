import React from "react";

export const KnowledgeSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:px-16 md:py-24 animate-pulse">
      <div className="mb-16">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800" />
          <div className="h-4 w-32 bg-zinc-900 rounded-full" />
        </div>
        <div className="h-16 w-3/4 bg-zinc-900 rounded-2xl mb-6" />
        <div className="h-4 w-48 bg-zinc-900 rounded-full" />
      </div>

      <div className="space-y-8">
        <div className="h-4 w-full bg-zinc-900 rounded-full" />
        <div className="h-4 w-5/6 bg-zinc-900 rounded-full" />
        <div className="h-4 w-full bg-zinc-900 rounded-full" />
        <div className="h-4 w-4/6 bg-zinc-900 rounded-full" />

        <div className="pt-8 space-y-4">
          <div className="h-8 w-1/3 bg-zinc-900 rounded-xl" />
          <div className="h-4 w-full bg-zinc-900 rounded-full" />
          <div className="h-4 w-5/6 bg-zinc-900 rounded-full" />
        </div>
      </div>
    </div>
  );
};
