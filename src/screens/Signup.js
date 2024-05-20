import { Pressable, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image'
import { Link } from 'expo-router';
import React, { useState } from 'react'
import Button from '../component/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'
import { Toast } from 'react-native-toast-notifications';
import { firebaseAuth, firestore } from '../config/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const Signup = () => {
    let [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });

    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)
    const [inputs, setInputs] = useState({
        fullname : {value: '', isValid: true},
        email: {value: '', isValid: true},
        password: { value: '', isValid: true },
    })

    const handleRegister = async () => {

    // Object dataRegister yang datanya didapatkan dari state inputs
        const dataRegister = {
            fullname: inputs.fullname.value,
            email: inputs.email.value,
            password: inputs.password.value,
        };

        const emailIsValid = inputs.email.value.trim() !== "";
        const fullnameIsValid = inputs.fullname.value.trim() !== "";
        const passwordIsValid = inputs.password.value.trim() !== "";

        if (!emailIsValid || !passwordIsValid || !fullnameIsValid ) {
        setInputs((currentInputs) => ({
            email: { value: currentInputs.email.value, isValid: emailIsValid },
            fullname: { value: currentInputs.fullname.value, isValid: fullnameIsValid },
            password: { value: currentInputs.password.value, isValid: passwordIsValid },
        }));

        console.log(inputs);
        console.log(fullnameIsValid);
        console.log(emailIsValid);
        console.log(passwordIsValid);

        Toast.show("Check your input", {
            duration: 3000,
            placement: 'bottom',
            type: 'danger',
        });
        return;
    }

    // Jika semua input valid ubah state isLoading menjadi true
    setIsLoading(true);
    try {
        const success = await createUserWithEmailAndPassword(firebaseAuth, dataRegister.email, dataRegister.password);
        const userId = success.user.uid;

        await sendEmailVerification(firebaseAuth.currentUser)
        Toast.show("Email verifikasi terkirim", {
            duration: 3000,
            placement: 'bottom',
            type: 'success',
        });

        const docRef = {
            userId: userId,
            email: dataRegister.email,
            fullname: dataRegister.fullname,
        };

        await setDoc(doc(firestore, "users", userId), docRef);


        console.log("Register Success");

        Toast.show("Register success please login", {
            duration: 3000,
            placement: 'bottom',
            type: 'success',
        });
        navigation.replace('Home')
        } catch (error) {
        const errorMessage = error.message;
        Toast.show(errorMessage, {
        duration: 3000,
        placement: 'bottom',
        type: 'danger',
        });
    }
    };

    const inputChangeHandler = (inputIdentifier, enteredValue) => {
        setInputs((currentInputs) => {
            return {
                ...currentInputs,
                [inputIdentifier]: { value: enteredValue, isValid: true }
            }
        })
    }

    const [hidePassword, setHidePassword] = useState(true);
    const togglePasswordVisibility = () => {
            setHidePassword(!hidePassword);
    };

    return (
        <View style={style.container}>
            <View>
                <Image source={require('../../assets/abstrack.svg')} contentFit='fill' style={{width:400, height:210,shadowColor: '#003049'}}/>
            </View>
            <View style={style.banner}>
                <Image source={require('../../assets/GaLang.png')} contentFit='fill' style={{width:105, height:149}}/>
            </View>
            <View style={{ marginBottom: 20}}>
                <Text style={{ marginHorizontal: 'auto', fontWeight:'bold', color: '#459708', fontSize: 29 }}>Welcome !</Text>
                <Text style={{ marginHorizontal: 'auto', fontWeight:'700', color: '#459708', fontSize: 20 }}>Let’s Sign In To Explore More</Text>
            </View>
            <View style={style.form}>
                {/* Button Sign In or Sign Up */}
                <TextInput style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 19 , paddingHorizontal: 15, borderColor: '#C2C2C2'}} placeholder='Enter Fullname' label={"Fullname"} invalid={!inputs.fullname.isValid} onChangeText = {inputChangeHandler.bind(this, 'fullname')}></TextInput>
                <TextInput style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto',marginTop: 19, paddingHorizontal: 15, borderColor: '#C2C2C2'}} placeholder='Enter Email' label={"Email"} invalid={!inputs.email.isValid} onChangeText= {inputChangeHandler.bind(this, 'email')}></TextInput>
                <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 20, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        <Ionicons name={hidePassword ? 'eye-outline' : 'eye-off-outline'} size={24} color="gray" />
                    </TouchableOpacity>
                    <TextInput
                        style={{ flex: 1, paddingLeft:15 }}
                        placeholder='Enter Password'
                        label={"Password"}
                        secureTextEntry={hidePassword}
                        invalid={!inputs.password.isValid}
                        onChangeText={inputChangeHandler.bind(this, 'password')}
                    />
                </View>
                <View style={{ marginVertical: 1 }}>
                    {/* Check box */}
                    
                    <Text style = {{ paddingLeft: 50, fontSize:12, fontWeight:'bold', color: '#459708' }}>remember me</Text>
                </View>
                <Button children={'Sign In'} onPress={handleRegister}/>
                <Text style={style.text}>Already have an account ? <Text style={{ fontWeight:'bold' }}>Sign In</Text></Text>
            </View>
        </View>
    );
};

export default Signup;

const style= StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEFDE2',
        
    },
    banner :{
        marginTop: '-10%',
        marginHorizontal: 'auto',
        marginBottom: 30
    },
    form : {
        width: 338,
        height: 336,
        backgroundColor:'#FFFFFF',
        borderRadius: 28,
        marginBottom: 'auto',
        marginHorizontal: 'auto',
        shadowColor: "#000",
        shadowOffset:{
            height: -20
        },
        shadowOpacity: 0.10,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text:{
        marginHorizontal:'auto',
    }, 
    buttonSwitch : {
        marginTop: 20,
        marginHorizontal: 'auto',
        width: 297,
        height: 56,
        backgroundColor: '#EA7504',
        borderRadius: 8,
    }, 
    buttonLinear : {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: 297,
        height: 56,
        top: 0,
        borderRadius: 8,
    }

});