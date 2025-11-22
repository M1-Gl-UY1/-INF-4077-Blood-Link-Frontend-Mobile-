import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContextFirebase';
import { alertService } from '../services/alertService';
import { providerService } from '../services/providerService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import adn_pattern from '../assets/adn_pattern.png';

dayjs.extend(relativeTime);
dayjs.locale('fr');

const AlertDetails = ({ route }) => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const { bloodAlert } = route.params;

  const [loading, setLoading] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [checkingResponse, setCheckingResponse] = useState(true);
  const [responseStatus, setResponseStatus] = useState(null);

  // Vérifier si le provider a déjà répondu
  useEffect(() => {
    const checkExistingResponse = async () => {
      if (!user?.uid || !bloodAlert?.id) {
        setCheckingResponse(false);
        return;
      }

      try {
        const responded = await alertService.hasProviderRespondedToAlert(bloodAlert.id, user.uid);
        setHasResponded(responded);

        if (responded) {
          // Récupérer le statut de la réponse
          const responses = await providerService.getProviderResponses(user.uid);
          const myResponse = responses.find(r => r.alertId === bloodAlert.id);
          if (myResponse) {
            setResponseStatus(myResponse.status);
          }
        }
      } catch (error) {
        console.error('Erreur vérification réponse:', error);
      } finally {
        setCheckingResponse(false);
      }
    };

    checkExistingResponse();
  }, [user?.uid, bloodAlert?.id]);

  const getUrgencyConfig = (level) => {
    switch (level) {
      case 'low':
        return { label: 'Faible', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.15)', icon: 'leaf' };
      case 'medium':
        return { label: 'Moyen', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.15)', icon: 'alert-circle' };
      case 'high':
        return { label: 'Urgent', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.15)', icon: 'warning' };
      case 'critical':
        return { label: 'CRITIQUE', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.15)', icon: 'flash' };
      default:
        return { label: 'Urgent', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.15)', icon: 'warning' };
    }
  };

  const getResponseStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente de confirmation', color: '#FF9800', icon: 'time' };
      case 'accepted':
        return { label: 'Votre don a été accepté', color: '#2196F3', icon: 'checkmark-circle' };
      case 'completed':
        return { label: 'Don effectué avec succès', color: '#4CAF50', icon: 'checkmark-done-circle' };
      case 'cancelled':
        return { label: 'Réponse annulée', color: '#F44336', icon: 'close-circle' };
      default:
        return { label: 'Statut inconnu', color: '#9E9E9E', icon: 'help-circle' };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(date).format('DD MMMM YYYY à HH:mm');
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dayjs(date).fromNow();
  };

  const handleRespondToAlert = () => {
    if (!profile) {
      Alert.alert('Erreur', 'Veuillez compléter votre profil avant de répondre aux alertes.');
      return;
    }

    Alert.alert(
      'Confirmer votre réponse',
      `Vous confirmez vouloir donner du sang ${bloodAlert.bloodGroup}${bloodAlert.rhesus} ?\n\nVotre nom et vos coordonnées seront partagés avec la banque de sang.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setLoading(true);

              await alertService.createAlertResponse({
                alertId: bloodAlert.id,
                providerId: user.uid,
                providerName: profile.name || profile.username || 'Donneur',
                providerPhone: profile.phoneNumber,
                notes: null,
              });

              setHasResponded(true);
              setResponseStatus('pending');

              Alert.alert(
                'Merci pour votre générosité !',
                'Votre réponse a été envoyée. La banque de sang vous contactera pour confirmer le rendez-vous.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Erreur réponse alerte:', error);
              Alert.alert('Erreur', error.message || 'Impossible de répondre à cette alerte');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const urgency = getUrgencyConfig(bloodAlert.urgencyLevel);
  const responseConfig = responseStatus ? getResponseStatusConfig(responseStatus) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY_RED} />

      {/* Header avec groupe sanguin */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>

        <View style={styles.bloodGroupContainer}>
          <Text style={styles.bloodGroup}>{bloodAlert.bloodGroup}</Text>
          <Text style={styles.rhesus}>{bloodAlert.rhesus}</Text>
        </View>

        <Image source={adn_pattern} style={styles.adnPattern} />

        {/* Badge d'urgence */}
        <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
          <Icon name={urgency.icon} size={16} color={urgency.color} />
          <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info initiateur */}
        <View style={styles.initiatorCard}>
          <View style={styles.initiatorHeader}>
            <Icon
              name={bloodAlert.initiatedBy === 'doctor' ? 'medical' : 'business'}
              size={24}
              color={COLORS.PRIMARY_BLUE}
            />
            <Text style={styles.initiatorTitle}>
              {bloodAlert.initiatedBy === 'doctor' ? 'Demande médicale' : 'Alerte de la banque'}
            </Text>
          </View>

          {bloodAlert.initiatedBy === 'doctor' ? (
            <View style={styles.initiatorDetails}>
              <View style={styles.infoRow}>
                <Icon name="person" size={18} color={COLORS.GRAY_DARK} />
                <Text style={styles.infoText}>Dr. {bloodAlert.doctorName || 'Médecin'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="business" size={18} color={COLORS.GRAY_DARK} />
                <Text style={styles.infoText}>{bloodAlert.hospitalName || bloodAlert.bankName}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.initiatorDetails}>
              <View style={styles.infoRow}>
                <Icon name="business" size={18} color={COLORS.GRAY_DARK} />
                <Text style={styles.infoText}>{bloodAlert.bankName}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Informations de la banque */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Banque de sang</Text>
          <View style={styles.bankInfo}>
            <View style={styles.infoRow}>
              <Icon name="business-outline" size={20} color={COLORS.PRIMARY_RED} />
              <Text style={styles.bankName}>{bloodAlert.bankName}</Text>
            </View>
            {bloodAlert.bankLocation && (
              <View style={styles.infoRow}>
                <Icon name="location-outline" size={20} color={COLORS.GRAY_DARK} />
                <Text style={styles.locationText}>{bloodAlert.bankLocation}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Message de l'alerte */}
        <View style={styles.messageCard}>
          <Text style={styles.cardTitle}>Message</Text>
          <Text style={styles.messageText}>
            {bloodAlert.message || 'Besoin urgent de don de sang. Votre aide peut sauver des vies.'}
          </Text>
        </View>

        {/* Statistiques */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Icon name="calendar-outline" size={24} color={COLORS.PRIMARY_BLUE} />
            <Text style={styles.statLabel}>Publiée</Text>
            <Text style={styles.statValue}>{formatTimeAgo(bloodAlert.alertDate)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="people-outline" size={24} color={COLORS.PRIMARY_RED} />
            <Text style={styles.statLabel}>Réponses</Text>
            <Text style={styles.statValue}>{bloodAlert.responseCount || 0}</Text>
          </View>
        </View>

        {/* Date complète */}
        <Text style={styles.dateText}>
          Créée le {formatDate(bloodAlert.alertDate)}
        </Text>

        {/* Statut de la réponse si déjà répondu */}
        {hasResponded && responseConfig && (
          <View style={[styles.responseStatusCard, { borderColor: responseConfig.color }]}>
            <Icon name={responseConfig.icon} size={28} color={responseConfig.color} />
            <View style={styles.responseStatusContent}>
              <Text style={[styles.responseStatusTitle, { color: responseConfig.color }]}>
                Vous avez répondu à cette alerte
              </Text>
              <Text style={styles.responseStatusText}>{responseConfig.label}</Text>
            </View>
          </View>
        )}

        {/* Spacer pour le bouton */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton d'action fixe */}
      <View style={styles.actionContainer}>
        {checkingResponse ? (
          <ActivityIndicator size="small" color={COLORS.PRIMARY_RED} />
        ) : hasResponded ? (
          <View style={styles.respondedContainer}>
            <Icon name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.respondedText}>Réponse envoyée</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.respondButton, loading && styles.respondButtonDisabled]}
            onPress={handleRespondToAlert}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <>
                <Icon name="heart" size={22} color={COLORS.WHITE} />
                <Text style={styles.respondButtonText}>Répondre à l'appel</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.PRIMARY_RED,
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 10,
  },
  bloodGroup: {
    fontSize: 80,
    fontWeight: '900',
    color: COLORS.WHITE,
  },
  rhesus: {
    fontSize: 50,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginBottom: 10,
    marginLeft: 4,
  },
  adnPattern: {
    position: 'absolute',
    right: -40,
    top: 20,
    width: 180,
    height: 200,
    opacity: 0.3,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  initiatorCard: {
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
  initiatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  initiatorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY_BLUE,
  },
  initiatorDetails: {
    gap: 8,
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
  },
  bankInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.BLACK,
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.BLACK,
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  messageCard: {
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
  messageText: {
    fontSize: 15,
    color: COLORS.BLACK,
    lineHeight: 22,
  },
  statsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginTop: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.GRAY_LIGHT,
    textAlign: 'center',
    marginTop: 8,
  },
  responseStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    gap: 12,
  },
  responseStatusContent: {
    flex: 1,
  },
  responseStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  responseStatusText: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY_RED,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  respondButtonDisabled: {
    opacity: 0.7,
  },
  respondButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  respondedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  respondedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#388E3C',
  },
});

export default AlertDetails;
