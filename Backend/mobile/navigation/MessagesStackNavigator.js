import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MessagesStackNavigator() {
    return (
        <Stack.Navigator initialRouteName="MessagesList">

            <Stack.Screen
                name="MessagesList"
                component={MessagesScreen}
                options={{ title: 'Mesaje' }}
            />

            <Stack.Screen
                name="ChatDetail"
                component={ChatScreen}
                options={({ route }) => ({
                    title: route.params?.otherUserName || 'Chat',
                    headerBackTitle: 'Înapoi'
                })}
            />
        </Stack.Navigator>
    );
}