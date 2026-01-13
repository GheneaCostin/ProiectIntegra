
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importăm ecranele (pe care le vom crea imediat)
import SettingsScreen from '../screens/SettingsScreen';
import EditUserInfoScreen from '../screens/EditUserInfoScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
    return (
        <Stack.Navigator initialRouteName="SettingsMain">
            <Stack.Screen
                name="SettingsMain"
                component={SettingsScreen}
                options={{ title: 'Setări', headerShown: true }}
            />
            <Stack.Screen
                name="EditUserInfo"
                component={EditUserInfoScreen}
                options={{ title: 'Editare Profil' }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ title: 'Schimbare Parolă' }}
            />
        </Stack.Navigator>
    );
}