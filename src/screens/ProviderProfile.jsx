import { Text,StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "../components/NavBar";

export default function ProviderProfile() {
    return(
    <SafeAreaView style={[{paddingBottom:-17},styles.container]}>
        <View style={styles.content}>
            <Text>prifle</Text>
        </View>
    </SafeAreaView>)
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        height:'100%',
        position:'relative'
    },

})