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
        <div className="flex-1 overflow-auto">
          <DownloadPage />
        </div>
      </DialogContent>
    </Dialog>
  );
}
