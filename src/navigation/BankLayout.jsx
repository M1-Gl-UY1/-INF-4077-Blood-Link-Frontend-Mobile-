import React from 'react';
import { View, StyleSheet } from 'react-native';
import BankNavBar from '../components/BankNavBar';

export default function BankLayout({ children }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <BankNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
