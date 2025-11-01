import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DonorCard from '../../components/DonorCard';
import ButtonCustom from '../../components/ButtonCustom';

// Données d'exemple des donneurs
const donors = [
  {
    id: '1',
    name: 'Jorel Tiomela',
    phone: '+237 6 56 14 65 18',
    bloodGroup: 'O+',
    sex: 'M',
    age: '23 ans',
    lastDonation: '10/10/25',
  },
  {
    id: '2',
    name: 'Jorel Tiomela',
    phone: '+237 6 56 14 65 18',
    bloodGroup: 'O+',
    sex: 'M',
    age: '23 ans',
    lastDonation: '10/10/25',
  },
];

const BankProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Récupérer les données de l'alerte depuis la navigation
  const alertData = route.params?.alert || {
    bloodGroup: 'O',
    rhesus: '+',
    bankName: 'Banque de sang Hopital central',
    location: 'Yaoundé, Cameroun',
    description: 'Nous recherchons urgement un donneur de groupe sanguin O et de rhésus positif',
    time: 'il y a 1h',
  };

  const handleConfirmDonation = () => {
    navigation.navigate('AlertResponses', { alert: alertData });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Info Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertContent}>
            {/* Blood Group Box */}
            <View style={styles.bloodBox}>
              <View style={styles.bloodGroupContainer}>
                <Text style={styles.bloodGroup}>{alertData.bloodGroup}</Text>
                <Text style={styles.rhesusSymbol}>{alertData.rhesus}</Text>
              </View>
            </View>

            {/* Alert Info */}
            <View style={styles.alertInfo}>
              <Text style={styles.bankName}>{alertData.bankName}</Text>
              <Text style={styles.location}>{alertData.location}</Text>
              <Text style={styles.description} numberOfLines={3}>
                {alertData.description}
              </Text>
              <Text style={styles.time}>{alertData.time}</Text>
            </View>
          </View>
        </View>

        {/* Donors List */}
        {donors.map((donor) => (
          <DonorCard key={donor.id} donor={donor} />
        ))}

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <ButtonCustom
            color={COLORS.PRIMARY_RED}
            title="confirmer le don"
            onPress={handleConfirmDonation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  alertCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    flexDirection: 'row',
  },
  bloodBox: {
    width: 90,
    height: 90,
    backgroundColor: '#b0b0b0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bloodGroup: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.WHITE,
    lineHeight: 52,
  },
  rhesusSymbol: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginLeft: 4,
    marginBottom: 4,
  },
  alertInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: COLORS.BLACK,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default BankProfile;