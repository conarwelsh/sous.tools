"use client";

import React from "react";
import { ComponentPlayground } from "./ComponentPlayground";

const packageMap: Record<string, React.ReactNode> = {
  ui: <ComponentPlayground />,
  features: (
    <div className="p-12 text-zinc-500">Features playground coming soon...</div>
  ),
  "api-client": (
    <div className="p-12 text-zinc-500">
      API Client playground coming soon...
    </div>
  ),
};

export const PlaygroundController: React.FC<{ pkg?: string }> = ({ pkg }) => {
  const content = pkg ? packageMap[pkg] : packageMap["ui"];

  if (!content) {
    return (
      <div className="p-12">
        <h1 className="text-2xl font-brand font-black text-red-500">
          Package "{pkg}" not found
        </h1>
        <p className="text-zinc-500 mt-4">
          Available packages: {Object.keys(packageMap).join(", ")}
        </p>
      </div>
    );
  }

  return <>{content}</>;
};
