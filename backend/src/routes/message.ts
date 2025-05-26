import express from "express";
import { prismaClient } from "../prismaClient";
const router = express.Router();
router.get("/public_chat", async (req, res) => {
  res.json({ mesage: "Hello" });
});

router.post("/private_chat", async (req, res) => {});

export const messageRouter = router;
