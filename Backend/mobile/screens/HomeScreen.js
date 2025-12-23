import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/api';

const HomeScreen = ({ navigation }) => {
    const [treatments, setTreatments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        fetchUserDataAndTreatments();
    }, []);

    const fetchUserDataAndTreatments = async () => {
        setIsLoading(true);
        try {

            const token = await AsyncStorage.getItem('userToken');
            const email = await AsyncStorage.getItem('userEmail');


            let userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                console.log("ATENTIE: Nu s-a gasit userId in AsyncStorage. Se foloseste ID de test: 12345");
                userId = "12345";
            }

            setUserName(email ? email.split('@')[0] : 'Pacient');

            console.log(`[HomeScreen] Request catre: /patient/treatments/${userId}`);


            const response = await apiClient.get(`/patient/treatments/${userId}`, {

                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) {
                console.log("[HomeScreen] Status 204: Niciun tratament gasit.");
                setTreatments([]);
            } else {
                console.log(`[HomeScreen] Succes! S-au primit ${response.data.length} tratamente.`);
                setTreatments(response.data);
            }

        } catch (error) {
            console.error("[HomeScreen] Eroare fetch:", error);

            if (error.response) {

                const status = error.response.status;
                console.log(`[HomeScreen] Server Status: ${status}`);
                console.log(`[HomeScreen] Server Data:`, error.response.data);

                if (status === 404) {
                    Alert.alert("Eroare 404", "Endpoint-ul nu a fost găsit. Asigură-te că ai restartat serverul Backend după adăugarea PatientController.");
                } else if (status === 403 || status === 401) {
                    Alert.alert("Eroare Autentificare", "Sesiunea a expirat sau nu ai permisiuni.");
                } else {
                    Alert.alert("Eroare Server", `Cod: ${status}. Mesaj: ${JSON.stringify(error.response.data)}`);
                }
            } else if (error.request) {
                Alert.alert("Eroare Conexiune", "Nu s-a putut contacta serverul. Verifică IP-ul și dacă serverul Java rulează.");
            } else {
                Alert.alert("Eroare", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };


    const renderTreatmentItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    {/* Iconita ceruta: Pill */}
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
                <View>
                    <Text style={styles.greeting}>Bine ai venit,</Text>
                    <Text style={styles.username}>{userName}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Tratamente Curente</Text>


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
                    onRefresh={fetchUserDataAndTreatments}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    greeting: {
        fontSize: 14,
        color: '#666',
    },
    username: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
    },
    logoutButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 50,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // Stiluri Card Tratament
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        padding: 15,
        elevation: 3, // Android shadow
        shadowColor: "#000", // iOS shadow
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

export default HomeScreen;