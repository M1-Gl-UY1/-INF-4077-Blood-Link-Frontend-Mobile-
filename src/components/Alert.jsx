import { Image, StyleSheet, View, Text} from "react-native"
import adn_pattern from "../assets/adn_pattern.png"
import {COLORS} from "../constants/colors" 

const Alert = ({bloodAlert})=>{
    return(
        <View style={styles.alert}>
            <View style={styles.bloodGroupBox}>
                <View style={styles.bloodGroupBoxTextContainer}>
                    <Text style={[styles.bloodGroupBoxText,styles.textWhite]}>{bloodAlert.blood_group}</Text>
                    <Text style={[styles.rhesus,styles.textWhite]}>{bloodAlert.rhesus}</Text>
                </View>
                <Image source={adn_pattern} style={styles.adn_pattern}/>
            </View>
            <View style={styles.bloodBoxText}>
                <Text style={styles.bloodBoxName}>{bloodAlert.bloodbank_name}</Text>
            <Text style={styles.bloodBoxLocate}>{bloodAlert.bloodbank_localisation}</Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    alert:{
        width:180,
        height:170,
        backgroundColor:'white',
        borderRadius:12,
        overflow:'hidden'
    },
    bloodGroupBox:{
        backgroundColor:COLORS.PRIMARY_RED,
        height:100,
        padding:10,
        flexDirection:'row',
        overflow:'hidden',
    },
    adn_pattern:{
        position:'relative',
    },
    bloodGroupBoxTextContainer:{
        flex:1,
        flexDirection:'row',
        position:'relative',
        top:-6
    },
    bloodGroupBoxText:{
        fontSize:72,
        fontWeight:'900'
    },
    bloodBoxText:{
        padding:7
    },
    rhesus:{
        fontSize:32,
        fontWeight:'900'
    },
    bloodBoxName:{
        fontWeight:'900'
    },
    bloodBoxLocate:{
        color:'gray'
    },
    textWhite:{
        color:'white'
    }
})

export default Alert;