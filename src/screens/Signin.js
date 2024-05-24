import { Pressable, StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import Button from '../component/Button';
import { useFonts } from 'expo-font';
import { Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { useNavigation } from '@react-navigation/native';
import { Toast } from 'react-native-toast-notifications';
import { firebaseAuth, firestore } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { getKey, storeKey } from '../config/localStorage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Checkbox from 'expo-checkbox';

const Signin = () => {
    let [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });

    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [inputs, setInputs] = useState({
        email: { value: '', isValid: true },
        password: { value: '', isValid: true },
    });

    useEffect(() => {
        getKey('LOGGED_IN').then(res => {
            const data = res;
            console.log("data : ", data);
            if (data) {
                navigation.replace('Home', { userId: data });
            }
        });
    }, []);

    const handleSignUp = () => {
        navigation.navigate('Signup');
    };

    const handleLogin = async () => {
        const dataLogin = {
            email: inputs.email.value,
            password: inputs.password.value,
        };

        const emailIsValid = inputs.email.value.trim() !== '';
        const passwordIsValid = inputs.password.value.trim() !== '';

        if (!emailIsValid || !passwordIsValid) {
            setInputs((currentInputs) => ({
                email: { value: currentInputs.email.value, isValid: emailIsValid },
                password: { value: currentInputs.password.value, isValid: passwordIsValid },
            }));
            // Toast.show('Please, check your input', {
            //     duration: 2000,
            //     placement: 'bottom',
            //     type: 'danger',
            // });
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, dataLogin.email, dataLogin.password);
            const userId = userCredential.user.uid;
            const emailVerified = userCredential.user.emailVerified;
            console.log(userId)

            if (!emailVerified) {
                // Toast.show('Email belum terverifikasi', {
                //     duration: 3000,
                //     placement: 'bottom',
                //     type: 'danger',
                // });
                return;
            } else {
                storeKey('LOGGED_IN', userId);
                navigation.replace('Home', { userId: userId });
            }
        } catch (error) {
            const errorMessage = error.message;
            // Toast.show(errorMessage, {
            //     duration: 3000,
            //     placement: 'bottom',
            //     type: 'danger',
            // });
        } finally {
            setIsLoading(false);
        }
    };

    const inputChangeHandler = (inputIdentifier, enteredValue) => {
        setInputs((currentInputs) => {
            return {
                ...currentInputs,
                [inputIdentifier]: { value: enteredValue, isValid: true },
            };
        });
    };

    const [hidePassword, setHidePassword] = useState(true);
    const togglePasswordVisibility = () => {
        setHidePassword(!hidePassword);
    };

    const [isChecked, setChecked] = useState(false);

    return (
        <View style={style.container}>
            <View>
                <Image source={require('../../assets/abstrack.svg')} contentFit='fill' style={{ width: 'auto', height: 210, shadowColor: '#003049' }} />
            </View>
            <View style={style.banner}>
                <Image source={require('../../assets/GaLang.png')} contentFit='fill' style={{ width: 105, height: 149 }} />
            </View>
            <View style={{ marginBottom: 20 }}>
                <Text style={{ marginHorizontal: 'auto', fontWeight: 'bold', color: '#459708', fontSize: 29 }}>Welcome !</Text>
                <Text style={{ marginHorizontal: 'auto', fontWeight: '700', color: '#459708', fontSize: 20 }}>Let’s Sign In To Explore More</Text>
            </View>
            <View style={style.form}>
                <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 20, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="mail-outline" size={24} color="gray" style={{ marginRight: 10, }} />
                        <TextInput
                            style={{ flex: 1, paddingLeft:15 }}
                            placeholder='Enter Email'
                            label={"Email"}
                            invalid={!inputs.email.isValid}
                            onChangeText={inputChangeHandler.bind(this, 'email')}
                        />
                    </View>
                    <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 20, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
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
                <Button children={'Sign In'} onPress={handleLogin} />
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#004268' }}>Don't Have An Account?</Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#004268', marginLeft: 5 }}>Create Account</Text>
                        </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Signin;

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEFDE2',
    },
    banner: {
        marginTop: '-10%',
        marginHorizontal: 'auto',
        marginBottom: 30,
    },
    form: {
        width: 338,
        height: 283,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        marginBottom: 'auto',
        marginHorizontal: 'auto',
        shadowColor: "#000",
        shadowOffset: {
            height: -20,
        },
        shadowOpacity: 0.10,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        marginHorizontal: 'auto',
    },
    buttonSwitch: {
        marginTop: 20,
        marginHorizontal: 'auto',
        width: 297,
        height: 56,
        backgroundColor: '#EA7504',
        borderRadius: 8,
    },
    buttonLinear: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: 297,
        height: 56,
        top: 0,
        borderRadius: 8,
    },
});
