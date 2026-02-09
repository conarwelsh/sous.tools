"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@sous/ui";
import { LoginForm } from "@sous/features";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleSuccess = () => {
    setOpen(false);
    // Give time for the dialog to start closing before navigating
    router.push("/dashboard");
    router.refresh();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      router.back();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-none bg-transparent shadow-none p-0 max-w-md">
        <DialogTitle className="sr-only">Login</DialogTitle>
        <LoginForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
