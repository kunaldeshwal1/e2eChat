import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { userRouter } from "./routes/user";
import cors from "cors";
import cookieParser from "cookie-parser";
import { auth } from "./authMiddleware";
import { messageRouter } from "./routes/message";
import { roomRouter } from "./routes/room";

const PORT = 4000;

const app = express();
app.use(cookieParser());
const httpServer = createServer(app);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomKeys = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on(
    "join-room",
    ({ roomId, key }: { roomId: string; key?: string }) => {
      socket.join(roomId);

      if (!roomKeys.has(roomId) && key) {
        roomKeys.set(roomId, key);
      }
      socket.emit("share-key", roomKeys.get(roomId));
      io.to(roomId).emit("user joined", `A user joined room ${roomId}`);
    }
  );

  socket.on("groupMessage", (data: { roomId: string; message: string }) => {
    if (data.roomId && data.message) {
      socket.to(data.roomId).emit("groupMessage", data.message);
    }
  });
  socket.on("leaveGroupChat", ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
  });
  socket.on("leavePrivateChat", ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
app.use(express.json());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", auth, messageRouter);
app.use("/api/v1/room", auth, roomRouter);

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
