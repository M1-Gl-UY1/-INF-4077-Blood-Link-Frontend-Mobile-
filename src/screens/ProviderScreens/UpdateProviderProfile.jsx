import {StyleSheet, View, Text,TextInput,Button} from "react-native"
import {COLORS} from "../../constants/colors" 
import ButtonCustom from "../../components/ButtonCustom"
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";


const UpdateProviderProfile = ()=>{
    
    const [date, setDate] = useState(null);
    const [isPickerVisible, setPickerVisible] = useState(false);

    const handleConfirm = (selectedDate) => {
        setDate(selectedDate);
        setPickerVisible(false);
    };

    
    const [email,setEmail] = useState('')
    const [name,setName] = useState('')
    const [sex,setSex] = useState('')
    const [blood_group,setBlood_group] = useState('')
    const [rhesus,setRhesus] = useState('')
    const [phone_number,setPhone_number] = useState('')
    const [date_birth,setDate_birth] = useState('')

    const navigation = useNavigation()
    const handleUpdate = ()=>{
        navigation.navigate('ProviderStack',{screen:'ProviderProfile'})        
    }
    return(
        <SafeAreaView style={{marginTop:60}}>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                style={styles.input}
                placeholder="Entrez votre nom"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={name}
                onChangeText={setName}
                />
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                style={styles.input}
                placeholder="Entrez votre email"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Groupe sanguin *</Text>
                <View style={styles.selectBox}>
                    <Picker
                        selectedValue={blood_group}
                        onValueChange={(itemValue, itemIndex) => setBlood_group(itemValue)}
                        dropdownIconColor={COLORS.PRIMARY_RED}
                        style={{color:'black'}}
                    >
                        <Picker.Item label="O" value="O" />
                        <Picker.Item label="A" value="A"/>
                        <Picker.Item label="B" value="B" />
                        <Picker.Item label="AB" value="AB" />
                    </Picker>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Sexe *</Text>
                <View style={styles.selectBox}>
                    <Picker
                        selectedValue={sex}
                        onValueChange={(itemValue, itemIndex) => setSex(itemValue)}
                        dropdownIconColor={COLORS.PRIMARY_RED}
                        style={{color:'black'}}
                    >
                        <Picker.Item label="Masculin" value="M" />
                        <Picker.Item label="Feminin" value="F"/>
                    </Picker>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Rhésus *</Text>
                <View style={styles.selectBox}>
                    <Picker
                        selectedValue={rhesus}
                        onValueChange={(itemValue, itemIndex) => setRhesus(itemValue)}
                        dropdownIconColor={COLORS.PRIMARY_RED}
                        style={{color:'black'}}
                    >
                        <Picker.Item label="Positif" value="+" />
                        <Picker.Item label="Négatif" value="-"/>
                    </Picker>
                </View>
            </View>
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Télephone *</Text>
                <TextInput
                keyboardType='numeric'
                style={styles.input}
                placeholder="Entrez votre numéro"
                placeholderTextColor={COLORS.GRAY_LIGHT}
                value={phone_number}
                onChangeText={setPhone_number}
                />
            </View>            
        <View style={{
            alignItems:'center'
        }}>
            <ButtonCustom
                color={COLORS.PRIMARY_BLUE}
                title={"Mettre a jour"}
                onPress={handleUpdate}
            />
        </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    selectBox:{
        height:50,
        width:'auto',
        backgroundColor:'white',
        color:'black',
        borderRadius:12,
        overflow:'hidden',
        paddingLeft:10,

        borderWidth: 1.5,
        borderColor: '#afafaf6d',
        borderRadius: 12,
    },
    inputGroup: {
        marginBottom: 20,
        marginHorizontal:15
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.BLACK,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1.5,
        borderColor: '#afafaf6d',
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 14,
        color: COLORS.BLACK,
        backgroundColor: COLORS.WHITE,
    },
})

export default UpdateProviderProfile;