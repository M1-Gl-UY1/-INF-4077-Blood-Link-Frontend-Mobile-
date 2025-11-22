import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';
import ButtonCustom from '../../components/ButtonCustom';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDoctorProfile, useBloodBanks, useDoctorStats } from '../../hooks/useDoctorData';
import { doctorService } from '../../services/doctorService';
import { DOCTOR_GRADES, DOCTOR_SPECIALTIES } from '../../constants/enums';

const { width } = Dimensions.get('window');

const DoctorHome = () => {
  const navigation = useNavigation();
  const { profile, loading: profileLoading, refreshProfile } = useDoctorProfile();
  const { bloodBanks } = useBloodBanks();
  const { stats, refreshStats } = useDoctorStats();

  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bloodGroup: 'O',
    rhesus: '+',
    quantity: '1',
    urgencyLevel: 'medium',
    patientInfo: '',
    description: '',
  });

  // Récupérer le nom de la banque affiliée
  const affiliatedBank = bloodBanks.find(b => b.id === profile?.bloodBankId);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshStats()]);
    setRefreshing(false);
  }, [refreshProfile, refreshStats]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.bloodGroup || !formData.rhesus) {
      Alert.alert('Erreur', 'Veuillez sélectionner le groupe sanguin et le rhésus');
      return false;
    }

    const qty = parseInt(formData.quantity);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      Alert.alert('Erreur', 'La quantité doit être entre 1 et 10 poches');
      return false;
    }

    if (!profile?.bloodBankId) {
      Alert.alert('Erreur', 'Vous n\'êtes affilié à aucune banque de sang');
      return false;
    }

    return true;
  };

  const handleMakeRequest = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Confirmer la demande',
      `Vous allez demander ${formData.quantity} poche(s) de sang ${formData.bloodGroup}${formData.rhesus}.\n\nCette demande sera envoyée à ${affiliatedBank?.name || 'votre banque de sang'} pour validation.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setSubmitting(true);

              await doctorService.createBloodRequest({
                doctorId: profile.id,
                doctorName: profile.name || profile.username || 'Médecin',
                bloodBankId: profile.bloodBankId,
                bankName: affiliatedBank?.name || 'Banque de sang',
                bloodGroup: formData.bloodGroup,
                rhesus: formData.rhesus,
                quantity: parseInt(formData.quantity),
                urgencyLevel: formData.urgencyLevel,
                patientInfo: formData.patientInfo,
                notes: formData.description,
              });

              Alert.alert(
                'Demande envoyée',
                'Votre demande de sang a été envoyée à la banque de sang pour validation. Vous serez notifié dès qu\'elle sera traitée.',
                [{ text: 'OK' }]
              );

              // Réinitialiser le formulaire
              setFormData({
                bloodGroup: 'O',
                rhesus: '+',
                quantity: '1',
                urgencyLevel: 'medium',
                patientInfo: '',
                description: '',
              });

              // Rafraîchir les stats
              refreshStats();
            } catch (error) {
              console.error('Erreur création demande:', error);
              Alert.alert('Erreur', error.message || 'Impossible de créer la demande');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const getGradeLabel = (value) => {
    const grade = DOCTOR_GRADES?.find(g => g.value === value);
    return grade ? grade.label : value;
  };

  const getSpecialityLabel = (value) => {
    const spec = DOCTOR_SPECIALTIES?.find(s => s.value === value);
    return spec ? spec.label : value;
  };

  const getUrgencyConfig = (level) => {
    switch (level) {
      case 'low':
        return { label: 'Faible', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.1)' };
      case 'medium':
        return { label: 'Moyen', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)' };
      case 'high':
        return { label: 'Urgent', color: '#F44336', bgColor: 'rgba(244, 67, 54, 0.1)' };
      case 'critical':
        return { label: 'Critique', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.1)' };
      default:
        return { label: 'Moyen', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.1)' };
    }
  };

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
        {/* Header Card */}
        <View style={styles.doctorInfoCard}>
          <View style={styles.doctorInfoContent}>
            <View style={styles.doctorAvatar}>
              <Icon name="medical" size={24} color={COLORS.WHITE} />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName} numberOfLines={1}>
                Dr. {profile?.name || profile?.username || 'Médecin'}
              </Text>
              <Text style={styles.doctorSpeciality}>
                {getGradeLabel(profile?.grade)} - {getSpecialityLabel(profile?.speciality)}
              </Text>
              {affiliatedBank && (
                <View style={styles.hospitalBadge}>
                  <Icon name="business" size={12} color={COLORS.WHITE} />
                  <Text style={styles.hospitalName} numberOfLines={1}>
                    {affiliatedBank.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditDoctorProfile')}
          >
            <Icon name="create-outline" size={22} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="document-text" size={24} color="#1976D2" />
            <Text style={[styles.statNumber, { color: '#1976D2' }]}>{stats.totalRequests}</Text>
            <Text style={styles.statLabel}>Total demandes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="time" size={24} color="#F57C00" />
            <Text style={[styles.statNumber, { color: '#F57C00' }]}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="checkmark-circle" size={24} color="#388E3C" />
            <Text style={[styles.statNumber, { color: '#388E3C' }]}>{stats.approvedRequests}</Text>
            <Text style={styles.statLabel}>Approuvées</Text>
          </View>
        </View>

        {/* Section Titre */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nouvelle demande de sang</Text>
          <Text style={styles.sectionSubtitle}>
            La demande sera envoyée à votre banque affiliée pour validation
          </Text>
        </View>

        {/* Formulaire de demande */}
        <View style={styles.formCard}>
          {/* Groupe sanguin et Rhésus */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Groupe sanguin *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bloodGroup}
                  onValueChange={(value) => handleInputChange('bloodGroup', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                >
                  <Picker.Item label="O" value="O" />
                  <Picker.Item label="A" value="A" />
                  <Picker.Item label="B" value="B" />
                  <Picker.Item label="AB" value="AB" />
                </Picker>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Rhésus *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.rhesus}
                  onValueChange={(value) => handleInputChange('rhesus', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                >
                  <Picker.Item label="Positif (+)" value="+" />
                  <Picker.Item label="Négatif (-)" value="-" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Quantité et Urgence */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Quantité (poches) *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.quantity}
                  onValueChange={(value) => handleInputChange('quantity', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <Picker.Item key={num} label={`${num} poche${num > 1 ? 's' : ''}`} value={String(num)} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Niveau d'urgence *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.urgencyLevel}
                  onValueChange={(value) => handleInputChange('urgencyLevel', value)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.BLACK}
                >
                  <Picker.Item label="Faible" value="low" />
                  <Picker.Item label="Moyen" value="medium" />
                  <Picker.Item label="Urgent" value="high" />
                  <Picker.Item label="Critique" value="critical" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Info patient */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Information patient (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Patient 45 ans, intervention chirurgicale"
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.patientInfo}
              onChangeText={(value) => handleInputChange('patientInfo', value)}
            />
          </View>

          {/* Description/Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes additionnelles</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Informations complémentaires pour la banque de sang..."
              placeholderTextColor={COLORS.GRAY_LIGHT}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Indicateur d'urgence */}
          {formData.urgencyLevel && (
            <View style={[styles.urgencyIndicator, { backgroundColor: getUrgencyConfig(formData.urgencyLevel).bgColor }]}>
              <Icon
                name={formData.urgencyLevel === 'critical' ? 'warning' : 'information-circle'}
                size={20}
                color={getUrgencyConfig(formData.urgencyLevel).color}
              />
              <Text style={[styles.urgencyText, { color: getUrgencyConfig(formData.urgencyLevel).color }]}>
                Niveau d'urgence: {getUrgencyConfig(formData.urgencyLevel).label}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton de soumission */}
        <View style={styles.buttonContainer}>
          {submitting ? (
            <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          ) : (
            <ButtonCustom
              color={COLORS.PRIMARY_RED}
              title="Envoyer la demande"
              onPress={handleMakeRequest}
            />
          )}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          <Text style={styles.infoText}>
            Votre demande sera examinée par la banque de sang. Une fois validée,
            une alerte sera envoyée aux donneurs compatibles.
          </Text>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  doctorInfoCard: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  doctorInfoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  doctorSpeciality: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 6,
  },
  hospitalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  hospitalName: {
    color: COLORS.WHITE,
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
  },
  formCard: {
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
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: '#FAFAFA',
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.BLACK,
    marginLeft: -8,
  },
  textArea: {
    height: 100,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: '#FAFAFA',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  urgencyText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: COLORS.PRIMARY_BLUE,
    lineHeight: 18,
  },
});

export default DoctorHome;
