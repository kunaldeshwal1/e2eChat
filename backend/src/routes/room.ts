import express from "express";
import { RoomSchema } from "../types";
import { prismaClient } from "../prismaClient";
import { CustomRequest } from "../authMiddleware";
const router = express.Router();
router.post("/public", async (req, res) => {
  const body = req.body;
  console.log("this is room body", body);
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
    rooms: room,
  });
});

router.get("/", async (req, res) => {
  const rooms = await prismaClient.room.findMany({
    where: {
      type: "public",
    },
  });
  if (rooms.length <= 0) {
    res.status(204).json({
      message: "No room available",
    });
  }
  res.status(200).json({
    allGroups: rooms,
  });
});

export const roomRouter = router;
