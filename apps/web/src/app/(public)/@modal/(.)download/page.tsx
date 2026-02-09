"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@sous/ui";
import DownloadPage from "../../download/page";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function DownloadModal() {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-zinc-800 bg-[#0a0a0a]">
        <DialogTitle className="sr-only">Download Terminal</DialogTitle>
        <DialogClose className="absolute right-6 top-6 z-50 rounded-full p-2 bg-black/50 hover:bg-zinc-800 transition-colors">
          <X className="h-5 w-5 text-zinc-500" />
        </DialogClose>
        <div className="flex-1 overflow-auto">
            <DownloadPage />
        </div>
      </DialogContent>
    </Dialog>
  );
}
