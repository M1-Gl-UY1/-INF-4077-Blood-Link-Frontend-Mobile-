import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const DonorCard = ({ donor }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.donorName}>{donor.name} : {donor.phone}</Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Groupe</Text>
          <Text style={styles.infoValue}>{donor.bloodGroup}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sexe</Text>
          <Text style={styles.infoValue}>{donor.sex}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoValue}>{donor.age}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Dernier don</Text>
          <Text style={styles.infoValue}>{donor.lastDonation}</Text>
        </View>
      </View>
      
      <View style={styles.medicalFileContainer}>
        <Text style={styles.medicalFileLabel}>Dossier médicale</Text>
        <TouchableOpacity style={styles.fileIcon}>
          <Icon name="document-text" size={24} color={COLORS.PRIMARY_RED} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.BLACK,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  medicalFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicalFileLabel: {
    fontSize: 13,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  fileIcon: {
    padding: 4,
  },
});

export default DonorCard;