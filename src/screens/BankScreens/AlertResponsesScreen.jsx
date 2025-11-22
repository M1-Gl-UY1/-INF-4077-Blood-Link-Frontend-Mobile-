import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import AlertResponseCard from '../../components/AlertResponseCard';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { alertService } from '../../services/alertService';

const AlertResponses = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [alertsWithResponses, setAlertsWithResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les alertes avec leurs réponses
  const loadAlertsWithResponses = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const alerts = await alertService.getAlertsWithPendingResponses(user.uid);
      setAlertsWithResponses(alerts);
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
    }
  }, [user?.uid]);

  // Chargement initial
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await loadAlertsWithResponses();
      setIsLoading(false);
    };

    initialLoad();
  }, [loadAlertsWithResponses]);

  // Rafraîchir
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlertsWithResponses();
    setIsRefreshing(false);
  };

  // Naviguer vers les détails pour confirmer le don
  const handleConfirmDonation = (alert) => {
    navigation.navigate('BankProfile', { alert });
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

  const renderAlert = ({ item }) => {
    const pendingResponses = item.responses?.filter(r => r.status === 'pending') || [];

    return (
      <AlertResponseCard
        bloodGroup={item.bloodGroup}
        rhesus={item.rhesus}
        bankName={item.bankName}
        location={item.bankLocation || 'Non spécifié'}
        description={item.message}
        time={formatRelativeTime(item.alertDate)}
        responseCount={pendingResponses.length}
        onConfirm={() => handleConfirmDonation(item)}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💌</Text>
      <Text style={styles.emptyTitle}>Aucune réponse en attente</Text>
      <Text style={styles.emptySubtitle}>
        Les réponses des donneurs à vos alertes apparaîtront ici
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alertes répondues</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          <Text style={styles.loadingText}>Chargement des réponses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertes répondues</Text>
        {alertsWithResponses.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{alertsWithResponses.length}</Text>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={alertsWithResponses}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={[
          styles.listContainer,
          alertsWithResponses.length === 0 && styles.emptyListContainer,
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  badge: {
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '700',
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

export default AlertResponses;
