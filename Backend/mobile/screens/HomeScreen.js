import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const getUserData = async () => {
            try {
                const email = await AsyncStorage.getItem('userEmail');
                if (email) {
                    setUserEmail(email);
                }
            } catch (error) {
                console.error('Eroare la citirea email-ului:', error);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Ionicons name="medical" size={60} color="#007AFF" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Bine ai venit!</Text>
            <Text style={styles.subtitle}>Ești autentificat ca:</Text>
            <Text style={styles.emailText}>{userEmail || 'Utilizator necunoscut'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    emailText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#007AFF',
        marginTop: 5,
    },
});