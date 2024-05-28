import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { firebaseAuth, firestore } from '../config/firebase';
import { destroyKey } from '../config/localStorage';
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import Navbar from '../component/Navbar';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const Profil = ({ navigation, route }) => {
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

    useEffect(() => {
        setIsLoading(true);
        const docRef = doc(firestore, "users", userId);
        getDoc(docRef).then((doc) => {
            setDataUsers(doc.data());
        }).finally(() => {
            setIsLoading(false);
        });
    }, [isFocused, userId]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null,
        });
    }, [isFocused, userId]);
    

    return (
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
                    source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <View style={{ alignItems: 'center', marginTop: 9 }}>
                    {dataUsers ? (
                        <>
                            <Text style={{ textAlign: 'center', fontSize: 20, color: '#004268' }}>{dataUsers.fullname}</Text>
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
                    onPress={() => navigation.navigate('UpdateProfile', {
                        userId: userId,
                        fullname: dataUsers.fullname,
                        imageUri: dataUsers.imageUri,
                        gender: dataUsers.gender,
                    })}
                >
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#ffffff' }}>Edit Profil</Text>
                </TouchableOpacity>
            </View>

            <Text style={{ marginLeft: '10%', marginTop: '10%', fontSize: 20, fontWeight: 'bold', color: '#004268', textAlign: 'justify' }}>Profile</Text>
            <ScrollView>
                <View style={{ marginLeft: '10%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#E4E7C9', borderRadius: 10 }}>
                        <Ionicons name="person-outline" style={{ paddingLeft: 10, color: '#459708' }} size={24} color="gray" />
                        <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>{dataUsers.fullname}</Text>
                    </View>
                </View>
                <View style={{ marginLeft: '10%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#E4E7C9', borderRadius: 10 }}>
                        <Ionicons name="mail-outline" style={{ paddingLeft: 10, color: '#459708' }} size={24} color="gray" />
                        <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>{dataUsers.email}</Text>
                    </View>
                </View>
                <View style={{ marginLeft: '10%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#E4E7C9', borderRadius: 10 }}>
                        <Ionicons name="male-female" style={{ paddingLeft: 10, color: '#459708' }} size={24} color="gray" />
                        <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>{dataUsers.gender ? 'Laki-laki' : 'Perempuan'}</Text>
                    </View>
                </View>
                <View style={{ marginLeft: '10%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#E4E7C9', borderRadius: 10 }}>
                        <Ionicons name="male-female" style={{ paddingLeft: 10, color: '#459708' }} size={24} color="gray" />
                        <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>{dataUsers.gender ? 'Laki-laki' : 'Perempuan'}</Text>
                    </View>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: '10%' }}>
                    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', height: 45, width: 100, paddingHorizontal: 8, paddingVertical: 4, marginTop: 35, backgroundColor: '#DD310C', borderRadius: 10 }} onPress={handleLogout}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#ffffff' }}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Navbar route={route} />
        </View>
    );
};

export default Profil;
