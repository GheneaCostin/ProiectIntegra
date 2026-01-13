import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import LoginScreen from './screens/LoginScreen';
import RegisterScreen from "./screens/RegisterScreen";
import TabNavigator from './navigation/TabNavigator';
import EditUserInfoScreen from './screens/EditUserInfoScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

import { enableScreens } from 'react-native-screens';

enableScreens();

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});



export default function App() {


    useEffect(() => {
        (async () => {

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }


            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;


            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('Atenție', 'Nu vom putea trimite notificări pentru tratamente fără permisiune!');
                return;
            }
        })();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">

                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />

                <Stack.Screen
                    name="Main"
                    component={TabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EditUserInfoScreen"
                    component={EditUserInfoScreen}
                    options={{ title: 'Editare Profil', headerShown: true }}
                />

                <Stack.Screen
                    name="ChangePasswordScreen"
                    component={ChangePasswordScreen}
                    options={{ title: 'Schimbare Parolă', headerShown: true }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}