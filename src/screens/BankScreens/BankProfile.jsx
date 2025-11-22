import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { useBankData } from '../../hooks/useBankData';

const StatCard = ({ icon, value, label, bgColor, color }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Icon name={icon} size={22} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuButton = ({ icon, label, onPress, color = COLORS.BLACK, danger = false }) => (
  <TouchableOpacity
    style={[styles.menuButton, danger && styles.menuButtonDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIconContainer, danger && styles.menuIconContainerDanger]}>
      <Icon name={icon} size={22} color={danger ? '#D32F2F' : COLORS.PRIMARY_BLUE} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    <Icon name="chevron-forward" size={20} color={danger ? '#D32F2F' : COLORS.GRAY_LIGHT} />
  </TouchableOpacity>
);

const BankProfile = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const { bankProfile, activeAlerts, pendingRequests, isLoading, refreshData } = useBankData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !bankProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY_RED]}
            tintColor={COLORS.PRIMARY_RED}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="business" size={40} color={COLORS.WHITE} />
          </View>
          <Text style={styles.bankName}>
            {bankProfile?.name || bankProfile?.username || 'Banque de sang'}
          </Text>
          <Text style={styles.bankEmail}>{bankProfile?.email || user?.email}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-outline" size={16} color={COLORS.GRAY_DARK} />
            <Text style={styles.bankLocation}>
              {bankProfile?.location || 'Localisation non définie'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="notifications"
            value={activeAlerts?.length || 0}
            label="Alertes actives"
            bgColor="rgba(244, 67, 54, 0.1)"
            color="#F44336"
          />
          <StatCard
            icon="time"
            value={pendingRequests?.length || 0}
            label="En attente"
            bgColor="rgba(255, 152, 0, 0.1)"
            color="#FF9800"
          />
          <StatCard
            icon="water"
            value={bankProfile?.bloodBagCount || 0}
            label="Poches"
            bgColor="rgba(63, 149, 185, 0.1)"
            color={COLORS.PRIMARY_BLUE}
          />
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Paramètres</Text>

          <MenuButton
            icon="create-outline"
            label="Modifier le profil"
            onPress={() => navigation.navigate('EditProfil')}
          />

          <MenuButton
            icon="notifications-outline"
            label="Alertes actives"
            onPress={() => navigation.navigate('ActiveAlerts')}
          />

          <MenuButton
            icon="clipboard-outline"
            label="Demandes en attente"
            onPress={() => navigation.navigate('AlertRequests')}
          />

          <MenuButton
            icon="people-outline"
            label="Réponses aux alertes"
            onPress={() => navigation.navigate('AlertResponses')}
          />
        </View>

        {/* Logout */}
        <View style={styles.menuContainer}>
          <MenuButton
            icon="log-out-outline"
            label="Déconnexion"
            onPress={handleLogout}
            danger
          />
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>BloodLink v1.0.0</Text>
      </ScrollView>
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
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bankName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 4,
    textAlign: 'center',
  },
  bankEmail: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLocation: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: COLORS.WHITE,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: COLORS.WHITE,
    marginBottom: 12,
    paddingVertical: 8,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    paddingHorizontal: 20,
    paddingVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuButtonDanger: {
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(63, 149, 185, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconContainerDanger: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  menuLabelDanger: {
    color: '#D32F2F',
  },
  versionText: {
    fontSize: 12,
    color: COLORS.GRAY_LIGHT,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default BankProfile;
