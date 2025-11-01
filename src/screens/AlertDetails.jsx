import { Image, StyleSheet, View, Text} from "react-native"
import adn_pattern from "../assets/adn_pattern.png"
import {COLORS} from "../constants/colors" 
import ButtonCustom from "../components/ButtonCustom"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const AlertDetails = ({route})=>{
    const {bloodAlert} = route.params
    const handleAnswerAlert = ()=>{
        console.log('ok');
        
    }

    dayjs.extend(relativeTime);
    dayjs.locale("fr");
    
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
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View>
                        <Text style={styles.bloodBoxName}>{bloodAlert.bloodbank_name}</Text>
                        <Text style={styles.bloodBoxLocate}>{bloodAlert.bloodbank_localisation}</Text>
                    </View>
                    <Text style={{color:COLORS.GRAY_LIGHT}}>{dayjs(bloodAlert.created_date).fromNow()}</Text>
                </View>
                <Text style={{marginTop:20,}}>{bloodAlert.description}</Text>
                <ButtonCustom title="Répondre a l'appel" onPress={handleAnswerAlert} color={COLORS.PRIMARY_RED}/>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    alert:{
        width:'auto',
        height:'aut0',
        backgroundColor:'white',
        overflow:'hidden'
    },
    bloodGroupBox:{
        backgroundColor:COLORS.PRIMARY_RED,
        height:300,
        padding:20,
        flexDirection:'row',
        overflow:'hidden',
        alignItems:'center',
        justifyContent:'center'
    },
    adn_pattern:{
        position:'relative',
        width:200,
        height:210
    },
    bloodGroupBoxTextContainer:{
        flex:1,
        flexDirection:'row',
        position:'relative',
        top:-6
    },
    bloodGroupBoxText:{
        fontSize:100,
        fontWeight:'900',
        marginLeft:30
    },
    bloodBoxText:{
        padding:20
    },
    rhesus:{
        fontSize:72,
        fontWeight:'900'
    },
    bloodBoxName:{
        fontWeight:'900'
    },
    bloodBoxLocate:{
        color:'gray',
        fontWeight:700
    },
    textWhite:{
        color:'white'
    }
})

export default AlertDetails;