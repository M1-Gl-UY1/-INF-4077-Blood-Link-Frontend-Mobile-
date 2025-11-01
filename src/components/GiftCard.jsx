import { Image, StyleSheet, View, Text } from "react-native";
import adn_pattern from "../assets/adn_pattern.png";
import { COLORS } from "../constants/colors";
import Icon from 'react-native-vector-icons/FontAwesome';

const GiftCard = ({ bloodGroup, rhesus, bankName, location }) => {
    return (
        <View style={styles.card}>
            <View style={styles.bloodGroupBox}>
                {/* Badge bookmark */}
                <View style={styles.bookmarkBadge}>
                    <Icon name="bookmark" size={24} color="#FFD700" />
                </View>
                
                <View style={styles.bloodGroupBoxTextContainer}>
                    <Text style={[styles.bloodGroupBoxText, styles.textWhite]}>
                        {bloodGroup}
                    </Text>
                    <Text style={[styles.rhesus, styles.textWhite]}>
                        {rhesus}
                    </Text>
                </View>
                <Image source={adn_pattern} style={styles.adn_pattern} />
            </View>
            <View style={styles.bloodBoxText}>
                <Text style={styles.bloodBoxName} numberOfLines={1}>
                    {bankName}
                </Text>
                <Text style={styles.bloodBoxLocate} numberOfLines={1}>
                    {location}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        aspectRatio: 155 / 170,
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
        flex: 0.6,
        padding: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    bookmarkBadge: {
        position: 'absolute',
        top: 0,
        left: 12,
        zIndex: 10,
    },
    adn_pattern: {
        width: 40,
        height: 40,
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: [{ translateY: -20 }],
        opacity: 0.3,
    },
    bloodGroupBoxTextContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 8,
    },
    bloodGroupBoxText: {
        fontSize: 48,
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
        fontSize: 24,
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

export default GiftCard;