import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            // Navigăm către ecranul de Login (resetând stack-ul pentru a nu putea da back)
            // Notă: Asumăm că Login este în stack-ul părinte
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error("Eroare la delogare:", error);
        }
    };

    const SettingItem = ({ title, icon, onPress, color = '#333' }) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
                </View>
                <Text style={[styles.itemText, { color }]}>{title}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Contul Meu</Text>

            <View style={styles.section}>
                <SettingItem
                    title="Editare Informații Personale"
                    icon="account-edit"
                    onPress={() => navigation.navigate('EditUserInfoScreen')}
                />
                <SettingItem
                    title="Schimbare Parolă"
                    icon="lock-reset"
                    onPress={() => navigation.navigate('ChangePasswordScreen')}
                />
            </View>

            <Text style={styles.headerTitle}>Aplicație</Text>
            <View style={styles.section}>
                <TouchableOpacity style={styles.item} onPress={handleLogout}>
                    <View style={styles.itemLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
                            <MaterialCommunityIcons name="logout" size={24} color="#d32f2f" />
                        </View>
                        <Text style={[styles.itemText, { color: '#d32f2f' }]}>Deconectare</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 2, // Umbră Android
        shadowColor: "#000", // Umbră iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SettingsScreen;