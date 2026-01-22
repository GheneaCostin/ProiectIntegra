import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getChatHistory } from '../api/api';
import { connectWebSocket, sendMessageWS, disconnectWebSocket } from '../api/websocket';

const ChatScreen = ({ route, navigation }) => {

    const { otherUserId, otherUserName } = route.params || {};
    const chatPartnerId = otherUserId || "691ac9c079847f29541fac57";
    const chatPartnerName = otherUserName || "Doctor";

    const [currentUserId, setCurrentUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);

    const flatListRef = useRef();

    useEffect(() => {
        if (chatPartnerName) {
            navigation.setOptions({ title: chatPartnerName });
        }
    }, [chatPartnerName, navigation]);

    useEffect(() => {
        setupChat();
        return () => {
            disconnectWebSocket();
        };
    }, []);

    const setupChat = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');
            setCurrentUserId(userId);

            if (userId && chatPartnerId) {
                console.log(`Loading chat: ${userId} <-> ${chatPartnerId}`);
                const history = await getChatHistory(userId, chatPartnerId, token);
                setMessages(history);
            }

            connectWebSocket((incomingMessage) => {
                setMessages((prevMessages) => {
                    const isRelevant =
                        (incomingMessage.senderId === userId && incomingMessage.receiverId === chatPartnerId) ||
                        (incomingMessage.senderId === chatPartnerId && incomingMessage.receiverId === userId);

                    if (isRelevant) {
                        return [...prevMessages, incomingMessage];
                    }
                    return prevMessages;
                });

                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            });

        } catch (error) {
            console.error("Setup chat error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (!inputText.trim() || !currentUserId) return;

        const messagePayload = {
            senderId: currentUserId,
            receiverId: chatPartnerId,
            text: inputText.trim()
        };

        sendMessageWS(messagePayload);
        setInputText("");
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId === currentUserId;

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={{ alignItems: isMyMessage ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                    {/* Afișăm numele deasupra mesajului (opțional, dacă vrei ca pe web) */}
                    <Text style={styles.senderNameText}>
                        {isMyMessage ? "Eu" : chatPartnerName}
                    </Text>

                    <View style={[
                        styles.messageBubble,
                        isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
                    ]}>
                        <Text style={[
                            styles.messageText,
                            isMyMessage ? styles.myMessageText : styles.otherMessageText
                        ]}>
                            {item.text}
                        </Text>
                        <Text style={[
                            styles.timeText,
                            isMyMessage ? styles.myTimeText : styles.otherTimeText
                        ]}>
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Scrie un mesaj..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                    <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 15,
        paddingBottom: 20,
    },
    messageContainer: {
        marginVertical: 5,
        flexDirection: 'row',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    senderNameText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
        marginLeft: 4,
        marginRight: 4,
        fontWeight: '600',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
        width: '100%',
    },
    myMessageBubble: {
        backgroundColor: '#007bff',
        borderBottomRightRadius: 2,
    },
    otherMessageBubble: {
        backgroundColor: '#e5e5ea',
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: 'white',
    },
    otherMessageText: {
        color: 'black',
    },
    timeText: {
        fontSize: 10,
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTimeText: {
        color: '#888',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#007bff',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;