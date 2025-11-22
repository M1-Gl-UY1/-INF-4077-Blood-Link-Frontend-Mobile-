import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import logo2 from '../../assets/logo_2.png';
import adn from '../../assets/adn.png';
import { useActiveAlerts, useProviderProfile, useProviderStats } from '../../hooks/useProviderData';

const { width } = Dimensions.get('window');

const AlertCard = ({ alert, onPress }) => {
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
        return { label: 'Urgent', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.15)' };
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  const urgency = getUrgencyConfig(alert.urgencyLevel);
  const isFromDoctor = alert.initiatedBy === 'doctor';

  return (
    <TouchableOpacity style={styles.alertCard} onPress={onPress} activeOpacity={0.7}>
      {/* Badge d'urgence */}
      <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
        <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
      </View>

      {/* Groupe sanguin */}
      <View style={styles.bloodGroupContainer}>
        <Text style={styles.bloodGroup}>{alert.bloodGroup}</Text>
        <Text style={styles.rhesus}>{alert.rhesus}</Text>
      </View>

      {/* Source de l'alerte */}
      <View style={styles.sourceContainer}>
        <Icon
          name={isFromDoctor ? 'medical' : 'business'}
          size={12}
          color={COLORS.PRIMARY_BLUE}
        />
        <Text style={styles.sourceText} numberOfLines={1}>
          {isFromDoctor ? `Dr. ${alert.doctorName || 'Médecin'}` : alert.bankName}
        </Text>
      </View>

      {/* Message (tronqué) */}
      {alert.message && (
        <Text style={styles.messagePreview} numberOfLines={2}>
          {alert.message}
        </Text>
      )}

      {/* Infos banque */}
      <Text style={styles.bankName} numberOfLines={1}>
        <Icon name="location-outline" size={11} color={COLORS.GRAY_LIGHT} /> {alert.bankName}
      </Text>

      {/* Footer */}
      <View style={styles.alertFooter}>
        <View style={styles.responseCount}>
          <Icon name="people-outline" size={14} color={COLORS.GRAY_DARK} />
          <Text style={styles.responseText}>{alert.responseCount || 0}</Text>
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(alert.alertDate)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ProviderHome() {
  const navigation = useNavigation();
  const { profile, loading: profileLoading, refreshProfile } = useProviderProfile();
  const { alerts, loading: alertsLoading } = useActiveAlerts();
  const { stats, refreshStats } = useProviderStats();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshStats()]);
    setRefreshing(false);
  }, [refreshProfile, refreshStats]);

  const handleAlertPress = (alert) => {
    navigation.navigate('AlertDetails', { bloodAlert: alert });
  };

  const renderAlert = ({ item }) => (
    <AlertCard alert={item} onPress={() => handleAlertPress(item)} />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <Image source={logo2} style={styles.logo} />
          <Text style={styles.welcomeText}>
            Chaque don sauve une vie. La prochaine pourrait être la vôtre. Donnons ensemble, pour la vie
          </Text>
          {profile && (
            <View style={styles.userInfo}>
              <Icon name="person-circle" size={20} color={COLORS.PRIMARY_BLUE} />
              <Text style={styles.userName}>{profile.name || profile.username || 'Donneur'}</Text>
            </View>
          )}
        </View>
        <Image source={adn} style={styles.adnImage} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="heart" size={24} color="#388E3C" />
          <Text style={[styles.statNumber, { color: '#388E3C' }]}>{stats.completedDonations}</Text>
          <Text style={styles.statLabel}>Dons effectués</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Icon name="time" size={24} color="#F57C00" />
          <Text style={[styles.statNumber, { color: '#F57C00' }]}>{stats.pendingResponses}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Icon name="checkmark-circle" size={24} color="#1976D2" />
          <Text style={[styles.statNumber, { color: '#1976D2' }]}>{stats.acceptedResponses}</Text>
          <Text style={styles.statLabel}>Acceptés</Text>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Alertes actives</Text>
        <View style={styles.alertCount}>
          <Text style={styles.alertCountText}>{alerts.length}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="notifications-off-outline" size={50} color={COLORS.GRAY_LIGHT} />
      </View>
      <Text style={styles.emptyTitle}>Aucune alerte active</Text>
      <Text style={styles.emptyText}>
        Les nouvelles alertes de sang apparaîtront ici. Restez disponible pour sauver des vies !
      </Text>
    </View>
  );

  if (profileLoading && alertsLoading) {
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

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          alerts.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
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
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: COLORS.WHITE,
    paddingBottom: 16,
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140,
  },
  welcomeContent: {
    width: '65%',
  },
  logo: {
    width: 90,
    height: 20,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.BLACK,
    lineHeight: 22,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  userName: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.PRIMARY_BLUE,
  },
  adnImage: {
    position: 'absolute',
    right: -30,
    top: -40,
    width: 200,
    height: 220,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  alertCount: {
    backgroundColor: COLORS.PRIMARY_RED,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertCountText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  columnWrapper: {
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  alertCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  bloodGroup: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
  },
  rhesus: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
    marginBottom: 4,
    marginLeft: 2,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.PRIMARY_BLUE,
    flex: 1,
  },
  messagePreview: {
    fontSize: 10,
    color: COLORS.GRAY_DARK,
    lineHeight: 14,
    marginBottom: 6,
  },
  bankName: {
    fontSize: 10,
    color: COLORS.GRAY_LIGHT,
    marginBottom: 10,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  responseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.GRAY_LIGHT,
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
