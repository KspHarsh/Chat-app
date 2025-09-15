const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, '.')));

// Add a route to serve the index.html file for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store all active client connections
const clients = new Set();

wss.on('connection', ws => {
    console.log('Client connected');
    clients.add(ws);

    ws.on('message', message => {
        // Parse the incoming message as JSON
        try {
            const parsedMessage = JSON.parse(message);
            // Ensure the message has username and message properties
            if (parsedMessage.username && parsedMessage.message) {
                // Broadcast the message to all connected clients
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(parsedMessage));
                    }
                });
            }
        } catch (error) {
            console.error('Failed to parse message or invalid message format:', message.toString(), error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
