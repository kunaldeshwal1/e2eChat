import express from "express";
import { RoomSchema } from "../types";
import { prismaClient } from "../prismaClient";
import { CustomRequest } from "../authMiddleware";
const router = express.Router();
router.post("/public", async (req, res) => {
  const body = req.body;
  const customReq = req as CustomRequest;

  if (!RoomSchema.parse(body)) {
    res.status(406).json({
      message: "Room name should be present",
    });
  }
  const roomExists = await prismaClient.room.findUnique({
    where: {
      name: body.name,
    },
  });
  if (roomExists) {
    res.status(409).json({
      message: "Another room exists with same room name!",
    });
  }
  const room = await prismaClient.room.create({
    data: {
      name: body.name,
      users: {
        connect: { id: customReq.user?.userId },
      },
    },
  });
  res.status(200).json({
    room,
  });
});

export const roomRouter = router;
