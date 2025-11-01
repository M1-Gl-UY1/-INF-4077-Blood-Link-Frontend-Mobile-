import { Text, StyleSheet, View, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userData } from "../../constants/fakeUser";
import dayjs from "dayjs";
import { COLORS } from "../../constants/colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import human from '../../assets/human.png';
import { useNavigation } from "@react-navigation/native";

export default function ProviderProfile() {
    const last_give = dayjs(userData.last_give).format('DD/MM/YY');
    const age = dayjs().diff(dayjs(userData.date_birth), 'year');
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header avec nom et téléphone */}
                <View style={styles.headerCard}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{userData.name}</Text>
                        <Text style={styles.headerPhone}>{userData.phone_number}</Text>
                    </View>
                    <Pressable 
                        onPress={() => navigation.navigate('UpdateProviderProfile')}
                        style={styles.editButton}
                    >
                        <Ionicons name="create" size={24} color="white" />
                    </Pressable>
                </View>

                {/* Zone principale avec silhouette et informations */}
                <View style={styles.mainContent}>
                    {/* Silhouette humaine */}
                    <View style={styles.humanContainer}>
                        <Image source={human} style={styles.human} resizeMode="contain" />
                    </View>

                    {/* Informations à gauche */}
                    <View style={styles.infoColumn}>
                        {/* Groupe sanguin */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Groupe</Text>
                            <Text style={styles.infoValue}>{userData.blood_group}</Text>
                        </View>

                        {/* Sexe */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Sexe</Text>
                            <Text style={styles.infoValue}>{userData.sex}</Text>
                        </View>

                        {/* Age */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Age</Text>
                            <Text style={styles.infoValue}>{age} ans</Text>
                        </View>

                        {/* Dernier don */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Dernier don</Text>
                            <Text style={styles.infoValue}>{last_give}</Text>
                        </View>

                        {/* Dossier médical */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Dossier</Text>
                            <Text style={styles.infoLabel}>médicale</Text>
                            <Ionicons name="document-text" color={COLORS.PRIMARY_RED} size={28} style={styles.documentIcon} />
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    content: {
        flex: 1,
        paddingTop: 16,
    },
    headerCard: {
        marginHorizontal: 16,
        backgroundColor: COLORS.PRIMARY_BLUE,
        borderRadius: 12,
        padding: 16,
        paddingHorizontal: 16,
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
    headerInfo: {
        flex: 1,
    },
    headerName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    headerPhone: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    editButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        position: 'relative',
        marginTop: 20,
    },
    humanContainer: {
        position: 'absolute',
        right: -20,
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
    },
    infoColumn: {
        position: 'absolute',
        left: 20,
        top: 0,
        width: 120,
        gap: 16,
    },
    infoCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 8,
        padding: 10,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 70,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.BLACK,
        textAlign: 'center',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.PRIMARY_RED,
        textAlign: 'center',
    },
    documentIcon: {
        marginTop: 4,
    },
});