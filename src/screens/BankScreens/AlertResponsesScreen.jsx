import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import AlertResponseCard from '../../components/AlertResponseCard';

// Données d'exemple des alertes répondues
const alertResponses = [
  {
    id: '1',
    bloodGroup: 'O',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin O et de rhésus positif',
    time: 'il y a 1h',
    responseCount: 2,
  },
  {
    id: '2',
    bloodGroup: 'A',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin A et de rhésus positif',
    time: 'il y a 1h',
    responseCount: 1,
  },
  {
    id: '3',
    bloodGroup: 'B',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin B et de rhésus positif',
    time: 'il y a 2h',
    responseCount: 2,
  },
];

const AlertResponses = () => {
  const navigation = useNavigation();

  const handleConfirmDonation = (alert) => {
    console.log('Confirmer le don pour:', alert);
    navigation.navigate('BankProfile', { alert });
  };

  const renderAlert = ({ item }) => (
    <AlertResponseCard
      bloodGroup={item.bloodGroup}
      rhesus={item.rhesus}
      bankName={item.bankName}
      location={item.location}
      description={item.description}
      time={item.time}
      responseCount={item.responseCount}
      onConfirm={() => handleConfirmDonation(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertes répondu</Text>
      </View>

      {/* List */}
      <FlatList
        data={alertResponses}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
});

export default AlertResponses;