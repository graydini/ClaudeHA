const WebSocket = require('ws');

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const configPath = path.resolve(__dirname, '../credentals.ini');
let config;

try {
    config = Object.fromEntries(
        fs.readFileSync(configPath, 'utf-8')
            .split('\n')
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.split('='))
    );
} catch (error) {
    console.error('Failed to parse configuration file:', error);
    process.exit(1);
}

const HA_WS_URL = `ws://${config.HomeAssistantURL}/api/websocket`;
const ACCESS_TOKEN = config.AccessToken;

test('WebSocket authentication with Home Assistant', async ({}) => {
    const ws = new WebSocket(HA_WS_URL);

    ws.on('open', () => {
        console.log('WebSocket connected');
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('Received message:', message);

        if (message.type === 'auth_required') {
            console.log('Sending authentication message');
            ws.send(JSON.stringify({
                type: 'auth',
                access_token: ACCESS_TOKEN
            }));
        } else if (message.type === 'auth_ok') {
            console.log('Authentication successful');
            ws.close();
        } else if (message.type === 'auth_invalid') {
            console.error('Authentication failed:', message.message);
            ws.close();
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket closed');
    });

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for the test to complete
});