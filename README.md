# Digital Ito

A real-time multiplayer mobile web game where players must work together to arrange their secret numbers in ascending order without speaking.

## How to Play

1.  **Host**: Create a room on your device.
2.  **Join**: Friends join the room using the 4-character code.
3.  **Start**: The host starts the game.
4.  **Play**:
    *   Each player receives a secret number (1-100).
    *   **The Screen is Your Card**: Hold your phone up!
    *   **Flip**: Tap "Flip Card" to show your player color/name to others.
    *   **Reveal**: Tap "Reveal Number" to check your secret number.
    *   **Goal**: Physically arrange yourselves in ascending order of your numbers.

## Development

### Prerequisites
- Node.js

### Local Setup
1.  **Install Dependencies**:
    ```bash
    cd client && npm install
    cd ../server && npm install
    ```

2.  **Run Locally**:
    ```bash
    # Terminal 1: Client
    cd client && npm run dev

    # Terminal 2: Server
    cd server && npm run dev
    ```

## Deployment (Render.com)

This project is configured for easy deployment on Render.

1.  **Push to GitHub**: Push this repository to your GitHub account.
2.  **Create Web Service**:
    *   **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
    *   **Start Command**: `node server/server.js`
    *   **Environment Variables**:
        *   `NODE_ENV`: `production`
