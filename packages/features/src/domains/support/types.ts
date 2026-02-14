import { z } from "zod";

export const SupportTypeEnum = z.enum(["BUG", "FEATURE", "QUESTION"]);
export type SupportType = z.infer<typeof SupportTypeEnum>;

export const SupportPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type SupportPriority = z.infer<typeof SupportPriorityEnum>;

export const SupportReportSchema = z.object({
  type: SupportTypeEnum,
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: SupportPriorityEnum.optional(),
  metadata: z.object({
    appVersion: z.string(),
    orgId: z.string().optional(),
    userId: z.string().optional(),
    userAgent: z.string(),
    url: z.string(),
  }).optional(),
});

export type SupportReport = z.infer<typeof SupportReportSchema>;
