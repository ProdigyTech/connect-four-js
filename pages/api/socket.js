import { Server } from "Socket.IO";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      socket.on("join", async function (room) {
        const sockets = await io.in(room).fetchSockets();

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
        console.log("mouse-move called!", msg);
        socket.broadcast.emit("mouse-placement", msg);
      });
      socket.on("animation-send", (data) => {
        socket.broadcast.emit("animation-send", data);
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
