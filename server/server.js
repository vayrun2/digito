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

// Gemini AI Setup
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

let model;
if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} else {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
}

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
        room.prompt = null; // Clear prompt on reset

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
            state: room.state,
            prompt: null
        });
    });

    // Handle AI Prompt Generation
    socket.on('generate_prompt', async ({ roomCode, mode }) => {
        console.log(`Received generate_prompt for room ${roomCode} with mode: ${mode}`);

        const room = rooms.get(roomCode);
        if (!room) {
            console.error(`Room ${roomCode} not found`);
            return;
        }

        if (!model) {
            console.error("Gemini Model not initialized. API Key missing?");
            socket.emit('error', 'Server missing API Key. Cannot generate prompt.');
            return;
        }

        try {
            const promptTemplate = `Role: You are a game content generator for the cooperative party game "Ito." In this game, players are given a category that involves a spectrum (e.g., "Worst to Best" or "Least to Most"), and they must place a secret number they hold onto that spectrum.

Objective: Generate a single game category based on the user's specified mode.

Context & Examples: The game operates in two distinct modes. You must strictly adhere to the tone of the selected mode using the training data below:

Mode A: SAFE Tone: Whimsical, family-friendly, abstract, funny, or everyday scenarios.
"Superpowers from least to most powerful"
"Worst to best places to start dancing uncontrollably"
"Scenarios from least to most annoying"
"Worst to best things to have the ability to conjure from thin air"
"Animals and fantasy creatures from least to most cool to have as a pet"
"Worst to best things to put in a smoothie"
"Things you would do if you were a bird from least to most interesting"

Mode B: NSFW Tone: Adult humor, dark/morbid curiosity, sexual topics, taboo, gross-out humor, or illegal activities.
"Worst to best ways to commit a murder and try to get away with it"
"Worst to best things to get tattooed"
"Ways to make a child cry from least to most cruel"
"Places to hide a body from worst to best"
"Worst to best excuses for cheating on your significant other"
"Worst to best things to do in a zombie apocalypse"
"Things that least to most disgust you"
"Worst to best things to nickname your genitals"

Instructions:
Analyze the Input: The user will provide a mode (SAFE or NSFW).
Generate a Category: Create a new category that fits the format "Subject X from [Metric A] to [Metric B]" or "Worst to Best [Subject X]."
Ensure Ambiguity: The category must be subjective enough that players can debate where a number falls on the scale.
Output Format: Output only the category text. Do not provide preamble or explanations.

User Input: ${mode}`;

            const result = await model.generateContent(promptTemplate);
            const response = await result.response;
            const text = response.text().trim();

            room.prompt = text;

            io.to(roomCode).emit('new_prompt', { prompt: text });
        } catch (error) {
            console.error("AI Generation Error:", error);
            socket.emit('error', 'Failed to generate prompt. Try again!');
        }
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
