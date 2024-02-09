import { View, Text, LogBox } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';


const Stack = createNativeStackNavigator();

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state'])

export default function AppNavigation() {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName='Splash'>
            <Stack.Screen name="Splash" options={{headerShown: false}} component={SplashScreen}/>
            <Stack.Screen name="Home" options={{headerShown: false}} component={HomeScreen}/>
        </Stack.Navigator>
    </NavigationContainer>
  )
}