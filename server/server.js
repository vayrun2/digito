const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for now (dev mode)
        methods: ["GET", "POST"]
    }
});

// State Management
const rooms = new Map(); // roomCode -> { players: [], state: 'LOBBY', deck: [] }
const sessions = new Map(); // sessionId -> { socketId, roomCode, name, number }

// Helper: Generate 4-char room code
const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// Playful Color Palette
const COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5', // Pink
    '#9B59B6', // Purple
    '#3498DB', // Dark Blue
    '#E67E22', // Orange
    '#2ECC71', // Emerald
    '#F1C40F', // Sun
];

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Handle Join Room
    socket.on('join_room', ({ name, roomCode, sessionId }) => {
        let currentSessionId = sessionId || uuidv4();
        let currentRoomCode = roomCode ? roomCode.toUpperCase() : generateRoomCode();

        // Reconnection Logic
        if (sessions.has(currentSessionId)) {
            const session = sessions.get(currentSessionId);
            currentRoomCode = session.roomCode;
            // Update socket ID for the session
            session.socketId = socket.id;
            console.log(`User Reconnected: ${name} (${currentSessionId})`);
        } else {
            // New Session
            sessions.set(currentSessionId, {
                socketId: socket.id,
                roomCode: currentRoomCode,
                name,
                number: null,
                color: null // Will be assigned on room join
            });
        }

        socket.join(currentRoomCode);

        // Initialize Room if not exists
        if (!rooms.has(currentRoomCode)) {
            rooms.set(currentRoomCode, {
                players: [],
                state: 'LOBBY',
                hostId: currentSessionId, // First player is host
                availableColors: [...COLORS].sort(() => Math.random() - 0.5) // Shuffle colors
            });
        }

        const room = rooms.get(currentRoomCode);
        const session = sessions.get(currentSessionId);

        // Add player to room list if not already there
        if (!room.players.find(p => p.sessionId === currentSessionId)) {
            // Assign a color
            let color = session.color;
            if (!color) {
                if (room.availableColors.length > 0) {
                    color = room.availableColors.pop();
                } else {
                    // Fallback if we run out of colors (random hex)
                    color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                }
                session.color = color;
            }

            room.players.push({
                sessionId: currentSessionId,
                name,
                isHost: room.hostId === currentSessionId,
                color: color
            });
        }

        // Send session info only to the user who joined
        socket.emit('session_set', { sessionId: currentSessionId });

        // If game is playing, send the number to the user
        if (room.state === 'PLAYING') {
            const session = sessions.get(currentSessionId);
            if (session && session.number) {
                socket.emit('game_start', { number: session.number });
            }
        }

        // Send updated state to everyone in room
        io.to(currentRoomCode).emit('room_update', {
            roomCode: currentRoomCode,
            players: room.players,
            state: room.state
        });
    });

    // Handle Start Game
    socket.on('start_game', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room) return;

        // Generate numbers 1-100
        let deck = Array.from({ length: 100 }, (_, i) => i + 1);

        // Fisher-Yates Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        room.state = 'PLAYING';

        // Distribute numbers
        room.players.forEach(player => {
            const num = deck.pop();
            const session = sessions.get(player.sessionId);
            if (session) {
                session.number = num;
                // Send individual number to specific socket
                io.to(session.socketId).emit('game_start', { number: num });
            }
        });

        // Notify everyone game has started
        io.to(roomCode).emit('room_update', {
            roomCode,
            players: room.players,
            state: room.state
        });
    });

    // Handle Reset Game
    socket.on('reset_game', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room) {
            return;
        }

        room.state = 'LOBBY';

        // Reset player numbers
        room.players.forEach(player => {
            const session = sessions.get(player.sessionId);
            if (session) {
                session.number = null;
            }
        });

        io.to(roomCode).emit('room_update', {
            roomCode,
            players: room.players,
            state: room.state
        });
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
        // We don't remove from room immediately to allow reconnection
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.use((req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
