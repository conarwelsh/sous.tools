"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  Button
} from "@sous/ui";
import { SupportForm } from "./SupportForm";
import { MessageSquarePlus } from "lucide-react";

export const FeedbackModal: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquarePlus size={16} />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Support & Feedback</DialogTitle>
          <DialogDescription>
            Found a bug or have a suggestion? We're all ears.
          </DialogDescription>
        </DialogHeader>
        <SupportForm />
      </DialogContent>
    </Dialog>
  );
};
