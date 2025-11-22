import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const DonorCard = ({ donor, onAccept }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Accepté',
          color: '#4CAF50',
          bgColor: 'rgba(76, 175, 80, 0.1)',
          icon: 'checkmark-circle',
        };
      case 'completed':
        return {
          label: 'Don effectué',
          color: '#2196F3',
          bgColor: 'rgba(33, 150, 243, 0.1)',
          icon: 'heart',
        };
      case 'cancelled':
        return {
          label: 'Annulé',
          color: '#F44336',
          bgColor: 'rgba(244, 67, 54, 0.1)',
          icon: 'close-circle',
        };
      case 'pending':
      default:
        return {
          label: 'En attente',
          color: '#FF9800',
          bgColor: 'rgba(255, 152, 0, 0.1)',
          icon: 'time',
        };
    }
  };

  const statusConfig = donor.status ? getStatusConfig(donor.status) : null;

  return (
    <View style={styles.card}>
      {/* Header avec nom et statut */}
      <View style={styles.headerRow}>
        <View style={styles.nameContainer}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={20} color={COLORS.WHITE} />
          </View>
          <View style={styles.nameInfo}>
            <Text style={styles.donorName} numberOfLines={1}>{donor.name}</Text>
            <Text style={styles.donorPhone}>{donor.phone}</Text>
          </View>
        </View>

        {statusConfig && (
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        )}
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Groupe</Text>
          <View style={styles.bloodGroupBadge}>
            <Text style={styles.bloodGroupText}>{donor.bloodGroup}</Text>
          </View>
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

      {/* Footer avec actions */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.medicalFileButton}>
          <Icon name="document-text-outline" size={18} color={COLORS.PRIMARY_BLUE} />
          <Text style={styles.medicalFileText}>Dossier médical</Text>
        </TouchableOpacity>

        {onAccept && donor.status === 'pending' && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            activeOpacity={0.7}
          >
            <Icon name="checkmark" size={18} color={COLORS.WHITE} />
            <Text style={styles.acceptButtonText}>Accepter</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  donorPhone: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  bloodGroupBadge: {
    backgroundColor: COLORS.PRIMARY_RED,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bloodGroupText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  medicalFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicalFileText: {
    fontSize: 13,
    color: COLORS.PRIMARY_BLUE,
    marginLeft: 6,
    fontWeight: '500',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.WHITE,
    marginLeft: 6,
  },
});

export default DonorCard;
