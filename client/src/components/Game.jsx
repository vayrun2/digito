import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Game = () => {
    const { myNumber, playerName, getPlayerColor, isHost, resetGame, prompt, leaveRoom } = useGame();
    const [isRevealed, setIsRevealed] = useState(true); // Default to revealed (Number)

    const cardColor = getPlayerColor(playerName);

    const toggleReveal = () => {
        setIsRevealed(!isRevealed);
    };

    return (
        <div style={{
            ...styles.container,
            background: isRevealed ? 'var(--color-white)' : cardColor,
        }}>

            {/* Prompt Display - Only show when number is revealed */}
            {prompt && isRevealed && (
                <div style={styles.promptContainer}>
                    <span style={styles.promptText}>{prompt}</span>
                </div>
            )}

            {/* Content Area */}
            <div style={styles.content}>
                {isRevealed ? (
                    <div style={styles.numberContainer}>
                        <span style={styles.number}>{myNumber !== null ? myNumber : '...'}</span>
                    </div>
                ) : (
                    <div style={styles.identityContainer}>
                        <span style={styles.name}>{playerName}</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={styles.controls}>
                <button onClick={toggleReveal} style={styles.flipButton}>
                    {isRevealed ? "Flip Card 🔄" : "Reveal Number 👁️"}
                </button>

                {isHost && (
                    <button onClick={resetGame} style={styles.resetButton}>
                        New Game
                    </button>
                )}

                <button onClick={leaveRoom} style={styles.homeButton}>
                    🏠 Home
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
        position: 'relative',
    },
    content: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    numberContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    number: {
        fontSize: 'min(40vh, 40vw)', // Responsive massive text
        fontWeight: '800',
        color: 'var(--color-text)',
        lineHeight: 1,
    },
    identityContainer: {
        display: 'flex',
        alignItems: 'flex-end', // Name at bottom
        justifyContent: 'center',
        height: '100%',
        paddingBottom: '150px', // Space for buttons
    },
    name: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        textAlign: 'center',
        padding: '20px',
    },
    controls: {
        position: 'absolute',
        bottom: '40px',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        zIndex: 10,
        pointerEvents: 'none', // Let clicks pass through container
    },
    flipButton: {
        pointerEvents: 'auto', // Re-enable clicks
        padding: '20px 40px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.2)',
    },
    resetButton: {
        pointerEvents: 'auto',
        padding: '10px 20px',
        fontSize: '1rem',
        color: 'white',
        background: 'rgba(229, 62, 62, 0.8)', // Red
        borderRadius: 'var(--radius-md)',
        border: 'none',
    },
    homeButton: {
        pointerEvents: 'auto',
        padding: '10px 20px',
        fontSize: '1rem',
        color: 'white',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
    },
    promptContainer: {
        position: 'absolute',
        top: '80px', // Moved down further
        left: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        zIndex: 20,
        textAlign: 'center',
        pointerEvents: 'none',
    },
    promptText: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: 'var(--color-text)',
    },
    hostControls: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: 'var(--radius-lg)',
        pointerEvents: 'auto',
    },
    aiControls: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        width: '100%',
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: 'var(--color-text)',
    },
    slider: {
        width: '100%',
        accentColor: 'var(--color-primary)',
    },
    aiButton: {
        padding: '8px 16px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        color: 'white',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        width: '100%',
    }
};

export default Game;
