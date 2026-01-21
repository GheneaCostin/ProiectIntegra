import { Client } from '@stomp/stompjs';

let stompClient = null;


const SERVER_IP = '192.168.1.100';
const SERVER_PORT = '8080';

export const connectWebSocket = (onMessageReceived) => {
    const socketUrl = `ws://${SERVER_IP}:${SERVER_PORT}/chat/websocket`;

    stompClient = new Client({
        brokerURL: socketUrl,
        reconnectDelay: 5000,
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,

        onConnect: () => {
            console.log("WebSocket Mobile Connected");

            stompClient.subscribe('/topic/messages', (message) => {
                if (message.body) {
                    onMessageReceived(JSON.parse(message.body));
                }
            });
        },
        onStompError: (frame) => {
            console.error('Broker error: ' + frame.headers['message']);
            console.error('Details: ' + frame.body);
        },
    });

    stompClient.activate();
};

export const sendMessageWS = (message) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/send',
            body: JSON.stringify(message)
        });
    } else {
        console.error("WebSocket is not connected.");
    }
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
    }
};