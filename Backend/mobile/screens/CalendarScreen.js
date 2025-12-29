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
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/api';


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

    useEffect(() => {
        fetchTreatmentsForDate(selectedDate);
    }, [selectedDate]);

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

    const renderTreatmentItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.leftBorder} />
            <View style={styles.cardContent}>
                <View style={styles.headerContent}>
                    <Text style={styles.medicationName}>{item.medicationName}</Text>
                    <Text style={styles.dosage}>{item.dosage}</Text>
                </View>
                <View style={styles.detailsContent}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.frequency}</Text>
                    </View>
                    {item.notes && (
                        <Text style={styles.notesText}>{item.notes}</Text>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            <View style={styles.calendarContainer}>
                <Calendar
                    current={selectedDate}
                    onDayPress={day => {
                        setSelectedDate(day.dateString);
                    }}
                    markedDates={{
                        [selectedDate]: {selected: true, disableTouchEvent: true, selectedColor: '#007AFF'}
                    }}
                    theme={{
                        todayTextColor: '#007AFF',
                        arrowColor: '#007AFF',
                        selectedDayBackgroundColor: '#007AFF',
                        textDayFontWeight: '500',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '500',
                    }}
                />
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                    Tratamente pe {selectedDate}
                </Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />
                ) : (
                    <FlatList
                        data={treatments}
                        renderItem={renderTreatmentItem}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Niciun tratament programat.</Text>
                            </View>
                        }
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </SafeAreaView>
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
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
    },
    notesText: {
        fontSize: 13,
        color: '#777',
        fontStyle: 'italic',
        marginTop: 4,
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