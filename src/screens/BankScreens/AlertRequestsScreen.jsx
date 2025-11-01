import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import AlertCard from '../../components/AlertCard';

// Données d'exemple pour les requêtes d'alerte
const alertRequests = [
  {
    id: '1',
    bloodGroup: 'O',
    rhesus: '+',
    description: 'Nous recherchons urgement un donneur de groupe sanguin o et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '2',
    bloodGroup: 'A',
    rhesus: '+',
    description: 'Nous recherchons urgement un donneur de groupe sanguin A et de rhésus positif',
    time: 'il y a 1h',
  },
  {
    id: '3',
    bloodGroup: 'B',
    rhesus: '+',
    description: 'Nous recherchons urgement un donneur de groupe sanguin B et de rhésus positif',
    time: 'il y a 1h',
  },
];

const AlertRequestsScreen = () => {
  const handleCancelRequest = (id) => {
    console.log('Annuler requête:', id);
    // Logique d'annulation
  };

  const handleValidateRequest = (id) => {
    console.log('Valider requête:', id);
    // Logique de validation
  };

  const renderAlert = ({ item }) => (
    <AlertCard
      bloodGroup={item.bloodGroup}
      rhesus={item.rhesus}
      description={item.description}
      time={item.time}
      onCancel={() => handleCancelRequest(item.id)}
      onValidate={() => handleValidateRequest(item.id)}
      type="requests"
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={alertRequests}
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

export default AlertRequestsScreen;