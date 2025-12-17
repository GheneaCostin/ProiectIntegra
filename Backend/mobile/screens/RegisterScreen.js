import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../api/api';

const RegisterScreen = ({ navigation }) => {

    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        sex: '',
        height: '',
        weight: '',
        age: '',
    });

    const [isPasswordHidden, setIsPasswordHidden] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const updateForm = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleRegister = async () => {

        if (!form.email || !form.password || !form.firstName || !form.lastName) {
            Alert.alert('Eroare', 'Te rog completeaza toate campurile obligatorii.');
            return;
        }

        setIsLoading(true);

        try {

            const payload = {
                ...form,
                age: parseInt(form.age) || 0,
                height: parseInt(form.height) || 0,
                weight: parseInt(form.weight) || 0,
                role: "patient"
            };

            const response = await register(payload);

            console.log('Register success:', response);

            Alert.alert('Succes', 'Cont creat cu succes!.', [
                {
                    text: 'OK',
                    onPress: () => navigation.replace('Login')
                }
            ]);

        } catch (error) {
            const errorMessage = error.response?.data || 'Eroare la inregistrare.';
            Alert.alert('Eroare', typeof errorMessage === 'string' ? errorMessage : 'Ceva nu a mers bine.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Creeaza Cont</Text>
                    <Text style={styles.subtitle}>Completeaza datele tale medicale</Text>


                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#999"
                            value={form.email}
                            onChangeText={(val) => updateForm('email', val)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>


                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Parola"
                            placeholderTextColor="#999"
                            value={form.password}
                            onChangeText={(val) => updateForm('password', val)}
                            secureTextEntry={isPasswordHidden}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordHidden(!isPasswordHidden)}>
                            <Ionicons
                                name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>


                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Prenume"
                                placeholderTextColor="#999"
                                value={form.firstName}
                                onChangeText={(val) => updateForm('firstName', val)}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nume"
                                placeholderTextColor="#999"
                                value={form.lastName}
                                onChangeText={(val) => updateForm('lastName', val)}
                            />
                        </View>
                    </View>


                    <View style={styles.genderContainer}>
                        <Text style={styles.label}>Gen:</Text>
                        <View style={styles.genderButtons}>
                            <TouchableOpacity
                                style={[styles.genderBtn, form.sex === 'Male' && styles.genderBtnActive]}
                                onPress={() => updateForm('sex', 'Male')}
                            >
                                <Text style={[styles.genderText, form.sex === 'Male' && styles.genderTextActive]}>Masculin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderBtn, form.sex === 'Female' && styles.genderBtnActive]}
                                onPress={() => updateForm('sex', 'Female')}
                            >
                                <Text style={[styles.genderText, form.sex === 'Female' && styles.genderTextActive]}>Feminin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 5 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Varsta"
                                placeholderTextColor="#999"
                                value={form.age}
                                onChangeText={(val) => updateForm('age', val)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 5 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Inaltime"
                                placeholderTextColor="#999"
                                value={form.height}
                                onChangeText={(val) => updateForm('height', val)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder=" Greutate"
                                placeholderTextColor="#999"
                                value={form.weight}
                                onChangeText={(val) => updateForm('weight', val)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>CREEAZA CONT</Text>
                        )}
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>
                            Ai deja cont? <Text style={styles.loginTextBold}>Autentifica-te</Text>
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 12,
        height: 48,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        height: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    genderContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600'
    },
    genderButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10
    },
    genderBtn: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    genderBtnActive: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    genderText: {
        color: '#666',
        fontWeight: '600'
    },
    genderTextActive: {
        color: '#fff'
    },
    registerButton: {
        backgroundColor: '#28a745',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#28a745",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginTextBold: {
        color: '#007bff',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;