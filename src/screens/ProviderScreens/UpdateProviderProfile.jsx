import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";
import ButtonCustom from "../../components/ButtonCustom";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons';

const UpdateProviderProfile = () => {
    const navigation = useNavigation();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        sex: 'Masculin',
        blood_group: 'A',
        rhesus: 'Positif',
        date_birth: '',
        phone_number: '',
    });

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleUpdate = () => {
        console.log('Mise à jour du profil:', formData);
        navigation.navigate('ProviderStack', { screen: 'ProviderProfile' });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={COLORS.BLACK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mettre a jour le profile</Text>
                <View style={styles.headerRight}>
                    <Icon name="fitness" size={24} color={COLORS.PRIMARY_RED} />
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Nom utilisateur */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nom utilisateur *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom"
                        placeholderTextColor={COLORS.GRAY_LIGHT}
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                    />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={COLORS.GRAY_LIGHT}
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Ligne: Sexe, Groupe sanguin, Rhésus */}
                <View style={styles.rowContainer}>
                    <View style={[styles.inputGroup, styles.smallInput]}>
                        <Text style={styles.label}>Sexe</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.sex}
                                onValueChange={(value) => handleInputChange('sex', value)}
                                dropdownIconColor={COLORS.BLACK}
                                style={styles.picker}
                            >
                                <Picker.Item label="Masculin" value="Masculin" />
                                <Picker.Item label="Féminin" value="Féminin" />
                            </Picker>
                        </View>
                    </View>

                    <View style={[styles.inputGroup, styles.smallInput]}>
                        <Text style={styles.label}>Groupe sanguin</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.blood_group}
                                onValueChange={(value) => handleInputChange('blood_group', value)}
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

                    <View style={[styles.inputGroup, styles.smallInput]}>
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

                {/* Ligne: Naissance et Téléphone */}
                <View style={styles.rowContainer}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Naissance *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="mm/dd/yyyy"
                            placeholderTextColor={COLORS.GRAY_LIGHT}
                            value={formData.date_birth}
                            onChangeText={(value) => handleInputChange('date_birth', value)}
                        />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Téléphone *</Text>
                        <View style={styles.phoneContainer}>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Téléphone"
                                placeholderTextColor={COLORS.GRAY_LIGHT}
                                value={formData.phone_number}
                                onChangeText={(value) => handleInputChange('phone_number', value)}
                                keyboardType="phone-pad"
                            />
                            <View style={styles.flagContainer}>
                                <Text style={styles.flag}>🇨🇲</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bouton de mise à jour */}
                <View style={styles.buttonContainer}>
                    <ButtonCustom
                        color={COLORS.PRIMARY_RED}
                        title="Mettre à jour"
                        onPress={handleUpdate}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
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
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.BLACK,
    },
    headerRight: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
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
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        color: COLORS.BLACK,
        backgroundColor: COLORS.WHITE,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    smallInput: {
        flex: 1,
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
    phoneContainer: {
        position: 'relative',
    },
    phoneInput: {
        height: 50,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingRight: 50,
        fontSize: 14,
        color: COLORS.BLACK,
        backgroundColor: COLORS.WHITE,
    },
    flagContainer: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: COLORS.PRIMARY_RED,
        alignSelf: 'center',
        marginTop: 7,
    },
    flag: {
        fontSize: 18,
    },
    buttonContainer: {
        marginTop: 30,
        width: '100%',
        alignItems: 'center',
    },
});

export default UpdateProviderProfile;