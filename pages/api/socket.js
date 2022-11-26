import { Server } from "Socket.IO";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      socket.on("join", function (room) {
        if (currentPartiesConnected.length  == 2) {
          console.error("can't join the room, 2 people in there")
          socket.emit("exception", { errorMessage: "maxNumberClientsReached" });
        } else {
          console.log("joined room", room);
          socket.join(room);
       }
       
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
