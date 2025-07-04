import express, { Request, Response } from "express";
import { RoomSchema, PrivateRoom } from "../types";
import { prismaClient } from "../prismaClient";
import { CustomRequest } from "../authMiddleware";
const router = express.Router();
router.post("/public", async (req: Request, res: Response) => {
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
      createdById: customReq.user.userId,
    },
  });
  if (!room) {
    res.status(409).json({
      message: "something went wrong",
    });
    return;
  }
  res.status(200).json({
    rooms: room,
  });
});

router.post("/private", async (req: Request, res: Response) => {
  const body = req.body;
  const customReq = req as CustomRequest;
  if (!PrivateRoom.parse(body)) {
    res.json({
      message: "There is some issue in generating new private room id.",
    });
  }

  const roomId = [customReq.user.userId, body.person_two_id].sort().join("_");
  const isRoomExists = await prismaClient.room.findUnique({
    where: {
      id: roomId,
    },
  });
  if (isRoomExists) {
    res.status(409).json({
      message: "These guys are already in each other's contact list",
    });
    return;
  }

  const privateRoom = await prismaClient.room.create({
    data: {
      id: roomId,
      name: body.person_two + "_" + body.person_one,
      type: "private",
      users: {
        connect: [{ id: customReq.user?.userId }, { id: body.person_two_id }],
      },
    },
  });
  if (!privateRoom) {
    res.status(409).json({
      message: "something went wrong",
    });
    return;
  }
  res.status(200).json({
    privateRoom,
  });
});

//get all public groups
router.get("/", async (req: Request, res: Response) => {
  const rooms = await prismaClient.room.findMany({
    where: {
      type: "public",
    },
  });
  res.status(200).json({
    allGroups: rooms,
    message: rooms.length ? undefined : "No room available",
  });
});

router.get("/contacts", async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  const currUserId = customReq.user?.userId;
  const currUser = await prismaClient.user.findUnique({
    where: {
      id: currUserId,
    },
    select: {
      name: true,
    },
  });
  const roomsList = await prismaClient.room.findMany({
    where: {
      OR: [
        { id: { startsWith: currUserId + "_" } },
        { id: { endsWith: "_" + currUserId } },
      ],
    },
  });
  if (!roomsList) {
    res.status(409).json({
      message: "Something went wrong white finding user contacts",
    });
    return;
  }
  console.log(roomsList);
  res.status(200).json({
    myRooms: roomsList,
  });
});

router.delete("/public/:id", async (req: Request, res: Response) => {
  const customReq = req as unknown as CustomRequest;
  const { id } = req.params;
  const userId = customReq.user?.userId;
  const room = await prismaClient.room.findUnique({
    where: { id: id, type: "public" },
  });
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  if (room.createdById !== userId) {
    res
      .status(403)
      .json({ message: "You do not have permission to delete this group." });
    return;
  }

  await prismaClient.room.delete({ where: { id: id } });
  res.status(204).send();
});
export const roomRouter = router;
