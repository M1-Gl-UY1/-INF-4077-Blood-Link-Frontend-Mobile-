import React from 'react';
import { View, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';

export default function ProviderLayout({ children }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
