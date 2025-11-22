import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

const AlertCard = ({ 
  bloodGroup, 
  rhesus, 
  bankName, 
  location, 
  description, 
  time, 
  onCancel, 
  onValidate,
  type = 'active' 
}) => {
  return (
    <View style={styles.card}>
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
          {type === 'active' && (
            <>
              <Text style={styles.bankName}>{bankName}</Text>
              <Text style={styles.location}>{location}</Text>
            </>
          )}
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {type === 'active' ? (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButtonSmall} onPress={onCancel}>
            <Text style={styles.cancelButtonSmallText}>annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.validateButton} onPress={onValidate}>
            <Text style={styles.validateButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      )}
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
  cancelButton: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButtonSmall: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonSmallText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  validateButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlertCard;