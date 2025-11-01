import React from 'react';
import { View, StyleSheet } from 'react-native';
import DoctorNavBar from '../components/DoctorNavBar';

export default function DoctorLayout({ children }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <DoctorNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
