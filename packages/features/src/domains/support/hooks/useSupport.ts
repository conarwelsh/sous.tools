"use client";

import { useState } from "react";
import { submitFeedbackAction } from "../actions/submitFeedbackAction";
import { SupportReport, SupportType } from "../types";
import { useAuth } from "../../iam/auth/hooks/useAuth";

export const useSupport = () => {
  const [isSubmitting, setIsInitialized] = useState(false);
  const { user } = useAuth();

  const submitFeedback = async (data: Omit<SupportReport, "metadata">) => {
    setIsInitialized(true);
    try {
      const metadata = {
        appVersion: "1.0.0", // TODO: Get from config or package.json
        orgId: user?.organizationId,
        userId: user?.id,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
        url: typeof window !== "undefined" ? window.location.href : "unknown",
      };

      const result = await submitFeedbackAction({
        ...data,
        metadata,
      } as SupportReport);

      return result;
    } finally {
      setIsInitialized(false);
    }
  };

  return {
    submitFeedback,
    isSubmitting,
  };
};
