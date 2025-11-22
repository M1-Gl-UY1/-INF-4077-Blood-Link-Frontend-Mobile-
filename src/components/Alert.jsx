import { Image, StyleSheet, View, Text } from "react-native";
import adn_pattern from "../assets/adn_pattern.png";
import { COLORS } from "../constants/colors";

const Alert = ({ bloodAlert }) => {
    return (
        <View style={styles.alert}>
            <View style={styles.bloodGroupBox}>
                <View style={styles.bloodGroupBoxTextContainer}>
                    <Text style={[styles.bloodGroupBoxText, styles.textWhite]}>
                        {bloodAlert.blood_group}
                    </Text>
                    <Text style={[styles.rhesus, styles.textWhite]}>
                        {bloodAlert.rhesus}
                    </Text>
                </View>
                <Image source={adn_pattern} style={styles.adn_pattern} />
            </View>
            <View style={styles.bloodBoxText}>
                <Text style={styles.bloodBoxName} numberOfLines={1}>
                    {bloodAlert.bloodbank_name}
                </Text>
                <Text style={styles.bloodBoxLocate} numberOfLines={1}>
                    {bloodAlert.bloodbank_localisation}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    alert: {
        flex: 1,
        aspectRatio: 180 / 170, // Garde les proportions parfaites
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bloodGroupBox: {
        backgroundColor: COLORS.PRIMARY_RED,
        flex: 0.6, // 60% de la hauteur
        padding: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    adn_pattern: {
        width: 40,
        height: 40,
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: [{ translateY: -20 }],
    },
    bloodGroupBoxTextContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    bloodGroupBoxText: {
        fontSize: 48, // Réduit pour le responsive
        fontWeight: '900',
        lineHeight: 45,
    },
    bloodBoxText: {
        flex: 1,
        padding: 12,
        paddingTop: 8,
        justifyContent: 'center',
    },
    rhesus: {
        fontSize: 24, // Réduit pour le responsive
        fontWeight: '900',
        marginLeft: 4,
    },
    bloodBoxName: {
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 2,
    },
    bloodBoxLocate: {
        fontSize: 14,
        color: 'gray',
    },
    textWhite: {
        color: 'white',
        includeFontPadding: false,
    },
});

export default Alert;