import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getUserConversations, getDoctorsList } from '../api/api';

const MessagesScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(false);


    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [])
    );

    const fetchConversations = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            if (userId) {
                const data = await getUserConversations(userId, token);
                if (Array.isArray(data)) {
                    setConversations(data);
                }
            }
        } catch (error) {
            console.error("Eroare la încărcarea conversațiilor:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };


    const openNewChatModal = async () => {
        setModalVisible(true);
        setLoadingDoctors(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const docs = await getDoctorsList(token);
            setDoctors(docs);
        } catch (error) {
            Alert.alert("Eroare", "Nu s-a putut încărca lista de medici.");
        } finally {
            setLoadingDoctors(false);
        }
    };

    const handleSelectDoctor = (doctor) => {
        setModalVisible(false);
        navigation.navigate('ChatDetail', {
            otherUserId: doctor.id,
            otherUserName: doctor.fullName
        });
    };

    const handleOpenChat = (item) => {
        navigation.navigate('ChatDetail', {
            otherUserId: item.conversationUserId,
            otherUserName: item.fullName
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleOpenChat(item)}
        >
            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={50} color="#ccc" />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.userName}>{item.fullName}</Text>
                    <Text style={styles.timeText}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </Text>
                </View>
                <Text
                    style={[styles.lastMessage, !item.read ? styles.unreadMessage : null]}
                    numberOfLines={1}
                >
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );


    const renderDoctorItem = ({ item }) => (
        <TouchableOpacity
            style={styles.doctorItem}
            onPress={() => handleSelectDoctor(item)}
        >
            <View style={styles.doctorAvatar}>
                <Ionicons name="medkit" size={24} color="#fff" />
            </View>
            <View>
                <Text style={styles.doctorName}>{item.fullName}</Text>
                <Text style={styles.doctorSpec}>{item.specialization}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>Nu ai nicio conversație încă.</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.conversationUserId}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}

            {/* --- BUTON PLUTITOR (+) --- */}
            <TouchableOpacity
                style={styles.fab}
                onPress={openNewChatModal}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* --- MODAL SELECTARE DOCTOR --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Alege un Medic</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {loadingDoctors ? (
                            <ActivityIndicator size="small" color="#007bff" style={{margin: 20}}/>
                        ) : (
                            <FlatList
                                data={doctors}
                                renderItem={renderDoctorItem}
                                keyExtractor={(item) => item.id}
                                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 10}}>Nu s-au găsit medici.</Text>}
                                style={{maxHeight: 300}}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 10,
        paddingBottom: 80,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    unreadMessage: {
        color: '#000',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        width: 60,
        height: 60,
        backgroundColor: '#007bff',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 999,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    doctorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    doctorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#28a745',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    doctorSpec: {
        fontSize: 12,
        color: '#666',
    }
});

export default MessagesScreen;