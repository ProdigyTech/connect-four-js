import { Server } from "socket.io";

const userGameTracker = [];

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      socket.on("join", async function (room) {
        const sockets = await io.in(room).fetchSockets();

        userGameTracker.push({ socketID: socket.id, roomID: room });

        if (sockets.length == 2) {
          console.error("can't join the room, 2 people in there");
          socket.emit("exception", { errorMessage: "maxNumberClientsReached" });
        } else {
          socket.join(room);

          let data = [];

          sockets.forEach((s) => {
            data.push(s.id);
          });

          data.push(socket.id);
          io.to(room).emit("player-joined", data);
        }
      });
      socket.on("win", (data) => {
        socket.broadcast.emit("win", data);
      });
      socket.on("animation", (data) => {
        socket.broadcast.emit("animation", data);
      });
      socket.on("mouse-move", (msg) => {
        socket.broadcast.emit("mouse-placement", msg);
      });
      socket.on("change-player", (data) => {
        socket.broadcast.emit("change-player", data);
      });
      socket.on("animation-send", (data) => {
        socket.broadcast.emit("animation-send", data);
      });

      socket.on("reset-game", () => {
        socket.broadcast.emit("reset-game", []);
      });

      socket.on("disconnect", (_id) => {
        const room = userGameTracker.find((s) => s.socketID == socket.id);
        if (room) {
          console.log(room);
          io.to(room.roomID).emit("client-disconnect");
        } else {
          console.warn(
            "A client disconnected but we couldn't find an associated room ",
            socket.id
          );
        }
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
