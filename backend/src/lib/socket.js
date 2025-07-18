import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server=http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  }
});

export function getRecieverSocketId(userId) {
    return userSocketsMap[userId];
}

const userSocketsMap = {};

io.on("connection", (socket) => {
    console.log("A user connceted",socket.id)
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketsMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketsMap));
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete userSocketsMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketsMap));
    })
})

export { io, app, server };