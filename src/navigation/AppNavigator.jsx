import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import FirstScreen from '../screens/FirstScreen';
import ProviderStack from './ProviderStack';
import AlertDetails from '../screens/AlertDetails';
import UpdateProviderProfile from '../screens/UpdateProviderProfile';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="ProviderStack" component={ProviderStack} />
        <Stack.Screen name="AlertDetails" component={AlertDetails} />
        <Stack.Screen name="UpdateProviderProfile" component={UpdateProviderProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
