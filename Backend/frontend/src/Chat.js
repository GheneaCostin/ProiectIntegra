import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getChatHistory, markMessagesAsRead } from './api/api';
import { connectWebSocket, sendMessageWS, sendReadWS, disconnectWebSocket } from './api/websocket';
import './Chat.css';

const Chat = () => {
    const { otherUserId } = useParams();
    const location = useLocation();


    const chatPartnerName = location.state?.otherUserName || "Pacient";

    const [currentUserId, setCurrentUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const messagesEndRef = useRef(null);


    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        setCurrentUserId(storedUserId);


        const markConversationAsRead = async () => {
            if (storedUserId && otherUserId) {
                console.log("Marking conversation as read...");


                try {
                    await markMessagesAsRead(otherUserId, storedUserId);
                } catch (e) {
                    console.error("Error marking as read HTTP:", e);
                }

                setTimeout(() => {
                    console.log("Sending WS Read Signal...");
                    sendReadWS(otherUserId, storedUserId);
                }, 1000);
            }
        };


        const fetchHistory = async () => {
            if (storedUserId && otherUserId) {
                try {
                    const history = await getChatHistory(storedUserId, otherUserId);
                    setMessages(history);


                    await markConversationAsRead();

                } catch (error) {
                    console.error("Failed to load history", error);
                }
            }
        };

        fetchHistory();


        connectWebSocket(

            (incomingMessage) => {
                setMessages((prevMessages) => {
                    const exists = prevMessages.some(m =>
                        (m.id && m.id === incomingMessage.id) ||
                        (m.text === incomingMessage.text && m.senderId === incomingMessage.senderId && Math.abs(new Date(m.timestamp) - new Date(incomingMessage.timestamp)) < 1000)
                    );
                    if (exists) return prevMessages;

                    const isRelevant =
                        (incomingMessage.senderId === storedUserId && incomingMessage.receiverId === otherUserId) ||
                        (incomingMessage.senderId === otherUserId && incomingMessage.receiverId === storedUserId);

                    if (isRelevant) {
                        if (incomingMessage.senderId === otherUserId) {
                            markConversationAsRead();
                        }
                        return [...prevMessages, incomingMessage];
                    }
                    return prevMessages;
                });
            },

            (readReceipt) => {

                if (readReceipt.senderId === storedUserId && readReceipt.receiverId === otherUserId) {
                    setMessages(prev => prev.map(msg =>
                        msg.senderId === storedUserId ? { ...msg, read: true } : msg
                    ));
                }
            }
        );

        return () => {
            disconnectWebSocket();
        };
    }, [otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUserId) return;

        const textToSend = newMessage.trim();
        const timestamp = new Date().toISOString();


        const tempMessage = {
            id: Math.random().toString(),
            senderId: currentUserId,
            receiverId: otherUserId,
            text: textToSend,
            timestamp: timestamp,
            read: false
        };

        setMessages(prev => [...prev, tempMessage]);

        const messagePayload = {
            senderId: currentUserId,
            receiverId: otherUserId,
            text: textToSend
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
                                <div className="message-meta">
                                    <span className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {isMyMessage && (
                                        <span className="read-status">
                                            {msg.read ? "✓✓" : "✓"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
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