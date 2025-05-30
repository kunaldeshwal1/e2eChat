import express from "express";
import { RoomSchema, PrivateRoom } from "../types";
import { prismaClient } from "../prismaClient";
import { CustomRequest } from "../authMiddleware";
const router = express.Router();
router.post("/public", async (req, res): Promise<any> => {
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
  if (!room) {
    return res.status(409).json({
      message: "something went wrong",
    });
  }
  res.status(200).json({
    rooms: room,
  });
});

router.post("/private", async (req, res): Promise<any> => {
  const body = req.body;
  const customReq = req as CustomRequest;
  if (!PrivateRoom.parse(body)) {
    res.json({
      message: "There is some issue in generating new private room id.",
    });
  }

  const roomId = [customReq.user.userId, body.person_two_id].sort().join("_");
  console.log("roomid is here", roomId);
  const isRoomExists = await prismaClient.room.findUnique({
    where: {
      id: roomId,
    },
  });
  console.log("Is room exists", isRoomExists);
  if (isRoomExists) {
    res.status(409).json({
      message: "These guys are already in each other's contact list",
    });
    return;
  }

  const privateRoom = await prismaClient.room.create({
    data: {
      id: roomId,
      name: body.person_two,
      type: "private",
      users: {
        connect: [{ id: customReq.user?.userId }, { id: body.person_two_id }],
      },
    },
  });
  if (!privateRoom) {
    return res.status(409).json({
      message: "something went wrong",
    });
  }
  res.status(200).json({
    privateRoom,
  });
});

//get all public groups
router.get("/", async (req, res) => {
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

router.get("/contacts", async (req, res): Promise<any> => {
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
        {
          id: {
            startsWith: currUserId,
          },
        },
        { id: { endsWith: currUserId } },
      ],
    },
  });
  if (!roomsList) {
    return res.status(409).json({
      message: "Something went wrong white finding user contacts",
    });
  }
  res.status(200).json({
    myRooms: roomsList,
  });
});

export const roomRouter = router;
