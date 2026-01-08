import React, { useState, useEffect, useMemo } from 'react';
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

    // Helper pentru a număra dozele din data selectată
    const countIntakesForDate = (intakes, dateString) => {
        if (!intakes || !Array.isArray(intakes)) {
            return 0;
        }

        return intakes.filter(intake => {
            if (!intake.date) return false;
            // intake.date vine ca ISO string
            const intakeDate = new Date(intake.date).toISOString().split('T')[0];
            return intakeDate === dateString;
        }).length;
    };

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

            const isoDate = finalDate.toISOString();

            const payload = {
                treatmentId: currentTreatment.id,
                patientId: userId,
                date: isoDate,
                doseIndex: (currentTreatment.treatmentIntakes?.length || 0) + 1
            };

            await apiClient.post('/patient/treatment-intake', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            Alert.alert("Succes", "Doza a fost înregistrată!");
            setModalVisible(false);

            fetchTreatmentsForDate(selectedDate);

        } catch (error) {
            console.error("Eroare la mark dose:", error);
            const msg = error.response?.data || "Eroare la înregistrarea dozei.";
            Alert.alert("Eroare", typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    // --- 2. LOGICĂ PROGRES ZILNIC ---
    const dailyProgress = useMemo(() => {
        if (!treatments || treatments.length === 0) {
            return { percentage: 0, color: '#e0e0e0', taken: 0, total: 0 };
        }

        let totalPlanned = 0;
        let totalTaken = 0;

        treatments.forEach(t => {
            const freq = (typeof t.frequency === 'number') ? t.frequency : 1;
            const taken = countIntakesForDate(t.treatmentIntakes, selectedDate);

            totalPlanned += freq;
            totalTaken += taken;
        });

        if (totalPlanned === 0) return { percentage: 0, color: '#e0e0e0', taken: 0, total: 0 };

        const percentage = Math.min((totalTaken / totalPlanned) * 100, 100);

        let color = '#d32f2f'; // Roșu (< 40%)
        if (percentage >= 80) {
            color = '#388e3c'; // Verde
        } else if (percentage >= 40) {
            color = '#fbc02d'; // Galben
        }

        return { percentage, color, taken: totalTaken, total: totalPlanned };

    }, [treatments, selectedDate]);


    // --- 3. USE EFFECT ---
    useEffect(() => {
        fetchTreatmentsForDate(selectedDate);
    }, [selectedDate]);


    // --- 4. RENDER FUNCTIONS ---
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
        const takenToday = countIntakesForDate(item.treatmentIntakes, selectedDate);
        const maxDoses = (typeof item.frequency === 'number') ? item.frequency : 1;
        const remaining = Math.max(maxDoses - takenToday, 0);

        return (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
                <View style={styles.card}>
                    <View style={[styles.leftBorder, { backgroundColor: remaining === 0 ? '#388e3c' : '#007AFF' }]} />
                    <View style={styles.cardContent}>
                        <View style={styles.headerContent}>
                            <Text style={styles.medicationName}>{item.medicationName}</Text>
                            <Text style={styles.dosage}>Dozaj: {item.dosage}</Text>
                        </View>
                        <View style={styles.detailsContent}>
                            <Text style={styles.detailText}>Frecvență: {item.frequency} / zi</Text>
                            <Text style={[styles.detailText, { fontWeight: 'bold', color: remaining > 0 ? '#d32f2f' : '#388e3c' }]}>
                                Rămase azi: {remaining}
                            </Text>
                        </View>
                    </View>
                </View>
            </Swipeable>
        );
    };

    // --- 5. RETURN JSX ---
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

                {/* SECȚIUNE PROGRES ZILNIC */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.progressLabel}>Progresul Zilei</Text>
                        <Text style={styles.progressValue}>
                            {dailyProgress.taken}/{dailyProgress.total} doze ({Math.round(dailyProgress.percentage)}%)
                        </Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${dailyProgress.percentage}%`,
                                    backgroundColor: dailyProgress.color
                                }
                            ]}
                        />
                    </View>
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
                                    <Text style={styles.emptyText}>Nu există tratamente pentru această zi.</Text>
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
                            <Text style={styles.modalTitle}>Ora administrării</Text>

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
                                    <Text style={styles.cancelButtonText}>Anulează</Text>
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
        marginBottom: 5,
    },
    progressContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 10,
        elevation: 2,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontWeight: 'bold',
        color: '#555',
    },
    progressValue: {
        color: '#333',
        fontWeight: 'bold',
    },
    progressBarBackground: {
        height: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
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