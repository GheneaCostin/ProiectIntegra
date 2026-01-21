import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getChatHistory } from './api/api';
import { connectWebSocket, sendMessageWS, disconnectWebSocket } from './api/websocket';
import './Chat.css';

const Chat = () => {
    const { otherUserId } = useParams();
    const location = useLocation();

    const chatPartnerName = location.state?.otherUserName || "Utilizator";

    const [currentUserId, setCurrentUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        setCurrentUserId(storedUserId);

        connectWebSocket((incomingMessage) => {
            setMessages((prevMessages) => {
                const isRelevant =
                    (incomingMessage.senderId === storedUserId && incomingMessage.receiverId === otherUserId) ||
                    (incomingMessage.senderId === otherUserId && incomingMessage.receiverId === storedUserId);

                if (isRelevant) {
                    return [...prevMessages, incomingMessage];
                }
                return prevMessages;
            });
        });

        return () => {
            disconnectWebSocket();
        };
    }, [otherUserId]);

    useEffect(() => {
        const fetchHistory = async () => {
            const storedUserId = localStorage.getItem("userId");
            if (storedUserId && otherUserId) {
                try {
                    const history = await getChatHistory(storedUserId, otherUserId);
                    setMessages(history);
                } catch (error) {
                    console.error("Failed to load history", error);
                }
            }
        };
        fetchHistory();
    }, [otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUserId) return;

        const messagePayload = {
            senderId: currentUserId,
            receiverId: otherUserId,
            text: newMessage
        };

        sendMessageWS(messagePayload);
        setNewMessage("");
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Conversație cu: {chatPartnerName}</h3>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUserId;

                    const displayName = isMyMessage ? "Eu" : chatPartnerName;

                    return (
                        <div
                            key={index}

                            className={`message-wrapper ${isMyMessage ? 'my-wrapper' : 'other-wrapper'}`}
                        >

                            <span className="sender-name">{displayName}</span>

                            <div className={`message-bubble ${isMyMessage ? 'my-message' : 'other-message'}`}>
                                <div className="message-content">{msg.text}</div>
                                <div className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Scrie un mesaj..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Trimite</button>
            </div>
        </div>
    );
};

export default Chat;