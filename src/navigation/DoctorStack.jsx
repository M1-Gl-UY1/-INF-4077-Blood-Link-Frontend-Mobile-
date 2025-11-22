import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DoctorHome from '../screens/DoctorScreens/DoctorHome';
import DoctorAppointments from '../screens/DoctorScreens/DoctorAppointments';
import DoctorProfile from '../screens/DoctorScreens/DoctorProfile';
import DoctorNavBar from '../components/DoctorNavBar';

const Tab = createBottomTabNavigator();

const DoctorStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <DoctorNavBar {...props} />}
    >
      <Tab.Screen name="Doctor" component={DoctorHome} />
      <Tab.Screen name="DoctorAppointments" component={DoctorAppointments} />
      <Tab.Screen name="DoctorProfile" component={DoctorProfile} />
    </Tab.Navigator>
  );
};

export default DoctorStack;
