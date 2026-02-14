"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Text, View, Textarea, cn } from "@sous/ui";
import {
  SupportReport,
  SupportReportSchema,
  SupportType,
  SupportTypeEnum,
} from "../types";
import { useSupport } from "../hooks/useSupport";
import { SupportCategoryCard } from "./SupportCategoryCard";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const SupportForm: React.FC = () => {
  const { submitFeedback, isSubmitting } = useSupport();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupportReport>({
    resolver: zodResolver(SupportReportSchema),
    defaultValues: {
      type: "QUESTION",
      subject: "",
      description: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: SupportReport) => {
    setError(null);
    const result = await submitFeedback(data);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "An unexpected error occurred.");
    }
  };

  if (submitted) {
    return (
      <View className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <View className="p-4 bg-primary/10 rounded-full">
          <CheckCircle2 size={48} className="text-primary" />
        </View>
        <View className="space-y-2">
          <Text className="text-xl font-bold">Message Received!</Text>
          <Text className="text-muted-foreground">
            Our team has been notified and we'll look into it as soon as
            possible. You'll receive an email confirmation shortly.
          </Text>
        </View>
        <Button onClick={() => setSubmitted(false)}>Send Another Report</Button>
      </View>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <View className="space-y-4">
        <Text className="text-lg font-semibold tracking-tight">
          What can we help you with?
        </Text>
        <View className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SupportCategoryCard
            title="Report a Bug"
            description="Something isn't working right."
            icon={Bug}
            selected={selectedType === "BUG"}
            onClick={() => setValue("type", "BUG")}
          />
          <SupportCategoryCard
            title="Feature Request"
            description="I have an idea for Sous."
            icon={Lightbulb}
            selected={selectedType === "FEATURE"}
            onClick={() => setValue("type", "FEATURE")}
          />
          <SupportCategoryCard
            title="General Question"
            description="I need help with something."
            icon={MessageCircle}
            selected={selectedType === "QUESTION"}
            onClick={() => setValue("type", "QUESTION")}
          />
        </View>
      </View>

      <View className="space-y-6">
        <View className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Subject
          </label>
          <Input
            placeholder="e.g. Printer not connecting to KDS"
            {...register("subject")}
            className={cn(
              errors.subject &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.subject && (
            <Text className="text-destructive font-medium text-sm">
              {errors.subject.message}
            </Text>
          )}
        </View>

        <View className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Details
          </label>
          <Textarea
            placeholder="Tell us more about what's happening..."
            className={cn(
              "min-h-[150px] resize-none",
              errors.description &&
                "border-destructive focus-visible:ring-destructive",
            )}
            {...register("description")}
          />
          {errors.description && (
            <Text className="text-destructive font-medium text-sm">
              {errors.description.message}
            </Text>
          )}
        </View>

        {error && (
          <View className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex flex-row items-center gap-3">
            <AlertCircle size={20} className="text-destructive flex-shrink-0" />
            <Text className="text-destructive font-medium text-sm">
              {error}
            </Text>
          </View>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold uppercase italic tracking-tight"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Send Report"}
        </Button>
      </View>
    </form>
  );
};
