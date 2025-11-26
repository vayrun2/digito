import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useNavigate } from 'react-router-dom';

const GameContext = createContext();

export const useGame = () => {
    return useContext(GameContext);
};

export const GameProvider = ({ children }) => {
    const socket = useSocket();
    const navigate = useNavigate();

    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [gameState, setGameState] = useState('LOBBY'); // LOBBY, PLAYING
    const [myNumber, setMyNumber] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || '');
    const [error, setError] = useState(null);

    const [prompt, setPrompt] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError('Connection to server failed. Is the server running?');
        });

        socket.on('session_set', (data) => {
            console.log('Session Set:', data);
            setSessionId(data.sessionId);
            localStorage.setItem('sessionId', data.sessionId);
        });

        socket.on('room_update', (data) => {
            console.log('Room Update:', data);
            setRoomCode(data.roomCode);
            setPlayers(data.players);
            setGameState(data.state);
            if (data.prompt !== undefined) setPrompt(data.prompt);

            // Check if I am host
            const me = data.players.find(p => p.sessionId === (data.sessionId || sessionId));
            if (me) {
                setIsHost(me.isHost);
            }

            // Navigation Logic
            if (data.state === 'PLAYING') {
                navigate('/game');
            } else if (data.state === 'LOBBY') {
                navigate('/');
            }
        });

        socket.on('game_start', (data) => {
            console.log('Game Start:', data);
            setMyNumber(data.number);
            navigate('/game');
        });

        socket.on('new_prompt', (data) => {
            console.log('New Prompt:', data);
            setPrompt(data.prompt);
        });

        return () => {
            socket.off('connect_error');
            socket.off('session_set');
            socket.off('room_update');
            socket.off('game_start');
            socket.off('new_prompt');
        };
    }, [socket, navigate, sessionId]);

    const joinRoom = (name, code) => {
        if (!socket) return;
        setPlayerName(name);
        socket.emit('join_room', { name, roomCode: code, sessionId });
    };

    const startGame = () => {
        if (!socket) return;
        socket.emit('start_game', { roomCode });
    };

    const resetGame = () => {
        if (!socket) return;
        socket.emit('reset_game', { roomCode });
    };

    const generatePrompt = (spiciness) => {
        if (!socket) return;
        socket.emit('generate_prompt', { roomCode, spiciness });
    };

    const getPlayerColor = (name) => {
        // Find player by name (or we could pass ID, but name is what we have in Game.jsx currently)
        // Ideally Game.jsx should use the player object, but for now let's find it.
        const player = players.find(p => p.name === name);
        return player ? player.color : '#CCCCCC'; // Default gray if not found
    };

    return (
        <GameContext.Provider value={{
            roomCode,
            players,
            gameState,
            myNumber,
            playerName,
            isHost,
            error,
            prompt,
            joinRoom,
            startGame,
            resetGame,
            generatePrompt,
            getPlayerColor
        }}>
            {children}
        </GameContext.Provider>
    );
};
