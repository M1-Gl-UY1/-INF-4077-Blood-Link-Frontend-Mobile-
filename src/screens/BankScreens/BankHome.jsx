import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';
import ButtonCustom from '../../components/ButtonCustom';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BankHome = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: 'Hopital central',
    email: 'hopitalcentral@gmail.com',
    location: 'location',
    bloodGroup: 'A',
    rhesus: 'Positif',
    description: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateAlert = () => {
    console.log('Création d\'alerte:', formData);
    // Logique de création d'alerte
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card d'information de la banque */}
        <View style={styles.bankInfoCard}>
          <View style={styles.bankInfoContent}>
            <Text style={styles.bankName}>{formData.name}</Text>
            <Text style={styles.bankEmail}>{formData.email}</Text>
            <Text style={styles.bankLocation}>{formData.location}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfil')}
          >
            <Icon name="create" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Ligne: Groupe sanguin et Rhésus */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
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

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Rhésus</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.rhesus}
                onValueChange={(value) => handleInputChange('rhesus', value)}
                dropdownIconColor={COLORS.BLACK}
                style={styles.picker}
              >
                <Picker.Item label="Positif" value="Positif" />
                <Picker.Item label="Négatif" value="Négatif" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Description"
            placeholderTextColor={COLORS.GRAY_LIGHT}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* Bouton de création d'alerte */}
        <View style={styles.buttonContainer}>
          <ButtonCustom
            color={COLORS.PRIMARY_RED}
            title="crée une alerte"
            onPress={handleCreateAlert}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  bankInfoCard: {
    backgroundColor: COLORS.PRIMARY_BLUE,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankInfoContent: {
    flex: 1,
  },
  bankName: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bankEmail: {
    color: COLORS.WHITE,
    fontSize: 14,
    marginBottom: 2,
  },
  bankLocation: {
    color: COLORS.WHITE,
    fontSize: 14,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  pickerContainer: {
    height: 50,
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
  textArea: {
    height: 180,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    padding: 8,
  },
});

export default BankHome;