"use server";

import { config } from "@sous/config";

export async function getPricingPlansAction() {
  try {
    const apiUrl = config.api.url || "http://localhost:4000";
    const res = await fetch(`${apiUrl}/billing/plans`, {
      next: { revalidate: 3600 },
    } as any);

    if (!res.ok) {
      return { success: false, error: "Failed to fetch pricing plans" };
    }

    const plans = await res.json();
    return { success: true, data: plans };
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return { success: false, error: "Internal server error while fetching plans" };
  }
}
