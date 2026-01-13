import React from 'react';
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

export default function App() {
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