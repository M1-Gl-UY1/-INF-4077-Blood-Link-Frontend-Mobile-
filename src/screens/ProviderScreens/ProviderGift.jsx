import React, { useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useProviderResponses, useDonationHistory } from '../../hooks/useProviderData';

const ResponseCard = ({ response, onPress }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          color: '#FF9800',
          bgColor: 'rgba(255, 152, 0, 0.15)',
          icon: 'time-outline'
        };
      case 'accepted':
        return {
          label: 'Accepté',
          color: '#2196F3',
          bgColor: 'rgba(33, 150, 243, 0.15)',
          icon: 'checkmark-circle-outline'
        };
      case 'completed':
        return {
          label: 'Complété',
          color: '#4CAF50',
          bgColor: 'rgba(76, 175, 80, 0.15)',
          icon: 'checkmark-done-circle-outline'
        };
      case 'cancelled':
        return {
          label: 'Annulé',
          color: '#F44336',
          bgColor: 'rgba(244, 67, 54, 0.15)',
          icon: 'close-circle-outline'
        };
      default:
        return {
          label: 'Inconnu',
          color: '#9E9E9E',
          bgColor: 'rgba(158, 158, 158, 0.15)',
          icon: 'help-circle-outline'
        };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusConfig = getStatusConfig(response.status);

  return (
    <TouchableOpacity
      style={styles.responseCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
        <Icon name={statusConfig.icon} size={12} color={statusConfig.color} />
        <Text style={[styles.statusText, { color: statusConfig.color }]}>
          {statusConfig.label}
        </Text>
      </View>

      {/* Blood Group Display */}
      <View style={styles.bloodGroupContainer}>
        <View style={styles.bloodDropIcon}>
          <Icon name="water" size={40} color={COLORS.PRIMARY_RED} />
        </View>
      </View>

      {/* Info */}
      <Text style={styles.providerName} numberOfLines={1}>
        {response.providerName || 'Donneur'}
      </Text>

      {/* Date */}
      <View style={styles.dateContainer}>
        <Icon name="calendar-outline" size={12} color={COLORS.GRAY_DARK} />
        <Text style={styles.dateText}>{formatDate(response.responseDate)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DonationCard = ({ donation }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.donationCard}>
      {/* Success Badge */}
      <View style={[styles.statusBadge, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
        <Icon name="checkmark-done-circle" size={12} color="#4CAF50" />
        <Text style={[styles.statusText, { color: '#4CAF50' }]}>Réussi</Text>
      </View>

      {/* Blood Group */}
      <View style={styles.bloodGroupDisplay}>
        <Text style={styles.bloodGroup}>{donation.bloodGroup}</Text>
        <Text style={styles.rhesus}>{donation.rhesus}</Text>
      </View>

      {/* Bank Name */}
      <Text style={styles.bankName} numberOfLines={2}>{donation.bankName}</Text>

      {/* Date */}
      <View style={styles.dateContainer}>
        <Icon name="calendar-outline" size={12} color={COLORS.GRAY_DARK} />
        <Text style={styles.dateText}>{formatDate(donation.responseDate)}</Text>
      </View>
    </View>
  );
};

export default function ProviderGift() {
  const navigation = useNavigation();
  const { responses, loading: responsesLoading } = useProviderResponses();
  const { history, loading: historyLoading, refreshHistory } = useDonationHistory();
  const [activeTab, setActiveTab] = useState('responses');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  }, [refreshHistory]);

  const pendingResponses = responses.filter(r => r.status === 'pending' || r.status === 'accepted');
  const completedDonations = history;

  const renderResponse = ({ item }) => (
    <ResponseCard response={item} onPress={() => {}} />
  );

  const renderDonation = ({ item }) => (
    <DonationCard donation={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name={activeTab === 'responses' ? 'notifications-off-outline' : 'gift-outline'}
          size={50}
          color={COLORS.GRAY_LIGHT}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'responses' ? 'Aucune réponse en cours' : 'Aucun don effectué'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'responses'
          ? 'Vos réponses aux alertes apparaîtront ici'
          : 'Votre historique de dons apparaîtra ici'
        }
      </Text>
    </View>
  );

  const isLoading = responsesLoading || historyLoading;

  if (isLoading && responses.length === 0 && history.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Dons</Text>
        <View style={styles.headerRight}>
          <Icon name="heart" size={24} color={COLORS.PRIMARY_RED} />
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="time" size={20} color="#FF9800" />
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{pendingResponses.length}</Text>
          <Text style={styles.statLabel}>En cours</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="checkmark-done-circle" size={20} color="#4CAF50" />
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{completedDonations.length}</Text>
          <Text style={styles.statLabel}>Complétés</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="water" size={20} color="#2196F3" />
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>{responses.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'responses' && styles.activeTab]}
          onPress={() => setActiveTab('responses')}
        >
          <Icon
            name="notifications-outline"
            size={18}
            color={activeTab === 'responses' ? COLORS.PRIMARY_RED : COLORS.GRAY_DARK}
          />
          <Text style={[styles.tabText, activeTab === 'responses' && styles.activeTabText]}>
            Réponses ({pendingResponses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Icon
            name="gift-outline"
            size={18}
            color={activeTab === 'history' ? COLORS.PRIMARY_RED : COLORS.GRAY_DARK}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Historique ({completedDonations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'responses' ? pendingResponses : completedDonations}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'responses' ? renderResponse : renderDonation}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContainer,
          (activeTab === 'responses' ? pendingResponses : completedDonations).length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY_RED]}
          />
        }
      />
    </SafeAreaView>
  );
}

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
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    gap: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  activeTabText: {
    color: COLORS.PRIMARY_RED,
  },
  listContainer: {
    padding: 12,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
  },
  responseCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  donationCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bloodGroupContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  bloodDropIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodGroupDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bloodGroup: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  rhesus: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
    marginBottom: 4,
    marginLeft: 2,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 20,
  },
});
