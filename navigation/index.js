// navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConnectScreen from '../src/screens/ConnectScreen';
import GroupsScreen from '../src/screens/GroupsScreen';
import ChatScreen from '../src/screens/ChatScreen';

const Stack = createNativeStackNavigator();

export default function RootNav() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Connect" component={ConnectScreen} options={{ title: 'Connect' }} />
        <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: 'Groups' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.groupName || 'Chat' })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
