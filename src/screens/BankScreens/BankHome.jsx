import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';
import ButtonCustom from '../../components/ButtonCustom';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContextFirebase';
import { firestoreService } from '../../services/firestoreService';
import { alertService } from '../../services/alertService';

const { width } = Dimensions.get('window');

const BankHome = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // État pour le profil de la banque
  const [bankProfile, setBankProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // État du formulaire d'alerte
  const [formData, setFormData] = useState({
    bloodGroup: 'O',
    rhesus: '+',
    description: '',
    urgencyLevel: 'high',
  });

  // État de création d'alerte
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  // Charger le profil de la banque
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      try {
        setIsLoadingProfile(true);
        const profile = await firestoreService.getBloodBankByUid(user.uid);
        setBankProfile(profile);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        Alert.alert('Erreur', 'Impossible de charger le profil');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateAlert = async () => {
    if (!bankProfile) {
      Alert.alert('Erreur', 'Profil de la banque non chargé');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une description pour l\'alerte');
      return;
    }

    try {
      setIsCreatingAlert(true);

      await alertService.createAlert({
        bloodBankId: bankProfile.uid,
        bankName: bankProfile.name || bankProfile.username,
        bankLocation: bankProfile.location || 'Non spécifié',
        bloodGroup: formData.bloodGroup,
        rhesus: formData.rhesus,
        message: formData.description,
        urgencyLevel: formData.urgencyLevel,
      });

      Alert.alert(
        'Succès',
        'L\'alerte a été créée avec succès. Les donneurs compatibles seront notifiés.',
        [{ text: 'OK' }]
      );

      // Réinitialiser le formulaire
      setFormData({
        bloodGroup: 'O',
        rhesus: '+',
        description: '',
        urgencyLevel: 'high',
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'alerte. Veuillez réessayer.');
    } finally {
      setIsCreatingAlert(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY_RED} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Card d'information de la banque */}
        <View style={styles.bankInfoCard}>
          <View style={styles.bankInfoContent}>
            <Text style={styles.bankName} numberOfLines={1}>
              {bankProfile?.name || bankProfile?.username || 'Banque de sang'}
            </Text>
            <Text style={styles.bankEmail} numberOfLines={1}>
              {bankProfile?.email || user?.email || ''}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-outline" size={14} color={COLORS.WHITE} />
              <Text style={styles.bankLocation} numberOfLines={1}>
                {bankProfile?.location || 'Localisation non définie'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfil')}
            activeOpacity={0.7}
          >
            <Icon name="create-outline" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Titre de la section */}
        <Text style={styles.sectionTitle}>Créer une alerte de don</Text>

        {/* Ligne: Groupe sanguin et Rhésus */}
        <View style={styles.rowContainer}>
          <View style={styles.inputGroupHalf}>
            <Text style={styles.label}>Groupe sanguin</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.bloodGroup}
                onValueChange={(value) => handleInputChange('bloodGroup', value)}
                dropdownIconColor={COLORS.BLACK}
                style={styles.picker}
              >
                <Picker.Item label="O" value="O" />
                <Picker.Item label="A" value="A" />
                <Picker.Item label="B" value="B" />
                <Picker.Item label="AB" value="AB" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroupHalf}>
            <Text style={styles.label}>Rhésus</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.rhesus}
                onValueChange={(value) => handleInputChange('rhesus', value)}
                dropdownIconColor={COLORS.BLACK}
                style={styles.picker}
              >
                <Picker.Item label="Positif (+)" value="+" />
                <Picker.Item label="Négatif (-)" value="-" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Niveau d'urgence */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Niveau d'urgence</Text>
          <View style={styles.urgencyContainer}>
            {[
              { value: 'low', label: 'Faible', color: '#4CAF50' },
              { value: 'medium', label: 'Moyen', color: '#FF9800' },
              { value: 'high', label: 'Élevé', color: '#F44336' },
              { value: 'critical', label: 'Critique', color: '#9C27B0' },
            ].map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.urgencyButton,
                  formData.urgencyLevel === level.value && {
                    backgroundColor: level.color,
                    borderColor: level.color,
                  },
                ]}
                onPress={() => handleInputChange('urgencyLevel', level.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    formData.urgencyLevel === level.value && styles.urgencyButtonTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description de l'alerte</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez la situation et les besoins urgents en sang..."
            placeholderTextColor={COLORS.GRAY_LIGHT}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Aperçu du groupe sanguin */}
        <View style={styles.previewContainer}>
          <View style={styles.bloodPreviewBox}>
            <Text style={styles.bloodPreviewGroup}>{formData.bloodGroup}</Text>
            <Text style={styles.bloodPreviewRhesus}>{formData.rhesus}</Text>
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle}>Aperçu de l'alerte</Text>
            <Text style={styles.previewDescription} numberOfLines={2}>
              {formData.description || 'Ajoutez une description...'}
            </Text>
          </View>
        </View>

        {/* Bouton de création d'alerte */}
        <View style={styles.buttonContainer}>
          <ButtonCustom
            color={COLORS.PRIMARY_RED}
            title={isCreatingAlert ? 'Création en cours...' : 'Créer l\'alerte'}
            onPress={handleCreateAlert}
            disabled={isCreatingAlert}
          />
        </View>

        {/* Info sur les notifications */}
        <View style={styles.infoContainer}>
          <Icon name="information-circle-outline" size={20} color={COLORS.PRIMARY_BLUE} />
          <Text style={styles.infoText}>
            Les donneurs compatibles recevront une notification push dès la création de l'alerte.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  bankInfoCard: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bankInfoContent: {
    flex: 1,
    marginRight: 12,
  },
  bankName: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bankEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLocation: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  pickerContainer: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.BLACK,
    fontSize: 14,
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: COLORS.WHITE,
  },
  urgencyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  urgencyButtonTextActive: {
    color: COLORS.WHITE,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    lineHeight: 22,
  },
  previewContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  bloodPreviewBox: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.PRIMARY_RED,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  bloodPreviewGroup: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.WHITE,
  },
  bloodPreviewRhesus: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginLeft: 2,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 149, 185, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: COLORS.PRIMARY_BLUE,
    lineHeight: 18,
  },
});

export default BankHome;
