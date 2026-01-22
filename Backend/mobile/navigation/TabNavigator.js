import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TreatmentsScreen from '../screens/TreatmentsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MessagesStackNavigator from './MessagesStackNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Home') {
                        const iconName = focused ? 'home' : 'home-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } else if (route.name === 'Calendar') {
                        const iconName = focused ? 'calendar' : 'calendar-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } else if (route.name === 'Setări') {
                        const iconName = focused ? 'settings' : 'settings-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    } else if (route.name === 'Tratamente') {
                        return <MaterialCommunityIcons name="pill" size={size} color={color} />;
                    } else if (route.name === 'Mesaje') {
                        const iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                        return <Ionicons name={iconName} size={size} color={color} />;
                    }
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Tratamente" component={TreatmentsScreen} />
            <Tab.Screen name="Mesaje" component={MessagesStackNavigator} />
            <Tab.Screen name="Setări" component={SettingsScreen} />
        </Tab.Navigator>
    );
}