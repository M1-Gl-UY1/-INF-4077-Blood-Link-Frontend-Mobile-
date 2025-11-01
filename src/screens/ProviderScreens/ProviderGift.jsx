import { Text, StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import GiftCard from "../../components/GiftCard";
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";

// Données de dons réussis
const successfulGifts = [
    {
        id: '1',
        bloodGroup: 'O',
        rhesus: '+',
        bankName: 'Banque de sang Hopital central',
        location: 'Yaoundé, Cameroun'
    },
    {
        id: '2',
        bloodGroup: 'A',
        rhesus: '+',
        bankName: 'Banque de sang Hopital central',
        location: 'Yaoundé, Cameroun'
    },
    {
        id: '3',
        bloodGroup: 'B',
        rhesus: '+',
        bankName: 'Banque de sang Hopital central',
        location: 'Yaoundé, Cameroun'
    },
    {
        id: '4',
        bloodGroup: 'AB',
        rhesus: '+',
        bankName: 'Banque de sang Hopital central',
        location: 'Yaoundé, Cameroun'
    },
    {
        id: '5',
        bloodGroup: 'O',
        rhesus: '-',
        bankName: 'Banque de sang Hopital central',
        location: 'Yaoundé, Cameroun'
    },
    {
        id: '6',
        bloodGroup: 'A',
        rhesus: '-',
        bankName: 'Banque de sang Hopital central',
        location: 'Yaoundé, Cameroun'
    },
];

export default function ProviderGift() {
    const navigation = useNavigation();

    const renderGift = ({ item }) => (
        <View style={styles.cardWrapper}>
            <GiftCard 
                bloodGroup={item.bloodGroup}
                rhesus={item.rhesus}
                bankName={item.bankName}
                location={item.location}
            />
        </View>
    );

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
                <Text style={styles.headerTitle}>Dons réussi</Text>
                <View style={styles.headerRight}>
                    <Icon name="gift" size={24} color={COLORS.PRIMARY_RED} />
                </View>
            </View>

            {/* Liste des dons */}
            <FlatList
                numColumns={2}
                data={successfulGifts}
                keyExtractor={(item) => item.id}
                renderItem={renderGift}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.rowWrapper}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                ListFooterComponent={<View style={styles.listFooter} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
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
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.BLACK,
    },
    headerRight: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    listContainer: {
        padding: 16,
        paddingTop: 20,
        backgroundColor: COLORS.WHITE,
    },
    rowWrapper: {
        justifyContent: 'space-between',
    },
    cardWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    itemSeparator: {
        height: 15,
    },
    listFooter: {
        height: 20,
    },
});