import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from '../constants/colors';

const BankNavBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Définir les icônes selon le nom de la route
        let iconName;
        if (route.name === 'Bank') {
          iconName = 'home';
        } else if (route.name === 'BankInventory') {
          iconName = 'flask';
        } else if (route.name === 'BankProfile') {
          iconName = 'person';
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.button}
            onPress={onPress}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? COLORS.PRIMARY_RED : 'gray'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BankNavBar;

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
});
