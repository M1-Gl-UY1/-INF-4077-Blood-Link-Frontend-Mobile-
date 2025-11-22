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
} from 'react-native';
import { COLORS } from '../../constants/colors';
import AlertCard from '../../components/AlertCard';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { alertService } from '../../services/alertService';

const ActiveAlertsScreen = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les alertes actives
  const loadAlerts = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const activeAlerts = await alertService.getActiveAlertsByBank(user.uid);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  }, [user?.uid]);

  // Chargement initial
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await loadAlerts();
      setIsLoading(false);
    };

    initialLoad();
  }, [loadAlerts]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = alertService.subscribeToActiveAlertsByBank(user.uid, (updatedAlerts) => {
      setAlerts(updatedAlerts);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlerts();
    setIsRefreshing(false);
  };

  // Annuler une alerte
  const handleCancelAlert = async (alertId) => {
    Alert.alert(
      'Annuler l\'alerte',
      'Êtes-vous sûr de vouloir annuler cette alerte ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await alertService.cancelAlert(alertId);
              Alert.alert('Succès', 'L\'alerte a été annulée');
            } catch (error) {
              console.error('Erreur lors de l\'annulation:', error);
              Alert.alert('Erreur', 'Impossible d\'annuler l\'alerte');
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

  // Obtenir la couleur selon l'urgence
  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical': return '#9C27B0';
      case 'high': return COLORS.PRIMARY_RED;
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.PRIMARY_RED;
    }
  };

  const renderAlert = ({ item }) => (
    <AlertCard
      bloodGroup={item.bloodGroup}
      rhesus={item.rhesus}
      bankName={item.bankName}
      location={item.bankLocation || 'Non spécifié'}
      description={item.message}
      time={formatRelativeTime(item.alertDate)}
      onCancel={() => handleCancelAlert(item.id)}
      type="active"
      urgencyColor={getUrgencyColor(item.urgencyLevel)}
      responseCount={item.responseCount}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📢</Text>
      <Text style={styles.emptyTitle}>Aucune alerte active</Text>
      <Text style={styles.emptySubtitle}>
        Créez une alerte depuis l'écran d'accueil pour rechercher des donneurs
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text style={styles.loadingText}>Chargement des alertes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={[
          styles.listContainer,
          alerts.length === 0 && styles.emptyListContainer,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
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
    lineHeight: 20,
  },
});

export default ActiveAlertsScreen;
