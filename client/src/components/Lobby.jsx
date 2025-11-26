import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Lobby = () => {
    const { roomCode, players, isHost, joinRoom, startGame, error, prompt, generatePrompt } = useGame();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [showRules, setShowRules] = useState(false);
    const [aiMode, setAiMode] = useState('SAFE'); // SAFE or NSFW

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

                    {/* AI Prompt Section */}
                    <div style={styles.aiSection}>
                        {prompt ? (
                            <div style={styles.promptBox}>
                                <span style={styles.promptLabel}>Topic:</span>
                                <p style={styles.promptText}>{prompt}</p>
                            </div>
                        ) : (
                            <p style={styles.waitingText}>No topic selected yet...</p>
                        )}

                        {isHost && (
                            <div style={styles.hostAiControls}>
                                <div style={styles.modeToggle}>
                                    <button
                                        onClick={() => setAiMode('SAFE')}
                                        style={aiMode === 'SAFE' ? styles.modeBtnActive : styles.modeBtn}
                                    >
                                        😇 Safe
                                    </button>
                                    <button
                                        onClick={() => setAiMode('NSFW')}
                                        style={aiMode === 'NSFW' ? styles.modeBtnActive : styles.modeBtn}
                                    >
                                        😈 NSFW
                                    </button>
                                </div>
                                <button
                                    onClick={() => generatePrompt(aiMode)}
                                    style={styles.generateButton}
                                >
                                    ✨ Generate Topic
                                </button>
                            </div>
                        )}
                    </div>

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

                <button
                    onClick={() => setShowRules(true)}
                    style={styles.linkButton}
                >
                    How to Play ❓
                </button>
            </div>

            {showRules && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <h2 style={styles.modalTitle}>How to Play</h2>
                        <ol style={styles.rulesList}>
                            <li>Join a room with friends. 📱</li>
                            <li>Get a secret number (1-100). 🤫</li>
                            <li>Arrange your phones in ascending order. 📈</li>
                            <li><strong>No talking about numbers!</strong> 🤐</li>
                            <li>Once you've locked in your order, flip cards to reveal if you were right! 🔄</li>
                        </ol>
                        <button
                            onClick={() => setShowRules(false)}
                            style={styles.primaryButton}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
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
    linkButton: {
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        textDecoration: 'underline',
        marginTop: '10px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
    },
    modalCard: {
        background: 'white',
        padding: '30px',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    modalTitle: {
        marginTop: 0,
        color: 'var(--color-primary)',
        textAlign: 'center',
    },
    rulesList: {
        textAlign: 'left',
        lineHeight: '1.6',
        marginBottom: '20px',
        paddingLeft: '20px',
        color: 'var(--color-text)',
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
    },
    aiSection: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '15px',
        background: '#F0F4F8',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #E1E8ED',
    },
    promptBox: {
        textAlign: 'center',
    },
    promptLabel: {
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#718096',
        textTransform: 'uppercase',
    },
    promptText: {
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: 'var(--color-text)',
        margin: '5px 0 0 0',
    },
    hostAiControls: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '10px',
    },
    modeToggle: {
        display: 'flex',
        gap: '5px',
    },
    modeBtn: {
        flex: 1,
        padding: '8px',
        fontSize: '0.9rem',
        border: '1px solid #CBD5E0',
        background: 'white',
        color: '#718096',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
    },
    modeBtnActive: {
        flex: 1,
        padding: '8px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        border: '1px solid var(--color-primary)',
        background: 'var(--color-primary)',
        color: 'white',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
    },
    generateButton: {
        padding: '10px',
        fontSize: '1rem',
        fontWeight: 'bold',
        color: 'white',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
    }
};

export default Lobby;
