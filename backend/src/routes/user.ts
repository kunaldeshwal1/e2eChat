import express from "express";
import { RegisterSchema, LoginSchema } from "../types";
import { prismaClient } from "../prismaClient";
const router = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
    .json({ message: "Logged in", name: user.name });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("session");
  res.json({
    message: "You've logged out!",
  });
});

router.get("/allusers", async (req, res): Promise<any> => {
  const users = await prismaClient.user.findMany();
  if (!users) {
    return res.json({
      message: "No user present in the db",
    });
  }
  res.json({
    allUsers: users,
  });
});
export const userRouter = router;
