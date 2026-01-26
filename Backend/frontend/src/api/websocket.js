import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
export const connectWebSocket = (onMessageReceived, onReadReceived) => {

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


            stompClient.subscribe('/topic/read', (message) => {
                if (message.body && onReadReceived) {
                    console.log("Read Receipt received on Web:", message.body);
                    onReadReceived(JSON.parse(message.body));
                }
            });
        },
        onStompError: (frame) => {
            console.error('Broker error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
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


export const sendReadWS = (senderId, receiverId) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/read',
            body: JSON.stringify({ senderId, receiverId })
        });
    }
};


export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
    }
};