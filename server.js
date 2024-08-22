import express from "express";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const roomCounts = {}; // Armazenar o número de usuários em cada sala

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join room', (room) => {
    socket.join(room);

    if (!roomCounts[room]) {
      roomCounts[room] = 0;
    }

    roomCounts[room] += 1;
    updateRoomCounts();

    socket.on('chat message', ({ room, name, msg }) => {
      io.to(room).emit('chat message', { name, msg });
    });

    socket.on('disconnect', () => {
      roomCounts[room] -= 1;
      if (roomCounts[room] <= 0) {
        delete roomCounts[room];
      }
      updateRoomCounts();
      console.log('user disconnected');
    });
  });
  
  function updateRoomCounts() {
    io.emit('room counts', roomCounts);
  }
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
