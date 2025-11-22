import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePendingRequests } from '../../hooks/useDoctorData';

const DoctorAppointments = () => {
  const { pendingRequests, loading, cancelRequest } = usePendingRequests();
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Le hook se rafraîchit automatiquement via onSnapshot
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCancelRequest = (request) => {
    Alert.alert(
      'Annuler la demande',
      `Voulez-vous vraiment annuler cette demande de ${request.quantity} poche(s) de sang ${request.bloodGroup}${request.rhesus} ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingId(request.id);
              await cancelRequest(request.id);
              Alert.alert('Succès', 'La demande a été annulée');
            } catch (error) {
              console.error('Erreur annulation:', error);
              Alert.alert('Erreur', error.message || 'Impossible d\'annuler la demande');
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const getUrgencyConfig = (level) => {
    switch (level) {
      case 'low':
        return { label: 'Faible', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)', icon: 'leaf' };
      case 'medium':
        return { label: 'Moyen', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)', icon: 'alert-circle' };
      case 'high':
        return { label: 'Urgent', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.1)', icon: 'warning' };
      case 'critical':
        return { label: 'Critique', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)', icon: 'flash' };
      default:
        return { label: 'Moyen', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)', icon: 'alert-circle' };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Moins d'une minute
    if (diff < 60000) {
      return 'À l\'instant';
    }
    // Moins d'une heure
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Il y a ${minutes} min`;
    }
    // Moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Il y a ${hours}h`;
    }
    // Sinon, afficher la date
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRequest = ({ item }) => {
    const urgency = getUrgencyConfig(item.urgencyLevel);
    const isCancelling = cancellingId === item.id;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bloodGroupContainer}>
            <View style={styles.bloodBox}>
              <Text style={styles.bloodGroup}>{item.bloodGroup}</Text>
              <Text style={styles.rhesusSymbol}>{item.rhesus}</Text>
            </View>
          </View>

          <View style={styles.headerInfo}>
            <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
              <Icon name={urgency.icon} size={14} color={urgency.color} />
              <Text style={[styles.urgencyText, { color: urgency.color }]}>
                {urgency.label}
              </Text>
            </View>
            <Text style={styles.quantity}>{item.quantity} poche{item.quantity > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Corps */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="business-outline" size={16} color={COLORS.GRAY_DARK} />
            <Text style={styles.bankName} numberOfLines={1}>{item.bankName}</Text>
          </View>

          {item.patientInfo && (
            <View style={styles.infoRow}>
              <Icon name="person-outline" size={16} color={COLORS.GRAY_DARK} />
              <Text style={styles.patientInfo} numberOfLines={2}>{item.patientInfo}</Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Icon name="time" size={14} color="#FF9800" />
              <Text style={styles.statusText}>En attente de validation</Text>
            </View>
            <Text style={styles.timeText}>{formatDate(item.requestDate)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
            onPress={() => handleCancelRequest(item)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <>
                <Icon name="close" size={16} color={COLORS.WHITE} />
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="document-text-outline" size={60} color={COLORS.GRAY_LIGHT} />
      </View>
      <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
      <Text style={styles.emptyText}>
        Vos demandes de sang en attente de validation apparaîtront ici
      </Text>
    </View>
  );

  if (loading && pendingRequests.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Demandes en cours</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pendingRequests.length}</Text>
        </View>
      </View>

      <FlatList
        data={pendingRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={[
          styles.listContainer,
          pendingRequests.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY_BLUE]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  countBadge: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyListContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bloodGroupContainer: {
    marginRight: 12,
  },
  bloodBox: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bloodGroup: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.WHITE,
  },
  rhesusSymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginTop: -8,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankName: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '500',
    flex: 1,
  },
  patientInfo: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 12,
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: COLORS.WHITE,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DoctorAppointments;
