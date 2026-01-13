import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/api';

const ChangePasswordScreen = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        // Validări Frontend
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Eroare", "Toate câmpurile sunt obligatorii.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Eroare", "Noua parolă și confirmarea nu coincid.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Eroare", "Parola nouă trebuie să aibă cel puțin 6 caractere.");
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('userToken');

            const payload = {
                userId: userId,
                oldPassword: oldPassword,
                newPassword: newPassword
            };

            // Apel către Backend
            await apiClient.post('/user/change-password', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            Alert.alert("Succes", "Parola a fost schimbată cu succes!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Eroare schimbare parolă:", error);

            // Extragem mesajul de eroare de la backend (ex: "Parola curentă este incorectă")
            const msg = error.response?.data || "Nu s-a putut schimba parola. Verifică conexiunea.";
            Alert.alert("Eroare", typeof msg === 'string' ? msg : "A apărut o eroare necunoscută.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <Text style={styles.infoText}>
                        Introdu parola curentă pentru a confirma identitatea, apoi alege o parolă nouă.
                    </Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Parola Curentă</Text>
                        <TextInput
                            style={styles.input}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            secureTextEntry
                            placeholder="******"
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Parola Nouă</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="******"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Confirmă Parola Nouă</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="******"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Schimbă Parola</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    content: {
        padding: 20,
    },
    infoText: {
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#d32f2f', // Roșu pentru acțiuni sensibile
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ChangePasswordScreen;