import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 4000;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const roomKeys = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, key }: { roomId: string; key?: string }) => {
    socket.join(roomId);

    if (!roomKeys.has(roomId) && key) {
      roomKeys.set(roomId, key);
    }
    socket.emit('share-key', roomKeys.get(roomId));
    io.to(roomId).emit('user joined', `A user joined room ${roomId}`);
  });

  socket.on('message', (data: { roomId: string; message: string }) => {
    if (data.roomId && data.message) {
      socket.to(data.roomId).emit('message', data.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});