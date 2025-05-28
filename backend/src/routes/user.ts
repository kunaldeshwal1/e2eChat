import express from "express";
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
router.post("/register", async (req, res): Promise<any> => {
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
router.post("/login", async (req, res) => {
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
    res.status(404).json({
      message: "No user exists of this username.",
    });
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
    .cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    })
    .json({ message: "Logged in", id: user.id, name: user.name });
});
//allusers
router.get("/", auth, async (req, res): Promise<any> => {
  const customReq = req as CustomRequest;

  const users = await prismaClient.user.findMany({
    where: {
      NOT: {
        id: customReq.user?.userId,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
  if (!users.length) {
    return res.json({
      message: "No user present in the db",
    });
  }
  res.json({
    allUsers: users,
  });
});

//logout
router.post("/logout", async (req, res) => {
  res.clearCookie("session");
  res.json({
    message: "You've logged out!",
  });
});
export const userRouter = router;
