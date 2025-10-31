import { useEffect } from "react";
import { View ,Text, Image, StyleSheet, FlatList} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo2 from '../assets/logo_2.png'
import adn from '../assets/adn.png'
import { bloodAlerts } from "../constants/fakealert";
import Alert from "../components/Alert";
import { COLORS } from "../constants/colors";
import NavBar from "../components/NavBar";
import { StatusBar } from 'react-native';

export default function ProviderHome() {
    useEffect(()=>{
    },[])
    
    return(<>
        <SafeAreaView style={[{backgroundColor:'#ffffffff',flex:1,paddingBottom:-17}]}>
            <View style={styles.containerTop}>
                <View style={styles.topBoardContainer}>
                <View style={styles.topBoardLeft}>
                    <Image source={logo2} style={{width:81,height:18}}/>
                    <Text style={styles.topBoardText}>Chaques don sauve une vie.La prochaine pourrait être la vôtre.Donnons ensemble, pour la vie</Text>
                </View>
                <Image source={adn} style={[styles.topBoardImage,{width:234,height:261}]}/>
            </View>
            </View>
            <FlatList
            numColumns={2}
            data={bloodAlerts}
            keyExtractor={(item,index)=>item.id.toString()}
            renderItem={({item})=>{
                return(
                    <View style={{flex:1}}>
                        <Alert bloodAlert={item}/>
                    </View>
                )
            }}
            contentContainerStyle={styles.listContainer}>
            </FlatList>
            
        </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    containerTop:{
        paddingHorizontal:20,
        paddingBottom:25,
    },
    topBoardContainer:{
        backgroundColor:'#f5f5f5ff',
        
        marginTop:20,
        padding:20,
        borderRadius:12

    },
    topBoardText:{
        fontSize:22,
        fontWeight:'900'
    },
    topBoardImage:{
        position:'absolute',
        left:160,
        top:-30,
    },
    topBoardLeft:{
        width:'70%'
    },
    listContainer:{
        backgroundColor:COLORS.GRAY_LIGTH_PLUS,
        padding:20,
        gap:15,
    }
})