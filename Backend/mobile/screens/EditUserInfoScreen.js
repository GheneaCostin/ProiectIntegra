import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/api';

const EditUserInfoScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            // Apel către endpoint-ul creat în UserController
            const response = await apiClient.get(`/user/${userId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Populăm formularul cu datele existente
            if (response.data) {
                setFormData({
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    // Convertim numerele în string pentru TextInput
                    height: response.data.height ? String(response.data.height) : '',
                    weight: response.data.weight ? String(response.data.weight) : ''
                });
            }
        } catch (error) {
            console.error("Eroare fetch user details:", error);
            // Nu blocăm utilizatorul, poate vrea să completeze date noi
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            // Pregătim payload-ul (convertim înapoi în numere)
            const payload = {
                ...formData,
                height: parseFloat(formData.height) || 0,
                weight: parseFloat(formData.weight) || 0
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
                <Text style={styles.label}>Telefon</Text>
                <TextInput
                    style={styles.input}
                    value={formData.phone}
                    placeholder="Ex: 0712345678"
                    keyboardType="phone-pad"
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Adresă</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={formData.address}
                    placeholder="Introdu adresa completă"
                    multiline
                    numberOfLines={3}
                    onChangeText={(text) => setFormData({...formData, address: text})}
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
    row: {
        flexDirection: 'row'
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default EditUserInfoScreen;