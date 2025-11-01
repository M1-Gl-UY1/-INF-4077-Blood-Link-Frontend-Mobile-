import { useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo2 from '../../assets/logo_2.png'
import adn from '../../assets/adn.png'
import { bloodAlerts } from "../../constants/fakealert";
import Alert from "../../components/Alert";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";

export default function ProviderHome() {
    const navigation = useNavigation()

    const renderAlert = ({ item }) => (
        <Pressable 
            style={styles.alertWrapper}
            onPress={() => navigation.navigate('AlertDetails', { bloodAlert: item })}
        >
            <Alert bloodAlert={item} />
        </Pressable>
    )

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.containerTop}>
                <View style={styles.topBoardContainer}>
                    <View style={styles.topBoardLeft}>
                        <Image source={logo2} style={styles.logo} />
                        <Text style={styles.topBoardText}>
                            Chaques don sauve une vie. La prochaine pourrait être la vôtre. Donnons ensemble, pour la vie
                        </Text>
                    </View>
                    <Image source={adn} style={styles.topBoardImage} />
                </View>
            </View>
            
            <FlatList
                numColumns={2}
                data={bloodAlerts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAlert}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.rowWrapper}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                ListFooterComponent={<View style={styles.listFooter} />}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    containerTop: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    topBoardContainer: {
        backgroundColor: '#f5f5f5ff',
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        position: 'relative',
    },
    topBoardLeft: {
        width: '70%',
    },
    logo: {
        width: 81,
        height: 18,
    },
    topBoardText: {
        fontSize: 22,
        fontWeight: '900',
        marginTop: 12,
    },
    topBoardImage: {
        position: 'absolute',
        right: -20,
        top: -30,
        width: 234,
        height: 261,
    },
    listContainer: {
        backgroundColor: COLORS.GRAY_LIGTH_PLUS,
        padding: 16,
        flexGrow: 1,
    },
    rowWrapper: {
        justifyContent: 'space-between',
    },
    alertWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    itemSeparator: {
        height: 15,
    },
    listFooter: {
        height: 40,
    },
});