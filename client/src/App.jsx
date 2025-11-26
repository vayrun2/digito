import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import Lobby from './components/Lobby';
import Game from './components/Game';

function App() {
    return (
        <SocketProvider>
            <Router>
                <GameProvider>
                    <Routes>
                        <Route path="/" element={<Lobby />} />
                        <Route path="/game" element={<Game />} />
                    </Routes>
                </GameProvider>
            </Router>
        </SocketProvider>
    );
}

export default App;
