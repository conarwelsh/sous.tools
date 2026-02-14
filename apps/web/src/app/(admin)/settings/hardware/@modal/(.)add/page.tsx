"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@sous/ui";
import { PairingWorkflow } from "@sous/features";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function AddHardwareModal() {
  const router = useRouter();

  const handleSuccess = () => {
    router.back();
    // HardwareManager should auto-refresh via subscription or refetch
  };

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-2xl border-border bg-background p-0 overflow-hidden">
        <DialogTitle className="sr-only">Add Hardware Device</DialogTitle>
        <div className="p-8">
          <PairingWorkflow onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
