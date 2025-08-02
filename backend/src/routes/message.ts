import express, { Request, Response } from "express";
import { prismaClient } from "../prismaClient";
import { MessageSchema } from "../types";
import { CustomRequest } from "../authMiddleware";
import { Prisma } from "@prisma/client";
import { io } from "../index";
const router = express.Router();
router.get("/private_chat", async (req: Request, res: Response) => {
  const { roomId } = req.query;

  if (!roomId || typeof roomId !== "string") {
    res.status(400).json({ error: "roomId is required" });
    return;
  }

  const messages = await prismaClient.message.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json(messages);
});

router.get("/group_chat", async (req: Request, res: Response) => {
  const { roomId } = req.query;

  if (!roomId || typeof roomId !== "string") {
    res.status(400).json({ error: "roomId is required" });
    return;
  }

  const messages = await prismaClient.message.findMany({
    where: { roomId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json(messages);
});

router.post("/private_chat", async (req: Request, res: Response) => {
  const body = req.body;
  const customReq = req as CustomRequest;
  const currUserId = customReq.user?.userId;
  body.encryptedContent = JSON.parse(body.encryptedContent);
  const result = MessageSchema.safeParse(body);
  if (!result.success) {
    res.status(409).json({
      message: "Message schema faild by zod issue occured on the server!",
    });
    return;
  }
  const parsedContent = result.data?.encryptedContent;
  const parsedRoomId = result.data.roomId;

  const savedMessage = await prismaClient.message.create({
    data: {
      content: parsedContent as Prisma.InputJsonObject,
      senderId: currUserId,
      roomId: parsedRoomId,
    },
  });
  io.to(parsedRoomId).emit("groupMessage", savedMessage);

  res.json({ message: "sent successfully" });
});
router.post("/group_chat", async (req: Request, res: Response) => {
  const body = req.body;
  const customReq = req as CustomRequest;
  const currUserId = customReq.user?.userId;
  body.encryptedContent = JSON.parse(body.encryptedContent);
  const result = MessageSchema.safeParse(body);
  if (!result.success) {
    res.status(409).json({
      message: "Message schema faild by zod issue occured on the server!",
    });
    return;
  }
  const parsedContent = result.data?.encryptedContent;
  const parsedRoomId = result.data.roomId;

  const savedMessage = await prismaClient.message.create({
    data: {
      content: parsedContent as Prisma.InputJsonObject,
      senderId: currUserId,
      roomId: parsedRoomId,
    },
  });
  io.to(parsedRoomId).emit("groupMessage", savedMessage);

  res.json({ message: "sent successfully" });
});

export const messageRouter = router;
