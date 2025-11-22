import React, { useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  Pressable,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import human from '../../assets/human.png';
import { useNavigation } from '@react-navigation/native';
import { useProviderProfile, useProviderStats } from '../../hooks/useProviderData';
import { useAuth } from '../../contexts/AuthContextFirebase';
import dayjs from 'dayjs';

const InfoCard = ({ label, value, icon, onPress }) => (
  <TouchableOpacity
    style={styles.infoCard}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <Text style={styles.infoLabel}>{label}</Text>
    {icon ? (
      <Ionicons name={icon} color={COLORS.PRIMARY_RED} size={28} style={styles.documentIcon} />
    ) : (
      <Text style={styles.infoValue}>{value || '-'}</Text>
    )}
  </TouchableOpacity>
);

const StatCard = ({ icon, value, label, bgColor, color }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProviderProfile() {
  const navigation = useNavigation();
  const { profile, loading: profileLoading, refreshProfile, updateAvailability } = useProviderProfile();
  const { stats, loading: statsLoading, refreshStats } = useProviderStats();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshStats()]);
    setRefreshing(false);
  }, [refreshProfile, refreshStats]);

  const handleToggleAvailability = async () => {
    if (!profile) return;

    Alert.alert(
      profile.isAvailable ? 'Désactiver la disponibilité' : 'Activer la disponibilité',
      profile.isAvailable
        ? 'Vous ne recevrez plus les alertes de don de sang. Êtes-vous sûr ?'
        : 'Vous recevrez les alertes de don de sang correspondant à votre groupe sanguin.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setAvailabilityLoading(true);
              await updateAvailability(!profile.isAvailable);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de modifier la disponibilité');
            } finally {
              setAvailabilityLoading(false);
            }
          },
        },
      ]
    );
  };

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

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(date).format('DD/MM/YY');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const date = birthDate.toDate ? birthDate.toDate() : new Date(birthDate);
    return dayjs().diff(dayjs(date), 'year');
  };

  const getSexeLabel = (sexe) => {
    if (!sexe) return '-';
    return sexe === 'M' ? 'M' : 'F';
  };

  const isLoading = profileLoading || statsLoading;

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </SafeAreaView>
    );
  }

  const bloodGroupDisplay = profile?.bloodGroup
    ? `${profile.bloodGroup}${profile.rhesus || ''}`
    : '-';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY_RED]}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>
              {profile?.name || profile?.username || 'Donneur'}
            </Text>
            <Text style={styles.headerPhone}>
              {profile?.phoneNumber || profile?.email || '-'}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('UpdateProviderProfile')}
            style={styles.editButton}
          >
            <Ionicons name="create" size={24} color="white" />
          </Pressable>
        </View>

        {/* Availability Toggle */}
        <TouchableOpacity
          style={[
            styles.availabilityCard,
            { backgroundColor: profile?.isAvailable ? '#E8F5E9' : '#FFEBEE' },
          ]}
          onPress={handleToggleAvailability}
          disabled={availabilityLoading}
        >
          {availabilityLoading ? (
            <ActivityIndicator size="small" color={COLORS.PRIMARY_RED} />
          ) : (
            <>
              <View style={styles.availabilityContent}>
                <Ionicons
                  name={profile?.isAvailable ? 'notifications' : 'notifications-off'}
                  size={24}
                  color={profile?.isAvailable ? '#388E3C' : '#D32F2F'}
                />
                <View style={styles.availabilityTextContainer}>
                  <Text
                    style={[
                      styles.availabilityTitle,
                      { color: profile?.isAvailable ? '#388E3C' : '#D32F2F' },
                    ]}
                  >
                    {profile?.isAvailable ? 'Disponible pour donner' : 'Non disponible'}
                  </Text>
                  <Text style={styles.availabilitySubtitle}>
                    {profile?.isAvailable
                      ? 'Vous recevez les alertes'
                      : 'Appuyez pour activer les alertes'}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={profile?.isAvailable ? '#388E3C' : '#D32F2F'}
              />
            </>
          )}
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="heart"
            value={stats.completedDonations}
            label="Dons"
            bgColor="#E8F5E9"
            color="#388E3C"
          />
          <StatCard
            icon="time"
            value={stats.pendingResponses}
            label="En attente"
            bgColor="#FFF3E0"
            color="#F57C00"
          />
          <StatCard
            icon="checkmark-circle"
            value={stats.acceptedResponses}
            label="Acceptés"
            bgColor="#E3F2FD"
            color="#1976D2"
          />
        </View>

        {/* Main Content with Human Silhouette */}
        <View style={styles.mainContent}>
          {/* Human Silhouette */}
          <View style={styles.humanContainer}>
            <Image source={human} style={styles.human} resizeMode="contain" />
          </View>

          {/* Info Cards */}
          <View style={styles.infoColumn}>
            <InfoCard
              label="Groupe"
              value={bloodGroupDisplay}
            />
            <InfoCard
              label="Sexe"
              value={getSexeLabel(profile?.sexe)}
            />
            <InfoCard
              label="Age"
              value={`${calculateAge(profile?.dateBirth)} ans`}
            />
            <InfoCard
              label="Dernier don"
              value={formatDate(profile?.lastGive)}
            />
            <InfoCard
              label="Dossier médical"
              icon="document-text"
              onPress={() => {
                if (profile?.historiqueMedical) {
                  Alert.alert('Dossier médical', profile.historiqueMedical);
                } else {
                  Alert.alert('Information', 'Aucun dossier médical enregistré');
                }
              }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProviderGift')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="gift-outline" size={22} color="#1976D2" />
            </View>
            <Text style={styles.actionText}>Mes dons</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_LIGHT} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('UpdateProviderProfile')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="person-outline" size={22} color="#F57C00" />
            </View>
            <Text style={styles.actionText}>Modifier le profil</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY_LIGHT} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={[styles.actionText, { color: '#D32F2F' }]}>Se déconnecter</Text>
            <Ionicons name="chevron-forward" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoText}>
            Membre depuis {formatDate(profile?.createdAt)}
          </Text>
          <Text style={styles.accountInfoEmail}>{profile?.email}</Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  headerPhone: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availabilityTextContainer: {
    marginLeft: 12,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  availabilitySubtitle: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
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
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
  },
  mainContent: {
    position: 'relative',
    marginTop: 20,
    minHeight: 380,
    marginHorizontal: 16,
  },
  humanContainer: {
    position: 'absolute',
    right: -30,
    top: 0,
    bottom: 0,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  human: {
    width: '100%',
    height: '90%',
    tintColor: COLORS.PRIMARY_RED,
    opacity: 0.9,
  },
  infoColumn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 110,
    gap: 12,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.PRIMARY_RED,
    textAlign: 'center',
  },
  documentIcon: {
    marginTop: 2,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  accountInfo: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  accountInfoText: {
    fontSize: 12,
    color: COLORS.GRAY_LIGHT,
  },
  accountInfoEmail: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
  },
});
