import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '../config/firebase'
import { destroyKey, getKey } from '../config/localStorage'

export default function Topback ({nama, userId}) {
    const [dataUsers, setDataUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true)
        const docRef = doc(firestore, "users", userId)
        getDoc(docRef).then((doc) => {
        setDataUsers(doc.data())
        }).finally(() => {
        setIsLoading(false)
        })
    }, [userId]);

    return (
        <View style={styles.container}>
        <LinearGradient colors={['#51B309', '#459708']} style={{ shadowColor: '#000',shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 5, width: '100%', height: 184, borderBottomLeftRadius:15, borderBottomRightRadius:15, }}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: '5%', marginTop: '10%', marginBottom: 20 }}>
                <Image
                    source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                    style={{ position: 'relative', width: 60, height: 60, borderRadius: 50 }}
                />
                <View style={{ flexDirection: 'column', marginLeft: 16 }}>
                <Text style={{ fontSize: 18, color: 'white' }}>Welcome Back</Text>
                <Text style={{ marginTop: 2, fontSize: 20, fontWeight: '600', color: 'white' }}>{nama}</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginRight: '5%' }}>
                    <TouchableOpacity>
                        <Ionicons name="settings-outline" size={24} color="white" style={{ marginRight: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color="white" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ borderRadius: 30, marginHorizontal: 'auto', paddingHorizontal: 15, borderColor: '#C2C2C2', flexDirection: 'row', alignItems: 'center', height: 48, width: 335, backgroundColor: '#FFFFFF' }}>
                            <Ionicons name="search-outline" size={24} color="gray" style={{ marginRight: 10, }} />
                            
                            <TextInput
                                style={{ flex: 1, paddingLeft:15 }}
                                placeholder='Search Your Gear'
                                label={"Search"}
                                // invalid={!inputs.email.isValid}
                                // onChangeText={inputChangeHandler.bind(this, 'email')}
                            />
            </View>
        </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        width: '100%',
        height: 184,
        borderBottomLeftRadius:15,
        borderBottomRightRadius:15,
    },
});
