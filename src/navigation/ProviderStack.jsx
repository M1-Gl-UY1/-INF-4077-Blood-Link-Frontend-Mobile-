import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProviderHome from '../screens/ProviderScreens/ProviderHome';
import ProviderGift from '../screens/ProviderScreens/ProviderGift';
import ProviderProfile from '../screens/ProviderScreens/ProviderProfile';
import NavBar from '../components/NavBar';

const Tab = createBottomTabNavigator();

const ProviderStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NavBar {...props} />}
    >
      <Tab.Screen name="Provider" component={ProviderHome} />
      <Tab.Screen name="ProviderGift" component={ProviderGift} />
      <Tab.Screen name="ProviderProfile" component={ProviderProfile} />
    </Tab.Navigator>
  );
};

export default ProviderStack;
