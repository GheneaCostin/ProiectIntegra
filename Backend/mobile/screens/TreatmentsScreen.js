import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Modal,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

import apiClient, { exportTreatmentsPdf } from '../api/api';
import { scheduleTreatmentNotifications } from '../utils/notificationHelper';


const btoa = (text) => {
    return Buffer.from(text, 'binary').toString('base64');
};

const TreatmentsScreen = () => {

    const [treatments, setTreatments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [treatmentsProgress, setTreatmentsProgress] = useState({});


    const [modalVisible, setModalVisible] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchTreatments();
        }, [])
    );

    const fetchTreatments = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            if (!userId) {
                setIsLoading(false);
                return;
            }

            const response = await apiClient.get(`/patient/treatments/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 204) {
                setTreatments([]);
            } else {
                setTreatments(response.data);
                fetchProgressForTreatments(response.data, token);

                if (scheduleTreatmentNotifications) {
                    scheduleTreatmentNotifications(response.data).catch(err => console.log(err));
                }
            }
        } catch (error) {
            console.error("Eroare fetch tratamente:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProgressForTreatments = async (treatmentList, token) => {
        const progressMap = {};
        await Promise.all(treatmentList.map(async (treatment) => {
            try {
                const res = await apiClient.get(`/patient/treatments/${treatment.id}/progress`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.data) progressMap[treatment.id] = res.data.progressPercentage;
            } catch (err) { progressMap[treatment.id] = 0; }
        }));
        setTreatmentsProgress(progressMap);
    };


    const handleExportPdf = async () => {
        try {
            const patientId = await AsyncStorage.getItem("userId");
            const token = await AsyncStorage.getItem('userToken');

            if (treatments.length === 0) {
                Alert.alert("Eroare", "Nu ai tratamente de exportat.");
                return;
            }

            setIsExporting(true);


            const exportDto = {
                patientId: patientId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                treatmentIds: treatments.map((t) => t.id),
            };

            const response = await exportTreatmentsPdf(exportDto, token);

            const base64 = btoa(
                new Uint8Array(response.data)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            const fileUri = FileSystem.documentDirectory + "prescriptions.pdf";


            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: 'base64',
            });

            setModalVisible(false);
            setIsExporting(false);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Succes", "PDF salvat (Sharing indisponibil).");
            }

        } catch (e) {
            console.error("Export PDF failed:", e);
            setIsExporting(false);
            Alert.alert("Eroare", "Export PDF eșuat. " + e.message);
        }
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartPicker(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndPicker(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return '#388e3c';
        if (percentage >= 40) return '#fbc02d';
        return '#d32f2f';
    };

    const renderTreatmentItem = ({ item }) => {
        const progress = treatmentsProgress[item.id] || 0;
        const color = getProgressColor(progress);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="pill" size={24} color="#007bff" />
                    </View>
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.medicationName}>{item.medicationName}</Text>
                        <Text style={styles.dosage}>{item.dosage}</Text>
                    </View>
                    <View style={styles.progressBadge}>
                        <Text style={[styles.progressText, { color: color }]}>
                            {Math.round(progress)}%
                        </Text>
                        <MaterialCommunityIcons name="chart-pie" size={16} color={color} />
                    </View>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
                </View>
                <View style={styles.divider} />
                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#666" style={styles.infoIcon} />
                        <Text style={styles.infoText}>{item.frequency} / zi</Text>
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
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Tratamentele Mele</Text>
            </View>

            {isLoading && treatments.length === 0 ? (
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
                />
            )}

            {/* --- FLOATING ACTION BUTTON (FAB) --- */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <MaterialCommunityIcons name="file-pdf-box" size={30} color="#fff" />
            </TouchableOpacity>

            {/* --- MODAL PENTRU EXPORT --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Exportă Prescripție PDF</Text>
                        <Text style={styles.modalSubtitle}>Selectează intervalul:</Text>

                        {/* START DATE */}
                        <Text style={styles.label}>Data Început:</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                            <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={onStartDateChange}
                            />
                        )}

                        {/* END DATE */}
                        <Text style={styles.label}>Data Sfârșit:</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                            <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={onEndDateChange}
                            />
                        )}

                        {/* ACTION BUTTONS */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.btnTextCancel}>Anulează</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.btnConfirm]}
                                onPress={handleExportPdf}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnTextConfirm}>Generează PDF</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: '#f5f5f5' },

    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },

    pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    listContainer: { padding: 20, paddingBottom: 80 },

    card: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, padding: 15, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

    iconContainer: { width: 45, height: 45, backgroundColor: '#e6f2ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },

    cardHeaderText: { flex: 1, justifyContent: 'center' },

    medicationName: { fontSize: 17, fontWeight: 'bold', color: '#333' },

    dosage: { fontSize: 14, color: '#666', marginTop: 2 },

    progressBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f9f9f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },

    progressText: { fontWeight: 'bold', fontSize: 14 },

    progressBarBg: { height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, marginTop: -5, marginBottom: 10, overflow: 'hidden' },

    progressBarFill: { height: '100%', borderRadius: 2 },

    divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },

    cardBody: { gap: 8 },

    infoRow: { flexDirection: 'row', alignItems: 'center' },

    infoIcon: { marginRight: 8 },

    infoText: { fontSize: 14, color: '#555' },

    notesContainer: { marginTop: 5, backgroundColor: '#f9f9f9', padding: 8, borderRadius: 8 },

    notesText: { fontSize: 13, color: '#777', fontStyle: 'italic' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },

    emptyText: { marginTop: 10, color: '#999', fontSize: 16 },


    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        width: 60,
        height: 60,
        backgroundColor: '#d32f2f',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        marginTop: 10,
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    btn: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnCancel: {
        backgroundColor: '#f0f0f0',
        marginRight: 10,
    },
    btnConfirm: {
        backgroundColor: '#007bff',
        marginLeft: 10,
    },
    btnTextCancel: {
        color: '#666',
        fontWeight: 'bold',
    },
    btnTextConfirm: {
        color: '#fff',
        fontWeight: 'bold',
    }
});

export default TreatmentsScreen;