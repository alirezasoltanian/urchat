import { z } from "zod";

export const customizeChat = z.object({
  name: z.string().max(50, "Name must be 50 characters or less"),
  occupation: z.string().max(100, "Occupation must be 100 characters or less"),
  traits: z.array(z.string()).max(50, "Maximum 50 traits allowed"),
  additionalInfo: z
    .string()
    .max(3000, "Additional info must be 3000 characters or less"),
});
export type CustomizeChat = z.infer<typeof customizeChat>;

export const updateUserSchema = z.object({
  name: z.string().optional(),
  image: z.string().optional(),
  customizeChat: customizeChat.optional(),
});
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
