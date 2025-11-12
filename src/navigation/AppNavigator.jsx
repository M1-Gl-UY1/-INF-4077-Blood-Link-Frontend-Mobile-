import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
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
import EditProfilScreen from '../screens/BankScreens/Editprofilscreen';
import ActiveAlertsScreen from '../screens/BankScreens/ActiveAlertsScreen';
import AlertRequestsScreen from '../screens/BankScreens/AlertRequestsScreen';
import AlertResponses from '../screens/BankScreens/AlertResponsesScreen';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Affiche un loading pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'none' }}
      >
        {!isAuthenticated ? (
          // Écrans d'authentification (utilisateur non connecté)
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="First" component={FirstScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SelectUser" component={SelectUserScreen} />
            <Stack.Screen name="SignUpUser" component={SignUpUserScreen} />
            <Stack.Screen name="SignUpBank" component={SignUpBankScreen} />
            <Stack.Screen name="SignUpDoctor" component={SignUpDoctorScreen} />
          </>
        ) : (
          // Navigation basée sur le rôle de l'utilisateur
          <>
            {user?.role === 'provider' && (
              <>
                <Stack.Screen name="ProviderStack" component={ProviderStack} />
                <Stack.Screen name="AlertDetails" component={AlertDetails} />
                <Stack.Screen name="UpdateProviderProfile" component={UpdateProviderProfile} />
              </>
            )}

            {user?.role === 'doctor' && (
              <>
                <Stack.Screen name="DoctorStack" component={DoctorStack} />
              </>
            )}

            {user?.role === 'bank' && (
              <>
                <Stack.Screen name="BankStack" component={BankStack} />
                <Stack.Screen name="AlertDetails" component={AlertDetails} />
                <Stack.Screen name="EditProfil" component={EditProfilScreen} />
                <Stack.Screen name="ActiveAlerts" component={ActiveAlertsScreen} />
                <Stack.Screen name="AlertRequests" component={AlertRequestsScreen} />
                <Stack.Screen name="AlertResponses" component={AlertResponses} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;