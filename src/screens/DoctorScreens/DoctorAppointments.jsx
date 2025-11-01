import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import AppointmentCard from '../../components/AppointmentCard';

// Données d'exemple des rendez-vous
const appointments = [
  {
    id: '1',
    bloodGroup: 'O',
    rhesus: '+',
    description: 'Nous recherchons urgement un donneur de groupe sanguin O et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '2',
    bloodGroup: 'O',
    rhesus: '+',
    description: 'Nous recherchons urgement un donneur de groupe sanguin O et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '3',
    bloodGroup: 'O',
    rhesus: '+',
    description: 'Nous recherchons urgement un donneur de groupe sanguin O et de rhésus positif',
    time: 'il y a 1h',
  },
];

const DoctorAppointments = () => {
  const handleCancelAppointment = (id) => {
    console.log('Annuler rendez-vous:', id);
    // Logique d'annulation
  };

  const renderAppointment = ({ item }) => (
    <AppointmentCard
      bloodGroup={item.bloodGroup}
      rhesus={item.rhesus}
      description={item.description}
      time={item.time}
      onCancel={() => handleCancelAppointment(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
});

export default DoctorAppointments;