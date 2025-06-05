import express, { Request, Response } from "express";
import { RegisterSchema, LoginSchema } from "../types";
import { prismaClient } from "../prismaClient";
const router = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { auth, CustomRequest } from "../authMiddleware";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}
const saltRounds = 10;
router.post("/register", async (req: Request, res: Response) => {
  const body = req.body;
  console.log(body);
  if (!RegisterSchema.parse(body)) {
    res.status(406).json({
      message: "The registration validation failed",
    });
  }
  const userExists = await prismaClient.user.findUnique({
    where: {
      email: body.email,
    },
  });
  if (userExists) {
    res.status(409).json({
      message: "User already exists.",
    });
    return;
  }
  const hashedPassword = await bcrypt.hash(body.password, saltRounds);
  const user = await prismaClient.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
    },
  });

  res.status(200).json({
    message: "Validation passed",
    user,
  });
});
//login
router.post("/login", async (req: Request, res: Response) => {
  const body = req.body;
  if (!LoginSchema.parse(body)) {
    res.status(406).json({
      message: "Login validation failed.",
    });
  }
  const user = await prismaClient.user.findUnique({
    where: {
      email: body.email,
    },
  });
  if (!user) {
    res.status(404).json(null);
    return;
  }
  const isValidPassword = await bcrypt.compare(body.password, user.password);
  if (!isValidPassword) {
    res.status(401).json({
      message: "Password is not matching!",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET
  );
  res
    .status(200)
    .json({ message: "Logged in", id: user.id, name: user.name, token });
});
//allusers
router.get("/", auth, async (req: Request, res: Response) => {
  const customReq = req as CustomRequest;
  const myUserId = customReq.user.userId;
  const users = await prismaClient.user.findMany({
    where: {
      id: { not: customReq.user.userId },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // const roomPattern = "%" + myUserId + "%";
  const rooms = await prismaClient.room.findMany({
    where: {
      id: {
        contains: myUserId,
      },
    },
    select: {
      id: true,
    },
  });

  const existingRoomIds = new Set(rooms.map((room) => room.id));
  const availableUsers = [];
  for (const user of users) {
    const ids = [myUserId, user.id].sort();
    const roomId = ids.join("_");
    if (!existingRoomIds.has(roomId)) {
      availableUsers.push(user);
    }
  }
  res.json({
    allUsers: availableUsers,
  });
});

//logout
router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("session");
  res.json({
    message: "You've logged out!",
  });
});
export const userRouter = router;
