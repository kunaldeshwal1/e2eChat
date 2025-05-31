import express from "express";
import { prismaClient } from "../prismaClient";
import { MessageSchema } from "../types";
import { CustomRequest } from "../authMiddleware";
const router = express.Router();
router.get("/private_chat", async (req, res): Promise<any> => {});

router.get("/group_chat", async (req, res): Promise<any> => {});

router.post("/private_chat", async (req, res) => {});
router.post("/group_chat", async (req, res): Promise<any> => {
  const body = req.body;
  const customReq = req as CustomRequest;
  const currUserId = customReq.user?.userId;
  body.encryptedContent = JSON.parse(body.encryptedContent);

  const result = MessageSchema.safeParse(body);
  console.log(result);
  res.json({ message: "sent successfully" });
});

export const messageRouter = router;
