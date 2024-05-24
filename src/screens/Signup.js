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
import Checkbox from 'expo-checkbox';

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

        // console.log(inputs);
        // console.log(fullnameIsValid);
        // console.log(emailIsValid);
        // console.log(passwordIsValid);

        // Toast.show("Check your input", {
        //     duration: 3000,
        //     placement: 'bottom',
        //     type: 'danger',
        // });
        return;
    }

    // console.log(dataRegister);

    // Jika semua input valid ubah state isLoading menjadi true
    setIsLoading(true);
    try {
        const success = await createUserWithEmailAndPassword(firebaseAuth, dataRegister.email, dataRegister.password);
        const userId = success.user.uid;
        console.log(userId);
        

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

        console.log("docRef Created : ",docRef);

        await setDoc(doc(firestore, "users", userId), docRef);
        console.log("Document set in Firestore");

        console.log("Register Success");

        // Toast.show("Register success please login", {
        //     duration: 3000,
        //     placement: 'bottom',
        //     type: 'success',
        // });
        navigation.replace('Signin')
        } catch (error) {
        const errorMessage = error.message;
        // Toast.show(errorMessage, {
        // duration: 3000,
        // placement: 'bottom',
        // type: 'danger',
        // });
        } finally {
            setIsLoading(false);
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

    const [isChecked, setChecked] = useState(false);
    const handleSignIn = () => {
        navigation.navigate('Signin');
    };

    return (
        <View style={style.container}>
            <View>
                <Image source={require('../../assets/abstrack.svg')} contentFit='fill' style={{width:'auto', height:210,shadowColor: '#003049'}}/>
            </View>
            <View style={style.banner}>
                <Image source={require('../../assets/GaLang.png')} contentFit='fill' style={{width:105, height:149}}/>
            </View>
            <View style={{ marginBottom: 20}}>
                <Text style={{ marginHorizontal: 'auto', fontWeight:'bold', color: '#459708', fontSize: 29 }}>Welcome !</Text>
                <Text style={{ marginHorizontal: 'auto', fontWeight:'700', color: '#459708', fontSize: 20 }}>Let’s Sign In To Explore More</Text>
            </View>
            <View style={style.form}>
                    <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 20, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="person-outline" size={24} color="gray" style={{ marginRight: 10, }} />
                        <TextInput
                            style={{ flex: 1, paddingLeft:15 }}
                            placeholder='Enter Fullname'
                            label={"Fullname"}
                            invalid={!inputs.fullname.isValid}
                            onChangeText={inputChangeHandler.bind(this, 'fullname')}
                        />
                    </View>
                    <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 10, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="mail-outline" size={24} color="gray" style={{ marginRight: 10, }} />
                        <TextInput
                            style={{ flex: 1, paddingLeft:15 }}
                            placeholder='Enter Email'
                            label={"Email"}
                            invalid={!inputs.email.isValid}
                            onChangeText={inputChangeHandler.bind(this, 'email')}
                        />
                    </View>
                    <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 10, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={togglePasswordVisibility}>
                            <Ionicons name={hidePassword ? 'eye-off-outline' : 'eye-outline' } size={24} color="gray" />
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
                <View style={{ marginVertical: 1,flexDirection: 'row', alignItems: 'center', marginTop: 15, marginHorizontal: 20, }}>
                    {/* Check box */}
                    <Checkbox value={isChecked} onValueChange={setChecked} style={{ marginRight:10 }} color={isChecked ? '#459708' : undefined}/>
                    <Text style = {{ paddingLeft: 15, fontSize:12, fontWeight:'bold', color: '#459708' }}>remember me</Text>
                </View>
                <Button children={'Sign Up'} onPress={handleRegister}/>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#004268' }}>Already Have An Account?</Text>
                        <TouchableOpacity onPress={handleSignIn}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#004268', marginLeft: 5 }}>Sign In</Text>
                        </TouchableOpacity>
                </View>
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