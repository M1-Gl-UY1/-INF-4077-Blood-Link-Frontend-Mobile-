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
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDoctorProfile, useRequestHistory, useBloodBanks, useDoctorStats } from '../../hooks/useDoctorData';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { DOCTOR_GRADES, DOCTOR_SPECIALTIES } from '../../constants/enums';

const DoctorProfile = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { profile, loading: profileLoading, refreshProfile } = useDoctorProfile();
  const { history, loading: historyLoading, refreshHistory } = useRequestHistory();
  const { bloodBanks } = useBloodBanks();
  const { stats } = useDoctorStats();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' ou 'history'

  const affiliatedBank = bloodBanks.find(b => b.id === profile?.bloodBankId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshHistory()]);
    setRefreshing(false);
  }, [refreshProfile, refreshHistory]);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Erreur déconnexion:', error);
            }
          },
        },
      ]
    );
  };

  const getGradeLabel = (value) => {
    const grade = DOCTOR_GRADES?.find(g => g.value === value);
    return grade ? grade.label : value || 'Non défini';
  };

  const getSpecialityLabel = (value) => {
    const spec = DOCTOR_SPECIALTIES?.find(s => s.value === value);
    return spec ? spec.label : value || 'Non défini';
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'Approuvée', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)', icon: 'checkmark-circle' };
      case 'rejected':
        return { label: 'Rejetée', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.1)', icon: 'close-circle' };
      case 'cancelled':
        return { label: 'Annulée', color: '#9E9E9E', bgColor: 'rgba(158, 158, 158, 0.1)', icon: 'ban' };
      default:
        return { label: 'En attente', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)', icon: 'time' };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderHistoryItem = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>{item.bloodGroup}{item.rhesus}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.historyBody}>
          <Text style={styles.historyQuantity}>{item.quantity} poche{item.quantity > 1 ? 's' : ''}</Text>
          <Text style={styles.historyBank}>{item.bankName}</Text>
        </View>

        <Text style={styles.historyDate}>{formatDate(item.requestDate)}</Text>
      </View>
    );
  };

  const renderProfileContent = () => (
    <View style={styles.profileContent}>
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Informations personnelles</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="person-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Nom complet</Text>
            <Text style={styles.infoValue}>{profile?.name || profile?.username || 'Non défini'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="mail-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'Non défini'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="ribbon-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Grade</Text>
            <Text style={styles.infoValue}>{getGradeLabel(profile?.grade)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="medical-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Spécialité</Text>
            <Text style={styles.infoValue}>{getSpecialityLabel(profile?.speciality)}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={styles.infoIconContainer}>
            <Icon name="business-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Banque de sang affiliée</Text>
            <Text style={styles.infoValue}>{affiliatedBank?.name || 'Non définie'}</Text>
          </View>
        </View>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalRequests}</Text>
            <Text style={styles.statLabel}>Total demandes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.approvedRequests}</Text>
            <Text style={styles.statLabel}>Approuvées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.rejectedRequests}</Text>
            <Text style={styles.statLabel}>Rejetées</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditDoctorProfile')}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="create-outline" size={22} color={COLORS.PRIMARY_BLUE} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Modifier le profil</Text>
            <Text style={styles.actionSubtitle}>Mettre à jour vos informations</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.GRAY_LIGHT} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderBottomWidth: 0 }]}
          onPress={handleLogout}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: '#FFEBEE' }]}>
            <Icon name="log-out-outline" size={22} color={COLORS.PRIMARY_RED} />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: COLORS.PRIMARY_RED }]}>Déconnexion</Text>
            <Text style={styles.actionSubtitle}>Se déconnecter de l'application</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={COLORS.GRAY_LIGHT} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoryContent = () => (
    <View style={styles.historyContent}>
      {historyLoading ? (
        <View style={styles.historyLoadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_BLUE} />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Icon name="document-text-outline" size={60} color={COLORS.GRAY_LIGHT} />
          <Text style={styles.emptyHistoryTitle}>Aucun historique</Text>
          <Text style={styles.emptyHistoryText}>
            Vos demandes traitées apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
        <ActivityIndicator size="large" color={COLORS.PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

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
            colors={[COLORS.PRIMARY_BLUE]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="medical" size={40} color={COLORS.WHITE} />
          </View>
          <Text style={styles.doctorName}>Dr. {profile?.name || profile?.username || 'Médecin'}</Text>
          <Text style={styles.doctorSpeciality}>
            {getGradeLabel(profile?.grade)} - {getSpecialityLabel(profile?.speciality)}
          </Text>
          {affiliatedBank && (
            <View style={styles.hospitalBadge}>
              <Icon name="business" size={14} color={COLORS.PRIMARY_BLUE} />
              <Text style={styles.hospitalBadgeText}>{affiliatedBank.name}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Icon
              name="person-outline"
              size={20}
              color={activeTab === 'profile' ? COLORS.PRIMARY_BLUE : COLORS.GRAY_DARK}
            />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Icon
              name="time-outline"
              size={20}
              color={activeTab === 'history' ? COLORS.PRIMARY_BLUE : COLORS.GRAY_DARK}
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Historique
            </Text>
            {history.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{history.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'profile' ? renderProfileContent() : renderHistoryContent()}
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
  header: {
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  doctorSpeciality: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
  },
  hospitalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hospitalBadgeText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.PRIMARY_BLUE,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY_DARK,
  },
  activeTabText: {
    color: COLORS.PRIMARY_BLUE,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  profileContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  statsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.PRIMARY_BLUE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  actionsCard: {
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  historyContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    minHeight: 200,
  },
  historyLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  historyList: {
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bloodBadge: {
    backgroundColor: COLORS.PRIMARY_RED,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodBadgeText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  historyBody: {
    marginBottom: 8,
  },
  historyQuantity: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  historyBank: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.GRAY_LIGHT,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
});

export default DoctorProfile;
