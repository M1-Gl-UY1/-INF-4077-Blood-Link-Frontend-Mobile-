import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import FirstScreen from '../screens/FirstScreen';
import SelectUserScreen from '../screens/auth/SelectUserScreen';
import SignUpUserScreen from '../screens/auth/SignUpUserScreen';
import SignUpBankScreen from '../screens/auth/SignUpBankScreen';
import SignUpDoctorScreen from '../screens/auth/SignUpDoctorScreen';
import ProviderStack from './ProviderStack';
import DoctorStack from './DoctorStack';
import BankStack from './BankStack';
import AlertDetails from '../screens/AlertDetails';
import UpdateProviderProfile from '../screens/ProviderScreens/UpdateProviderProfile';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="First" component={FirstScreen} />
        <Stack.Screen name="SelectUser" component={SelectUserScreen} />
        <Stack.Screen name="SignUpUser" component={SignUpUserScreen} />
        <Stack.Screen name="SignUpBank" component={SignUpBankScreen} />
        <Stack.Screen name="SignUpDoctor" component={SignUpDoctorScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProviderStack" component={ProviderStack} />
        <Stack.Screen name="DoctorStack" component={DoctorStack} />
        <Stack.Screen name="BankStack" component={BankStack} />
        <Stack.Screen name="AlertDetails" component={AlertDetails} />
        <Stack.Screen name="UpdateProviderProfile" component={UpdateProviderProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;