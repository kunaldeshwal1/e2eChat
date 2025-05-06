import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 4000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  });

  const io = new Server(httpServer);
  const roomKeys = new Map();


  io.on("connection", (socket) => {
    socket.on("join-room", ({roomId,key}) => {
      socket.join(roomId);
      if (!roomKeys.has(roomId) && key) {
        roomKeys.set(roomId, key);
      }
      socket.emit('share-key', roomKeys.get(roomId));
      io.to(roomId).emit('user joined', `A user joined room ${roomId}`);
    });

    socket.on('message', (data) => {
      if (data.roomId && data.message) {
        socket.to(data.roomId).emit('message', data.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});