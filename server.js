var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var users = [];
var connections = [];

server.listen(process.env.PORT || 3000);
console.log("running..");
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function(socket) {
  connections.push(socket);
  console.log(`Connected: ${connections.length} sockets connected`);

  // Disconnect
  socket.on("disconnect", function(data) {
    users.splice(users.indexOf(socket.username), 1);
    connections.splice(connections.indexOf(socket), 1);
    console.log(`Disconnected ${connections.length}`);
  });

  //sendMessage

  socket.on("send message", function(data) {
    io.sockets.emit("new message", {
      msg: data,
      name: socket.username,
      color: socket.color
    });
  });

  socket.on("new user", function(data, callback) {
    callback(true);
    users.push(data);
    socket.username = data;
    socket.color = getRandomColor();
    socket.emit("enter chat", data);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit("get users", users);
  }

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
});
