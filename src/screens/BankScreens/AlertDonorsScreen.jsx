import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DonorCard from '../../components/DonorCard';
import ButtonCustom from '../../components/ButtonCustom';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { alertService } from '../../services/alertService';
import { firestoreService } from '../../services/firestoreService';

const BankProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Récupérer les données de l'alerte depuis la navigation
  const alertData = route.params?.alert;

  const [responses, setResponses] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Charger les réponses et les données des providers
  const loadData = useCallback(async () => {
    if (!alertData?.id) return;

    try {
      // Récupérer les réponses à l'alerte
      const alertResponses = await alertService.getAlertResponses(alertData.id);
      setResponses(alertResponses);

      // Récupérer les détails des providers qui ont répondu
      const providerPromises = alertResponses
        .filter(r => r.status === 'pending' || r.status === 'accepted')
        .map(async (response) => {
          const provider = await firestoreService.getProvider(response.providerId);
          return provider ? { ...provider, responseId: response.id, responseStatus: response.status } : null;
        });

      const providersData = (await Promise.all(providerPromises)).filter(Boolean);
      setProviders(providersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, [alertData?.id]);

  // Chargement initial
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };

    initialLoad();
  }, [loadData]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!alertData?.id) return;

    const unsubscribe = alertService.subscribeToAlertResponses(alertData.id, async (updatedResponses) => {
      setResponses(updatedResponses);

      // Mettre à jour les providers
      const providerPromises = updatedResponses
        .filter(r => r.status === 'pending' || r.status === 'accepted')
        .map(async (response) => {
          const provider = await firestoreService.getProvider(response.providerId);
          return provider ? { ...provider, responseId: response.id, responseStatus: response.status } : null;
        });

      const providersData = (await Promise.all(providerPromises)).filter(Boolean);
      setProviders(providersData);
    });

    return () => unsubscribe();
  }, [alertData?.id]);

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Accepter un donneur
  const handleAcceptDonor = async (provider) => {
    Alert.alert(
      'Accepter le donneur',
      `Voulez-vous accepter ${provider.name || provider.username} comme donneur ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, accepter',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await alertService.acceptAlertResponse(provider.responseId);
              Alert.alert('Succès', 'Le donneur a été accepté');
            } catch (error) {
              console.error('Erreur:', error);
              Alert.alert('Erreur', 'Impossible d\'accepter le donneur');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Confirmer le don (marquer comme complété)
  const handleConfirmDonation = async () => {
    const acceptedProviders = providers.filter(p => p.responseStatus === 'accepted');

    if (acceptedProviders.length === 0) {
      Alert.alert('Attention', 'Veuillez d\'abord accepter au moins un donneur');
      return;
    }

    Alert.alert(
      'Confirmer le don',
      'Le don a-t-il été effectué avec succès ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, confirmer',
          onPress: async () => {
            try {
              setIsProcessing(true);

              // Marquer toutes les réponses acceptées comme complétées
              await Promise.all(
                acceptedProviders.map(p => alertService.completeAlertResponse(p.responseId))
              );

              // Résoudre l'alerte
              await alertService.resolveAlert(alertData.id);

              Alert.alert('Succès', 'Le don a été confirmé et l\'alerte résolue', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Erreur:', error);
              Alert.alert('Erreur', 'Impossible de confirmer le don');
            } finally {
              setIsProcessing(false);
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
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Calculer l'âge
  const calculateAge = (dateBirth) => {
    if (!dateBirth) return 'N/A';
    const birthDate = dateBirth.toDate ? dateBirth.toDate() : new Date(dateBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  if (!alertData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Aucune alerte sélectionnée</Text>
          <Text style={styles.emptySubtitle}>Veuillez sélectionner une alerte depuis la liste</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          <Text style={styles.loadingText}>Chargement des donneurs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donneurs potentiels</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY_RED]}
          />
        }
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
              <Text style={styles.location}>{alertData.bankLocation || 'Non spécifié'}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {alertData.message}
              </Text>
              <Text style={styles.time}>{formatRelativeTime(alertData.alertDate)}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="people" size={18} color={COLORS.PRIMARY_BLUE} />
              <Text style={styles.statValue}>{responses.length}</Text>
              <Text style={styles.statLabel}>Réponses</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.statValue}>
                {providers.filter(p => p.responseStatus === 'accepted').length}
              </Text>
              <Text style={styles.statLabel}>Acceptés</Text>
            </View>
          </View>
        </View>

        {/* Donors List */}
        {providers.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              Donneurs ayant répondu ({providers.length})
            </Text>
            {providers.map((provider) => (
              <DonorCard
                key={provider.id}
                donor={{
                  id: provider.id,
                  name: provider.name || provider.username,
                  phone: provider.phoneNumber || 'Non renseigné',
                  bloodGroup: `${provider.bloodGroup}${provider.rhesus}`,
                  sex: provider.sexe || 'N/A',
                  age: calculateAge(provider.dateBirth),
                  lastDonation: provider.lastGive
                    ? provider.lastGive.toDate?.().toLocaleDateString('fr-FR')
                    : 'Jamais',
                  status: provider.responseStatus,
                }}
                onAccept={
                  provider.responseStatus === 'pending'
                    ? () => handleAcceptDonor(provider)
                    : undefined
                }
              />
            ))}
          </>
        ) : (
          <View style={styles.noDonorsContainer}>
            <Text style={styles.noDonorsIcon}>👥</Text>
            <Text style={styles.noDonorsTitle}>Aucun donneur n'a encore répondu</Text>
            <Text style={styles.noDonorsSubtitle}>
              Les donneurs compatibles recevront une notification
            </Text>
          </View>
        )}

        {/* Confirm Button */}
        {providers.length > 0 && (
          <View style={styles.buttonContainer}>
            <ButtonCustom
              color={COLORS.PRIMARY_RED}
              title={isProcessing ? 'Traitement...' : 'Confirmer le don'}
              onPress={handleConfirmDonation}
              disabled={isProcessing}
            />
          </View>
        )}
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
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  alertCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bloodBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.PRIMARY_RED,
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
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.WHITE,
    lineHeight: 44,
  },
  rhesusSymbol: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginLeft: 2,
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
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.BLACK,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginLeft: 6,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  noDonorsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDonorsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noDonorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 6,
    textAlign: 'center',
  },
  noDonorsSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default BankProfile;
