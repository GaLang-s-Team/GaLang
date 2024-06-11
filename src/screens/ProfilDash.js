import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { firebaseAuth, firestore } from '../config/firebase';
import { destroyKey } from '../config/localStorage';
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Dropdown from '../component/Dropdown';
import NavDash from '../component/NavDash';

const ProfilDash = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataUsers, setDataUsers] = useState([]);
    const isFocused = useIsFocused();

    const handleLogout = () => {
        signOut(firebaseAuth).then(() => {
            destroyKey();
            navigation.replace('Signin');
        });
    };

    const { userId } = route.params;
    const id_pengguna = userId;

    useEffect(() => {
        setIsLoading(true);
        const docRef = doc(firestore, "penyedia", id_pengguna);
        getDoc(docRef).then((doc) => {
            setDataUsers(doc.data());
        }).finally(() => {
            setIsLoading(false);
        });
    }, [isFocused, userId, dataUsers]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null,
        });
    }, [isFocused, userId, dataUsers]);
    

    return (
        <>        
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Image 
                source={require('../../assets/Abstrackprof.png')} 
                style={{ width: '100%', height: 199, position: 'absolute', top: 0, left: 0 }} 
            />
            
            <Text style={{ position: 'absolute', top: '6%', alignSelf: 'center', fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
                Profile
            </Text>

            <View style={{ marginTop: "27%", alignItems: 'center', zIndex: 1 }}>
                <Image
                    source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.nama}` }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <View style={{ alignItems: 'center', marginTop: 9 }}>
                    {dataUsers ? (
                        <>
                            <Text style={{ textAlign: 'center', fontSize: 20, color: '#004268' }}>{dataUsers.nama}</Text>
                        </>
                    ) : (
                        <Text style={{ color: '#FFAC33', fontSize: 25, fontWeight: '600' }}>Loading...</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={{
                        justifyContent: 'center',
                        height: 40,
                        width: 109,
                        alignItems: 'center',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginTop: 10,
                        backgroundColor: '#459708',
                        borderRadius: 50,
                    }}
                    onPress={() => navigation.navigate('UpdateProfileDash', {
                        userId: userId,
                        fullname: dataUsers.nama,
                        imageUri: dataUsers.imageUri,
                        gender: dataUsers.gender,
                        nomorTelp: dataUsers.telepon,
                        provinsi: dataUsers.provinsi,
                        kota: dataUsers.kota
                    })}
                >
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#ffffff' }}>Edit Profil</Text>
                </TouchableOpacity>
            </View>

            <Text style={{ marginLeft: '10%', marginTop: '5%', fontSize: 20, fontWeight: 'bold', color: '#004268', textAlign: 'justify' }}>Profile</Text>
                <ScrollView>
                <View style={{ marginHorizontal: 'auto' }}>
                    <View style={styles.tags}>
                            <Image source={require('../../assets/Profile.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.nama}</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 'auto' }}>
                    <View style={styles.tags}>
                            <Image source={require('../../assets/Email.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.email}</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 'auto' }}>
                    <View style={styles.tags}>
                            <Image source={require('../../assets/gender.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.gender ? 'Laki-laki': 'Perempuan'}</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 'auto' }}>
                    <View style={styles.tags}>
                            <Image source={require('../../assets/Phone.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.telepon}</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 'auto' }}>
                    <View style={styles.tags}>
                            <Image source={require('../../assets/Province.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.provinsi}</Text>
                    </View>
                </View>
                <View style={{ marginHorizontal: 'auto' }}>
                    <View style={styles.tags}>
                            <Image source={require('../../assets/City.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.kota}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.tags, {marginBottom:10}]} onPress={handleLogout}>
                            <Image source={require('../../assets/Logout.png')}
                                // source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                                style={{ width: 39, height: 39, borderRadius: 50 }}
                            />
                            <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>Log Out</Text>
                </TouchableOpacity>
                </ScrollView>

        </View>
        <NavDash route={route} />
        </>
    );
};

export default ProfilDash;

const styles = StyleSheet.create({
    tags : {
        flexDirection: 'row', 
        alignItems: 'center', 
        height: 59, 
        width: 332, 
        paddingHorizontal: 15, 
        paddingVertical: 4, 
        marginTop: 15, 
        marginHorizontal: 'auto',
        backgroundColor: 'white', 
        borderRadius: 10, 
        shadowColor: "#000",
        shadowOffset:{
            height: -20
        },
        shadowOpacity: 0.10,
        shadowRadius: 3.84,
        elevation: 5,
    }
})
