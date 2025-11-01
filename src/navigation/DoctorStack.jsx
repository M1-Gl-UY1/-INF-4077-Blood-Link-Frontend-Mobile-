import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorHome from '../screens/DoctorScreens/DoctorHome';
import DoctorAppointments from '../screens/DoctorScreens/DoctorAppointments';
import DoctorProfile from '../screens/DoctorScreens/DoctorProfile';
import DoctorLayout from './DoctorLayout';

const Stack = createNativeStackNavigator();

const DoctorStack = () => {
  return (
    <DoctorLayout>
      <Stack.Navigator screenOptions={{ headerShown: false}}>
        <Stack.Screen name="Doctor" component={DoctorHome} />
        <Stack.Screen name="DoctorAppointments" component={DoctorAppointments} />
        <Stack.Screen name="DoctorProfile" component={DoctorProfile} />
      </Stack.Navigator>
    </DoctorLayout>
  );
};

export default DoctorStack;
