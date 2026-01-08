import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Alert,
    TouchableOpacity,
    Modal,
    Platform
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/api';

import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';

LocaleConfig.locales['ro'] = {
    monthNames: ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'],
    monthNamesShort: ['Ian.','Feb.','Mar.','Apr.','Mai','Iun.','Iul.','Aug.','Sept.','Oct.','Nov.','Dec.'],
    dayNames: ['Duminică','Luni','Marți','Miercuri','Joi','Vineri','Sâmbătă'],
    dayNamesShort: ['Dum.','Lun.','Mar.','Mie.','Joi','Vin.','Sâm.'],
    today: "Azi"
};
LocaleConfig.defaultLocale = 'ro';

const CalendarScreen = () => {

    const today = new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(today);
    const [treatments, setTreatments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [currentTreatment, setCurrentTreatment] = useState(null);

    // --- 1. DEFINIREA FUNCȚIILOR ---

    const fetchTreatmentsForDate = async (date) => {
        setIsLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            if (!userId) return;

            const response = await apiClient.get(`/patient/treatments/${userId}/date/${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) {
                setTreatments([]);
            } else {
                setTreatments(response.data);
            }
        } catch (error) {
            console.log("Eroare fetch calendar:", error);
            setTreatments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDose = async () => {
        if (!currentTreatment) return;

        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            const datePart = new Date(selectedDate);
            const finalDate = new Date(selectedTime);
            finalDate.setFullYear(datePart.getFullYear(), datePart.getMonth(), datePart.getDate());

            const payload = {
                treatmentId: currentTreatment.id,
                patientId: userId,
                date: finalDate.toISOString(),
                doseIndex: (currentTreatment.treatmentIntakes?.length || 0) + 1
            };

            const response = await apiClient.post('/patient/treatment-intake', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            Alert.alert("Succes", "Doza a fost înregistrată!");
            setModalVisible(false);

            fetchTreatmentsForDate(selectedDate);

        } catch (error) {
            const msg = error.response?.data || "Eroare la înregistrarea dozei.";
            Alert.alert("Eroare", typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    // --- 2. USE EFFECT ---
    useEffect(() => {
        fetchTreatmentsForDate(selectedDate);
    }, [selectedDate]);


    // --- 3. RENDER FUNCTIONS ---
    const renderRightActions = (item) => {
        return (
            <TouchableOpacity
                style={styles.takeDoseButton}
                onPress={() => {
                    setCurrentTreatment(item);
                    setSelectedTime(new Date());
                    setModalVisible(true);
                }}
            >
                <Text style={styles.takeDoseText}>Take Dose</Text>
                <MaterialCommunityIcons name="pill" size={20} color="#fff" />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }) => {
        const takenToday = item.treatmentIntakes?.length || 0;

        // --- FIX: Folosim direct valoarea numerică ---
        // Deoarece în Treatment.java 'frequency' este int, nu mai folosim .match()
        const maxDoses = (typeof item.frequency === 'number') ? item.frequency : 1;

        const remaining = Math.max(maxDoses - takenToday, 0);

        return (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
                <View style={styles.card}>
                    <View style={styles.leftBorder} />
                    <View style={styles.cardContent}>
                        <View style={styles.headerContent}>
                            <Text style={styles.medicationName}>{item.medicationName}</Text>
                            <Text style={styles.dosage}>Dosage: {item.dosage}</Text>
                        </View>
                        <View style={styles.detailsContent}>
                            <Text style={styles.detailText}>Frequency: {item.frequency} / day</Text>
                            <Text style={[styles.detailText, { fontWeight: 'bold', color: remaining > 0 ? '#d32f2f' : '#388e3c' }]}>
                                Remaining today: {remaining}
                            </Text>
                        </View>
                    </View>
                </View>
            </Swipeable>
        );
    };

    // --- 4. RETURN JSX ---
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

                <View style={styles.calendarContainer}>
                    <Calendar
                        current={selectedDate}
                        onDayPress={day => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: {selected: true, disableTouchEvent: true, selectedColor: '#007AFF'}
                        }}
                        theme={{
                            todayTextColor: '#007AFF',
                            selectedDayBackgroundColor: '#007AFF',
                        }}
                    />
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.sectionTitle}>
                        Treatments {selectedDate ? `- ${selectedDate}` : ''}
                    </Text>

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />
                    ) : (
                        <FlatList
                            data={treatments}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>There are no treatments for this day</Text>
                                </View>
                            }
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </View>

                {/* MODAL PENTRU TIME PICKER */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Enter dose intake time</Text>

                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        if (date) setSelectedTime(date);
                                    }}
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.okButton]}
                                    onPress={handleConfirmDose}
                                >
                                    <Text style={styles.okButtonText}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 10,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 15,
    },
    // Stiluri Card
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    leftBorder: {
        width: 5,
        backgroundColor: '#007AFF',
    },
    cardContent: {
        flex: 1,
        padding: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    medicationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    dosage: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    detailsContent: {
        gap: 5,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    pickerContainer: {
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    okButton: {
        backgroundColor: '#007AFF',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
    },
    okButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    takeDoseButton: {
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
        marginBottom: 12,
        borderRadius: 10,
        marginLeft: 10,
    },
    takeDoseText: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 30,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});

export default CalendarScreen;