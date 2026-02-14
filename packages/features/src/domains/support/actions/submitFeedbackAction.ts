"use server";

import { getHttpClient } from "@sous/client-sdk";
import { SupportReport, SupportReportSchema } from "../types";

export async function submitFeedbackAction(data: SupportReport) {
  // Validate data
  const validated = SupportReportSchema.parse(data);

  try {
    const http = await getHttpClient();
    const response = await http.post("/support/report", validated);
    return { success: true, data: response };
  } catch (error: any) {
    console.error("[SupportAction] Error submitting feedback:", error);
    return { 
      success: false, 
      error: error.message || "Failed to submit feedback. Please try again later." 
    };
  }
}
