import express from "express";
import { prismaClient } from "../prismaClient";
import { MessageSchema } from "../types";
import { CustomRequest } from "../authMiddleware";
import { Prisma } from "@prisma/client";
const router = express.Router();
router.get("/private_chat", async (req, res): Promise<any> => {
  const { roomId } = req.query;
  console.log(roomId);

  if (!roomId || typeof roomId !== "string") {
    return res.status(400).json({ error: "roomId is required" });
  }

  const messages = await prismaClient.message.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.json(messages);
});

router.get("/group_chat", async (req, res): Promise<any> => {
  const { roomId } = req.query;
  console.log(roomId);

  if (!roomId || typeof roomId !== "string") {
    return res.status(400).json({ error: "roomId is required" });
  }

  const messages = await prismaClient.message.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json(messages);
});

router.post("/private_chat", async (req, res): Promise<any> => {
  const body = req.body;
  const customReq = req as CustomRequest;
  const currUserId = customReq.user?.userId;
  body.encryptedContent = JSON.parse(body.encryptedContent);
  const result = MessageSchema.safeParse(body);
  console.log(result.data);
  if (!result.success) {
    return res.status(409).json({
      message: "Message schema faild by zod issue occured on the server!",
    });
  }
  const parsedContent = result.data?.encryptedContent;
  const parsedRoomId = result.data.roomId;

  await prismaClient.message.create({
    data: {
      content: parsedContent as Prisma.InputJsonObject,
      senderId: currUserId,
      roomId: parsedRoomId,
    },
  });
  return res.json({ message: "sent successfully" });
});
router.post("/group_chat", async (req, res): Promise<any> => {
  const body = req.body;
  const customReq = req as CustomRequest;
  const currUserId = customReq.user?.userId;
  body.encryptedContent = JSON.parse(body.encryptedContent);
  const result = MessageSchema.safeParse(body);
  console.log(result.data);
  if (!result.success) {
    return res.status(409).json({
      message: "Message schema faild by zod issue occured on the server!",
    });
  }
  const parsedContent = result.data?.encryptedContent;
  const parsedRoomId = result.data.roomId;

  await prismaClient.message.create({
    data: {
      content: parsedContent as Prisma.InputJsonObject,
      senderId: currUserId,
      roomId: parsedRoomId,
    },
  });
  return res.json({ message: "sent successfully" });
});

export const messageRouter = router;
