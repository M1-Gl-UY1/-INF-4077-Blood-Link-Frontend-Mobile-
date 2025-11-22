import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { firestoreService } from '../../services/firestoreService';
import { alertService } from '../../services/alertService';

const RequestCard = ({ request, onApprove, onReject, formatTime }) => {
  const getUrgencyConfig = (level) => {
    switch (level) {
      case 'low':
        return { label: 'Faible', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.15)' };
      case 'medium':
        return { label: 'Moyen', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.15)' };
      case 'high':
        return { label: 'Urgent', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.15)' };
      case 'critical':
        return { label: 'CRITIQUE', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.15)' };
      default:
        return { label: 'Normal', color: '#607D8B', bgColor: 'rgba(96, 125, 139, 0.15)' };
    }
  };

  const urgency = getUrgencyConfig(request.urgencyLevel);

  return (
    <View style={styles.requestCard}>
      {/* Header */}
      <View style={styles.requestHeader}>
        <View style={styles.bloodGroupBadge}>
          <Text style={styles.bloodGroupText}>{request.bloodGroup}</Text>
          <Text style={styles.rhesusText}>{request.rhesus}</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
          <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
        </View>
      </View>

      {/* Doctor Info */}
      <View style={styles.doctorInfo}>
        <Icon name="medical" size={18} color={COLORS.PRIMARY_BLUE} />
        <Text style={styles.doctorName}>Dr. {request.doctorName || 'Médecin'}</Text>
      </View>

      {/* Request Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="water-outline" size={16} color={COLORS.GRAY_DARK} />
          <Text style={styles.detailText}>Quantité: {request.quantity} poche(s)</Text>
        </View>
        {request.patientInfo && (
          <View style={styles.detailRow}>
            <Icon name="person-outline" size={16} color={COLORS.GRAY_DARK} />
            <Text style={styles.detailText}>Patient: {request.patientInfo}</Text>
          </View>
        )}
        {request.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{request.notes}</Text>
          </View>
        )}
      </View>

      {/* Time */}
      <Text style={styles.timeText}>{formatTime(request.requestDate)}</Text>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={onReject}
        >
          <Icon name="close" size={18} color="#D32F2F" />
          <Text style={styles.rejectButtonText}>Rejeter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={onApprove}
        >
          <Icon name="checkmark" size={18} color={COLORS.WHITE} />
          <Text style={styles.approveButtonText}>Approuver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AlertRequestsScreen = () => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les demandes en attente
  const loadRequests = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const pendingRequests = await firestoreService.getPendingBloodRequestsByBank(user.uid);
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    }
  }, [user?.uid]);

  // Chargement initial
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await loadRequests();
      setIsLoading(false);
    };

    initialLoad();
  }, [loadRequests]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = firestoreService.subscribeToBloodRequestsByBank(user.uid, (allRequests) => {
      // Filtrer pour ne garder que les demandes en attente
      const pending = allRequests.filter(r => r.status === 'pending');
      setRequests(pending);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRequests();
    setIsRefreshing(false);
  };

  // Rejeter une demande
  const handleRejectRequest = async (requestId) => {
    Alert.alert(
      'Rejeter la demande',
      'Êtes-vous sûr de vouloir rejeter cette demande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.updateBloodRequestStatus(requestId, 'rejected');
              Alert.alert('Succès', 'La demande a été rejetée');
            } catch (error) {
              console.error('Erreur lors du rejet:', error);
              Alert.alert('Erreur', 'Impossible de rejeter la demande');
            }
          },
        },
      ]
    );
  };

  // Approuver une demande et créer une alerte
  const handleApproveRequest = async (request) => {
    Alert.alert(
      'Approuver et créer une alerte',
      `Voulez-vous approuver cette demande et créer une alerte pour le groupe sanguin ${request.bloodGroup}${request.rhesus} ?\n\nLes donneurs compatibles seront notifiés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver',
          onPress: async () => {
            try {
              // Utiliser le profil de la banque
              const bankName = profile?.name || profile?.username || 'Banque de sang';
              const bankLocation = profile?.location || '';

              // Créer une alerte avec les infos du médecin
              await alertService.createAlert({
                bloodBankId: user.uid,
                bankName: bankName,
                bankLocation: bankLocation,
                bloodGroup: request.bloodGroup,
                rhesus: request.rhesus,
                message: request.notes || `Demande urgente de sang ${request.bloodGroup}${request.rhesus}. ${request.quantity} poche(s) nécessaire(s).`,
                urgencyLevel: request.urgencyLevel || 'high',
                // Informations sur le médecin initiateur
                initiatedBy: 'doctor',
                doctorId: request.doctorId,
                doctorName: request.doctorName,
                hospitalName: bankName,
                requestId: request.id,
              });

              // Mettre à jour le statut de la demande
              await firestoreService.updateBloodRequestStatus(request.id, 'approved');

              Alert.alert(
                'Succès',
                'L\'alerte a été créée et les donneurs seront notifiés',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Erreur lors de l\'approbation:', error);
              Alert.alert('Erreur', error.message || 'Impossible de créer l\'alerte');
            }
          },
        },
      ]
    );
  };

  // Formater la date relative
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';

    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const renderRequest = ({ item }) => (
    <RequestCard
      request={item}
      onApprove={() => handleApproveRequest(item)}
      onReject={() => handleRejectRequest(item.id)}
      formatTime={formatRelativeTime}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="clipboard-outline" size={50} color={COLORS.GRAY_LIGHT} />
      </View>
      <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
      <Text style={styles.emptySubtitle}>
        Les demandes de sang des médecins apparaîtront ici pour validation
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text style={styles.loadingText}>Chargement des demandes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Demandes en attente</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{requests.length}</Text>
        </View>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={[
          styles.listContainer,
          requests.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY_RED]}
            tintColor={COLORS.PRIMARY_RED}
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
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  badgeContainer: {
    backgroundColor: COLORS.PRIMARY_RED,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodGroupBadge: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bloodGroupText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  rhesusText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
    marginBottom: 4,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.PRIMARY_BLUE,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  notesContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.BLACK,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.GRAY_LIGHT,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#FFEBEE',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
  approveButton: {
    backgroundColor: COLORS.PRIMARY_RED,
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AlertRequestsScreen;
