import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectWebSocket = (onMessageReceived) => {

    const socketUrl = 'http://localhost:8080/chat';

    stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        reconnectDelay: 5000,
        onConnect: () => {
            console.log("WebSocket Connected");
            stompClient.subscribe('/topic/messages', (message) => {
                if (message.body) {
                    onMessageReceived(JSON.parse(message.body));
                }
            });
        },
        onStompError: (frame) => {
            console.error('Broker error: ' + frame.headers['message']);
        }
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