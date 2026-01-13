import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/api';

const EditUserInfoScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        height: '',
        weight: '',
        sex: '',
        extrainfo: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            const response = await apiClient.get(`/user/${userId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data) {
                let formattedDate = '';
                if (response.data.birthDate) {
                    formattedDate = String(response.data.birthDate).split('T')[0];
                }

                setFormData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    birthDate: formattedDate,
                    height: response.data.height ? String(response.data.height) : '',
                    weight: response.data.weight ? String(response.data.weight) : '',
                    sex: response.data.sex || '',
                    extrainfo: response.data.extrainfo || ''
                });
            }
        } catch (error) {
            console.error("Eroare fetch user details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthDate: formData.birthDate,
                height: parseInt(formData.height) || 0,
                weight: parseInt(formData.weight) || 0,
                sex: formData.sex,
                extrainfo: formData.extrainfo
            };

            await apiClient.put(`/user/${userId}/details`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            Alert.alert("Succes", "Informațiile au fost actualizate!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Eroare update user:", error);
            Alert.alert("Eroare", "Nu s-au putut salva modificările.");
        } finally {
            setSaving(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);

        if (event.type === "set" && selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            setFormData({ ...formData, birthDate: formattedDate });
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Prenume</Text>
                <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    placeholder="Introdu prenumele"
                    onChangeText={(text) => setFormData({...formData, firstName: text})}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Nume de familie</Text>
                <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    placeholder="Introdu numele"
                    onChangeText={(text) => setFormData({...formData, lastName: text})}
                />
            </View>

            {/* --- SELECȚIE DATA NAȘTERII CU DATEPICKER --- */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Data Nașterii</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={[styles.dateButtonText, !formData.birthDate && { color: '#999' }]}>
                        {formData.birthDate ? formData.birthDate : "Selectează data nașterii"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Sex</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.genderButton, formData.sex === 'Masculin' && styles.genderButtonSelected]}
                        onPress={() => setFormData({...formData, sex: 'Masculin'})}
                    >
                        <Text style={[styles.genderText, formData.sex === 'Masculin' && styles.genderTextSelected]}>Masculin</Text>
                    </TouchableOpacity>

                    <View style={{width: 10}} />

                    <TouchableOpacity
                        style={[styles.genderButton, formData.sex === 'Feminin' && styles.genderButtonSelected]}
                        onPress={() => setFormData({...formData, sex: 'Feminin'})}
                    >
                        <Text style={[styles.genderText, formData.sex === 'Feminin' && styles.genderTextSelected]}>Feminin</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Înălțime (cm)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.height}
                        placeholder="Ex: 175"
                        keyboardType="numeric"
                        onChangeText={(text) => setFormData({...formData, height: text})}
                    />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Greutate (kg)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.weight}
                        placeholder="Ex: 70"
                        keyboardType="numeric"
                        onChangeText={(text) => setFormData({...formData, weight: text})}
                    />
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Informații Suplimentare</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={formData.extrainfo}
                    placeholder="Alergii, istoric medical, etc."
                    multiline
                    numberOfLines={3}
                    onChangeText={(text) => setFormData({...formData, extrainfo: text})}
                />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Salvează Modificările</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    formGroup: {
        marginBottom: 15
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontWeight: '600'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },

    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        height: 50,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#000',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    genderButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    genderButtonSelected: {
        backgroundColor: '#e3f2fd',
        borderColor: '#007AFF'
    },
    genderText: {
        fontSize: 16,
        color: '#666'
    },
    genderTextSelected: {
        color: '#007AFF',
        fontWeight: 'bold'
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default EditUserInfoScreen;