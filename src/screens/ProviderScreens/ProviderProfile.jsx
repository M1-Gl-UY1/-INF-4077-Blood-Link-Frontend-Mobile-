import { Text,StyleSheet, View, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userData } from "../../constants/fakeUser";
import dayjs from "dayjs";
import { COLORS } from "../../constants/colors";
import Ionicons from "react-native-vector-icons/Ionicons"
import human from '../../assets/human.png'
import { useNavigation } from "@react-navigation/native";

export default function ProviderProfile() {
    const last_give = new Date(userData.last_give).toLocaleDateString()
    const navigation = useNavigation()
    return(
    <SafeAreaView style={[{paddingBottom:-17},styles.container]}>
        <View style={styles.content}>
            <View style={[styles.pastilleTop,{flexDirection:'row',justifyContent:'space-between'}]}>
                <View>
                    <Text style={{color:'white',fontWeight:'bold'}}>{userData.name}</Text>
                    <Text style={{color:'white',fontWeight:'bold'}}>{userData.phone_number}</Text>
                </View>
                <Pressable onPress={()=>navigation.navigate('UpdateProviderProfile')}>
                    <Ionicons name="create" size={32} style={{color:'white'}}></Ionicons>
                </Pressable>
            </View>
            <View style={{position:'relative'}}>
                <Image source={human} style={styles.human}/>
            </View>
            <View style={{gap:20, paddingLeft:20,marginTop:50}}>
                <View style={styles.pastilleInfos}>
                    <Text style={[styles.boldFont]}>Group</Text>
                    <Text style={[styles.boldFont,styles.primaryRedFont]}>{userData.blood_group}</Text>
                </View>
                <View style={styles.pastilleInfos}>
                    <Text style={[styles.boldFont]}>Sexe</Text>
                    <Text style={[styles.boldFont,styles.primaryRedFont]}>{userData.sex}</Text>
                </View>
                <View style={styles.pastilleInfos}>
                    <Text style={[styles.boldFont]}>Age</Text>
                    <Text style={[styles.boldFont,styles.primaryRedFont]}>{dayjs().diff(dayjs(userData.date_birth), 'year')}</Text>
                </View>
                <View style={styles.pastilleInfos}>
                    <Text style={[styles.boldFont]}>Dernier Don</Text>
                    <Text style={[styles.boldFont,styles.primaryRedFont]}>{last_give}</Text>
                </View>
                <View style={styles.pastilleInfos}>
                    <Text style={[styles.boldFont]}>Dossier medicale</Text>
                    <Ionicons name="document-text" style={[styles.primaryRedFont]} size={32}></Ionicons>
                </View>
            </View>
        </View>
    </SafeAreaView>)
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        height:'100%',
        position:'relative'
    },
    pastilleTop:{
        width:'auto',
        marginHorizontal:20,
        padding:15,
        paddingHorizontal:25,
        backgroundColor:COLORS.PRIMARY_BLUE,
        color:'blue',
        borderRadius:8
    },
    pastilleInfos:{
        backgroundColor:'#ffffffff',
        width:100,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        padding:5,
        borderWidth:2,
        borderColor:'#d2d2d2ff'
    },

    boldFont:{
        fontWeight:'900'
    },
    primaryRedFont:{
        color:COLORS.PRIMARY_RED,
        fontSize:26,
    },
    human:{
        position:'absolute',
        width:350,
        height:700,
        left:100,
        top:50
    }
})