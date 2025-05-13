import {z} from "zod";

export const RegisterSchema = z.object({
    email: z.string(),
    password:z.string().min(8),
    name:z.string().min(5)
})
export const LoginSchema = z.object({
    email: z.string(),
    password:z.string().min(5)
  });