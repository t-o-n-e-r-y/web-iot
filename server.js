const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Express
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'my-secret-key', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
require('./static/login-routes')(app);

//  Goi mqtt-handler va truyen io vao 
require('./static/mqtt-handler')(io);

// Khoi chay server 
server.listen(3000, () => {
  console.log(' Server dang chay tai http://localhost:3000'); 
});
