const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/tutor', require('./routes/tutor'));
app.use('/api/test', require('./routes/test'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/focus', require('./routes/focus'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('Smart Education API is running...');
});

// Real-time Group Chat
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  socket.on('message', (data) => {
    // Broadcast to everyone in group room except sender
    socket.to(data.groupId).emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
