import { z } from "zod";
export const RegisterSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
  name: z.string().min(5),
});
export const LoginSchema = z.object({
  email: z.string(),
  password: z.string().min(5),
});

export const RoomSchema = z.object({
  name: z.string().min(3),
});
export const PrivateRoom = z.object({
  person_one: z.string(),
  person_two: z.string(),
  person_two_id: z.string(),
});
export const MessageSchema = z.object({
  roomId: z.string().min(3),
  encryptedContent: z.object({
    iv: z.array(z.number()),
    ciphertext: z.array(z.number()),
  }),
});
