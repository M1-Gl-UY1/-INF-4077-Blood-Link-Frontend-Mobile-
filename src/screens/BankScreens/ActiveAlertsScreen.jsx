import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../../constants/colors';
import AlertCard from '../../components/AlertCard';

// Données d'exemple pour les alertes en cours
const activeAlerts = [
  {
    id: '1',
    bloodGroup: 'O',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin o et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '2',
    bloodGroup: 'A',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin A et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '3',
    bloodGroup: 'B',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin B et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '4',
    bloodGroup: 'O',
    rhesus: '-',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe',
    time: 'il y a 2h',
  },
];

const ActiveAlertsScreen = () => {
  const handleCancelAlert = (id) => {
    console.log('Annuler alerte:', id);
    // Logique d'annulation
  };

  const renderAlert = ({ item }) => (
    <AlertCard
      bloodGroup={item.bloodGroup}
      rhesus={item.rhesus}
      bankName={item.bankName}
      location={item.location}
      description={item.description}
      time={item.time}
      onCancel={() => handleCancelAlert(item.id)}
      type="active"
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activeAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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

export default ActiveAlertsScreen;