import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/api';

const TreatmentsScreen = () => {
    const [treatments, setTreatments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTreatments();
    }, []);

    const fetchTreatments = async () => {
        setIsLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            if (!userId) {
                // Fallback sau eroare dacă nu există ID
                setIsLoading(false);
                return;
            }

            // Folosim apiClient
            const response = await apiClient.get(`/patient/treatments/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) {
                setTreatments([]);
            } else {
                setTreatments(response.data);
            }

        } catch (error) {
            console.error("Eroare fetch tratamente:", error);
            // Poți afișa un mesaj discret sau doar în consolă pentru a nu bloca UI-ul la fiecare tab change
        } finally {
            setIsLoading(false);
        }
    };

    const renderTreatmentItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="pill" size={24} color="#007bff" />
                </View>
                <View style={styles.cardHeaderText}>
                    <Text style={styles.medicationName}>{item.medicationName}</Text>
                    <Text style={styles.dosage}>{item.dosage}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Activ</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color="#666" style={styles.infoIcon} />
                    <Text style={styles.infoText}>{item.frequency}</Text>
                </View>

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="calendar-range" size={18} color="#666" style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} -
                        {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Nedeterminat'}
                    </Text>
                </View>

                {item.notes && (
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesText}>Note: {item.notes}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            <View style={styles.header}>
                <Text style={styles.pageTitle}>Tratamentele Mele</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            ) : (
                <FlatList
                    data={treatments}
                    renderItem={renderTreatmentItem}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="medical-bag" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>Nu ai tratamente active.</Text>
                        </View>
                    }
                    refreshing={isLoading}
                    onRefresh={fetchTreatments}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    iconContainer: {
        width: 45,
        height: 45,
        backgroundColor: '#e6f2ff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardHeaderText: {
        flex: 1,
        justifyContent: 'center',
    },
    medicationName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    dosage: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        color: '#2e7d32',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 10,
    },
    cardBody: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
    },
    notesContainer: {
        marginTop: 5,
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 8,
    },
    notesText: {
        fontSize: 13,
        color: '#777',
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16,
    }
});

export default TreatmentsScreen;