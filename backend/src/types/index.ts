import {z} from "zod";

export const registerSchema = z.object({
    email: z.string(),
    password:z.string().min(8),
    name:z.string().min(5)
})
const loginSchema = z.object({
    username: z.string(),
  });