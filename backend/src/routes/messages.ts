import express from "express";
import { prismaClient } from "../prismaClient";
const router = express.Router();
router.get("/all", async (req, res) => {
  res.json({ mesage: "Hello" });
});

export const messageRouter = router;
