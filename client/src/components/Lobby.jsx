import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Lobby = () => {
    const { roomCode, players, isHost, joinRoom, startGame, error } = useGame();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    const handleJoin = (e) => {
        e.preventDefault();
        if (name) {
            joinRoom(name, code);
        }
    };

    const handleCreate = () => {
        if (name) {
            joinRoom(name, '');
        }
    };

    if (roomCode) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Room Code</h2>
                    <div style={styles.codeDisplay}>{roomCode}</div>

                    <div style={styles.playerList}>
                        <h3 style={styles.subtitle}>Players</h3>
                        {players.map((p, i) => (
                            <div key={i} style={styles.playerTag}>
                                {p.name} {p.isHost && '👑'}
                            </div>
                        ))}
                    </div>

                    {isHost ? (
                        <button onClick={startGame} style={styles.primaryButton}>
                            Start Game 🚀
                        </button>
                    ) : (
                        <p style={styles.waitingText}>Waiting for host...</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.logo}>digito</h1>

                {error && <div style={styles.error}>{error}</div>}

                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />

                <input
                    type="text"
                    placeholder="Room Code (Optional)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={styles.input}
                />

                <div style={styles.buttonGroup}>
                    <button
                        onClick={handleJoin}
                        disabled={!name}
                        style={{ ...styles.secondaryButton, opacity: !name ? 0.5 : 1 }}
                    >
                        Join
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name}
                        style={{ ...styles.primaryButton, opacity: !name ? 0.5 : 1 }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--color-bg)',
    },
    card: {
        background: 'var(--color-white)',
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 25px var(--color-shadow)',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
    },
    logo: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'var(--color-primary)',
        margin: 0,
    },
    title: {
        fontSize: '1.5rem',
        color: 'var(--color-text)',
        margin: 0,
    },
    subtitle: {
        fontSize: '1.2rem',
        color: 'var(--color-text)',
        margin: '0 0 10px 0',
    },
    codeDisplay: {
        fontSize: '3rem',
        fontWeight: 'bold',
        letterSpacing: '5px',
        color: 'var(--color-secondary)',
        background: '#FFF5F7',
        padding: '10px 30px',
        borderRadius: 'var(--radius-md)',
    },
    input: {
        width: '100%',
        padding: '15px',
        fontSize: '1.1rem',
        borderRadius: 'var(--radius-md)',
        border: '2px solid #E2E8F0',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        width: '100%',
    },
    primaryButton: {
        flex: 1,
        padding: '15px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'white',
        background: 'var(--color-primary)',
        borderRadius: 'var(--radius-md)',
    },
    secondaryButton: {
        flex: 1,
        padding: '15px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        background: '#EBF8FF',
        borderRadius: 'var(--radius-md)',
    },
    playerList: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    playerTag: {
        padding: '10px',
        background: '#F7FAFC',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        fontWeight: '500',
    },
    waitingText: {
        color: '#718096',
        fontStyle: 'italic',
    },
    error: {
        color: '#E53E3E',
        background: '#FFF5F5',
        padding: '10px',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        textAlign: 'center',
    }
};

export default Lobby;
