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
import { Snackbar } from 'react-native-paper'; // Import Snackbar
import RNPickerSelect from 'react-native-picker-select';

const Signup = () => {
    let [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_700Bold,
    });

    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false)
    const [inputs, setInputs] = useState({
        fullname: { value: '', isValid: true },
        email: { value: '', isValid: true },
        password: { value: '', isValid: true },
        role: { value: '', isValid: true },
    })

    const [snackbarVisible, setSnackbarVisible] = useState(false); // State untuk menampilkan Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Pesan yang akan ditampilkan di Snackbar
    const [snackVisible, setSnackVisible] = useState(false); // State untuk menampilkan Snackbar
    const [snackMessage, setSnackMessage] = useState(''); // Pesan yang akan ditampilkan di Snackbar

    const handleRegister = async () => {
        // Object dataRegister yang datanya didapatkan dari state inputs
        const dataRegister = {
            fullname: inputs.fullname.value,
            email: inputs.email.value,
            password: inputs.password.value,
            role: inputs.role.value,
        };

        const emailIsValid = inputs.email.value.trim() !== "";
        const fullnameIsValid = inputs.fullname.value.trim() !== "";
        const passwordIsValid = inputs.password.value.trim() !== "";
        const roleIsValid = inputs.role.value.trim() !== "";

        if (!emailIsValid || !passwordIsValid || !fullnameIsValid || !roleIsValid) {
            setInputs((currentInputs) => ({
                email: { value: currentInputs.email.value, isValid: emailIsValid },
                fullname: { value: currentInputs.fullname.value, isValid: fullnameIsValid },
                password: { value: currentInputs.password.value, isValid: passwordIsValid },
                role: { value: currentInputs.role.value, isValid: roleIsValid },
            }));

            setSnackbarMessage('Please, check your input'); // Set pesan untuk Snackbar
            setSnackbarVisible(true); // Tampilkan Snackbar
            return;
        }

        // Jika semua input valid ubah state isLoading menjadi true
        setIsLoading(true);
        try {
            const success = await createUserWithEmailAndPassword(firebaseAuth, dataRegister.email, dataRegister.password);
            const userId = success.user.uid;
            const id_pengguna = success.user.uid;
            console.log(userId);

            await sendEmailVerification(firebaseAuth.currentUser)
            setSnackMessage("Email Verifikasi Terkirim");
            setSnackVisible(true)

            const docRef = {
                userId: userId,
                email: dataRegister.email,
                fullname: dataRegister.fullname,
                role: dataRegister.role,
            };

            const docRefRole = {
                id_pengguna: id_pengguna,
                email: dataRegister.email,
                nama: dataRegister.fullname,
                kota: "",
                provinsi: "",
                telepon: "",
                alamat: ""
            };

            console.log("docRef Created : ", docRef.role);

            // Conditional Witing Berdasarkan Role 
            // console.log("Penyewaaa",role);
            await setDoc(doc(firestore, "users", userId), docRef);
            if (docRef.role === 'Penyewa'){
                await setDoc(doc(firestore, "penyewa", id_pengguna), docRefRole)
            }else if (docRef.role === 'Penyedia') {
                await setDoc(doc(firestore, "penyedia", id_pengguna), docRefRole)
            }
            console.log("Document set in Firestore");
            console.log("Register Success");
            setSnackMessage("Register success please login");
            setSnackVisible(true)
            navigation.replace('Signin')
        } catch (error) {
            const errorMessage = error.message;
            setSnackbarMessage(errorMessage); // Set pesan untuk Snackbar
            setSnackbarVisible(true); // Tampilkan Snackbar
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
                    <Ionicons name="person-outline" size={24} color="gray" />
                    <TextInput
                        style={{ flex: 1, paddingLeft: 15 }}
                        placeholder='Enter Fullname'
                        label={"Fullname"}
                        invalid={!inputs.fullname.isValid}
                        onChangeText={inputChangeHandler.bind(this, 'fullname')}
                    />
                </View>
                <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 10, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center', }}>
                    <Ionicons name="people-outline" size={24} color="gray" />
                    <View style={{ flex: 1, alignItems: 'flex-end', }}>
                        <RNPickerSelect
                            onValueChange={(value) => inputChangeHandler('role', value)}
                            items={[
                                { label: 'Penyewa', value: 'Penyewa' },
                                { label: 'Penyedia', value: 'Penyedia' },
                            ]}
                            placeholder={{ label: 'Select Role', value: null }}
                            style={{
                                ...pickerSelectStyles,
                                placeholder: {
                                    color: 'gray',
                                    fontSize: 15,
                                },
                            }}
                        />
                    </View>
                </View>
                <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 10, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail-outline" size={24} color="gray" />
                    <TextInput
                        style={{ flex: 1, paddingLeft: 15 }}
                        placeholder='Enter Email'
                        label={"Email"}
                        invalid={!inputs.email.isValid}
                        onChangeText={inputChangeHandler.bind(this, 'email')}
                    />
                </View>
                <View style={{ width: 297, height: 51, borderWidth: 1, borderRadius: 8, marginHorizontal: 'auto', marginTop: 10, paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        <Ionicons name={hidePassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="gray" />
                    </TouchableOpacity>
                    <TextInput
                        style={{ flex: 1, paddingLeft: 15 }}
                        placeholder='Enter Password'
                        label={"Password"}
                        secureTextEntry={hidePassword}
                        invalid={!inputs.password.isValid}
                        onChangeText={inputChangeHandler.bind(this, 'password')}
                    />
                </View>
                <Button children={'Sign Up'} onPress={handleRegister} />
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: '#004268' }}>Already Have An Account?</Text>
                    <TouchableOpacity onPress={handleSignIn}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#004268', marginLeft: 5 }}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Snackbar untuk menampilkan pesan error */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={{ marginBottom: "2%", backgroundColor: '#ff0e0e', justifyContent: 'center', borderRadius: 29, marginBottom: '3%' }}
            >
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {snackbarMessage}
                </Text>
            </Snackbar>

            {/* Snackbar untuk menampilkan pesan berhasil */}
            <Snackbar
                visible={snackVisible}
                onDismiss={() => setSnackVisible(false)}
                duration={2000}
                style={{ marginBottom: "2%", backgroundColor: 'green', justifyContent: 'center', borderRadius: 29, marginBottom: '3%' }}
            >
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
                    {snackMessage}
                </Text>
            </Snackbar>
        </View>
    );
};

export default Signup;

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEFDE2',
    },
    banner: {
        marginTop: '-10%',
        marginHorizontal: 'auto',
        marginBottom: 30
    },
    form: {
        width: 338,
        height: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        marginBottom: 'auto',
        marginHorizontal: 'auto',
        shadowColor: "#000",
        shadowOffset: {
            height: -20
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
    label: {
        fontSize: 15,
        color: 'gray',
        paddingLeft: 15
    },
    selected: {
        fontSize: 15,
        paddingLeft: 30,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 15,
        paddingHorizontal: 10,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    placeholder: {
        color: 'gray',
        fontSize: 15,
    },
});
