import path from "path";
import express from "express"
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist/snaptalk/browser')));

const activeUsers = {};

io.on('connection', (socket) => {

    activeUsers[socket.id] = {
        socket: socket,
        isPaired: false
    }

    if(Object.keys(activeUsers).length > 1) {
        const connectedUserId = Object.keys(activeUsers).at(0);
        activeUsers[connectedUserId].socket.emit('user-connected', socket.id);
        socket.emit('user-connected', connectedUserId);
        activeUsers[connectedUserId].isPaired = true;
        activeUsers[socket.id].isPaired = true;
    }

    socket.on('message', (message, socketId) => {
        activeUsers[socketId].socket.emit('message', message);
    })

    socket.on('typing', (socketId) => {
        activeUsers[socketId].socket.emit('typing');
    })

    socket.on('stop-typing', (socketId) => {
        activeUsers[socketId].socket.emit('stop-typing');
    })

    socket.on('disconnecter', (socketId) => {
        if(activeUsers[socketId]){
            activeUsers[socketId].socket.emit('user-disconnected');
            activeUsers[socketId].isPaired = false;
        }
    })

    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
    })

})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/snaptalk/browser/index.html'));
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));