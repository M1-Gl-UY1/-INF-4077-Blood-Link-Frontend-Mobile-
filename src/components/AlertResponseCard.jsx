import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

const AlertResponseCard = ({ bloodGroup, rhesus, bankName, location, description, time, responseCount, onConfirm }) => {
  return (
    <View style={styles.card}>
      {/* Badge avec le nombre de réponses */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{responseCount}</Text>
      </View>

      <View style={styles.cardContent}>
        {/* Blood Group Box */}
        <View style={styles.bloodBox}>
          <View style={styles.bloodGroupContainer}>
            <Text style={styles.bloodGroup}>{bloodGroup}</Text>
            <Text style={styles.rhesusSymbol}>{rhesus}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.bankName}>{bankName}</Text>
          <Text style={styles.location}>{location}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>confirmer le don</Text>
      </TouchableOpacity>
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
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 12,
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
  infoSection: {
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
  confirmButton: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlertResponseCard;