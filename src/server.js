const express = require("express");
const app = express();
const server = require("http").Server(app);
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");

const perServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", perServer);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});
server.listen(3030);
