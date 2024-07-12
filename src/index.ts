import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

interface LocationUpdate {
  id: string;
  latitude: number;
  longitude: number;
}

const users: { [key: string]: LocationUpdate } = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('locationUpdate', (location: Omit<LocationUpdate, 'id'>) => {
    const updatedLocation = { ...location, id: socket.id };
    users[socket.id] = updatedLocation;
    io.emit('locationUpdate', updatedLocation);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    delete users[socket.id];
    io.emit('userDisconnected', socket.id);
  });
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
