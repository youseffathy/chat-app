const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const utils = require("./utils/messages");
const users = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  // join room
  socket.on("join", (options, callback) => {
    const { error, user } = users.addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", utils.generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit("message", utils.generateMessage("Admin", `${user.username} has joined!`));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: users.getUsersInRoom(user.room),
    });
    callback();
  });

  // send message
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed ");
    }
    const user = users.getUser(socket.id);
    io.to(user.room).emit("message", utils.generateMessage(user.username, message));
    callback(); // for event acknowledgement
  });

  // send location
  socket.on("sendLocation", (location, callback) => {
    const user = users.getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      utils.generateLocationMessage(
        user.username,
        `http://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  // disconnect
  socket.on("disconnect", () => {
    const user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        utils.generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: users.getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Server is up on port " + port);
});
