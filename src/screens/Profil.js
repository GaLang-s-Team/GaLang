import React,{ useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth'
import { firebaseAuth, firestore } from '../config/firebase'
import { destroyKey, getKey } from '../config/localStorage'
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native'
import Navbar from '../component/Navbar';

const Profil = ({navigation, route}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataUsers, setDataUsers] = useState([]);
    const isFocused = useIsFocused();

    const handleLogout = () => {
        signOut(firebaseAuth).then(() => {
            destroyKey()
            navigation.replace('Signin')
        })
    }

    const { userId } = route.params;

    useEffect(() => {
        setIsLoading(true)
        const docRef = doc(firestore, "users", userId)
        getDoc(docRef).then((doc) => {
        setDataUsers(doc.data())
        }).finally(() => {
        setIsLoading(false)
        })
    }, [userId])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null
        })
    }, [isFocused, userId])

    // Render Semua Komponen 
    return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View>
              <Image source={require('../../assets/abstrack.svg')} contentFit='fill' style={{ width: 'auto', height: 199, shadowColor: '#003049' }} />
          </View>
          
          <View style={{ marginLeft: '4%' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 20, left: 5, borderRadius: 50, backgroundColor: '#FFFFFF', padding: 10 }}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={{ marginTop: '10%', fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}>Profile</Text>
          <View style={{ flexDirection: 'column', alignItems: 'center', marginTop:'2%'}}>
                    <Image
                        source={{ uri: dataUsers.imageUri ? dataUsers.imageUri : `https://ui-avatars.com/api/?name=${dataUsers.fullname}` }}
                        style={{ position: 'relative', marginTop: 4, width: 80, height: 80, borderRadius: 50 }}
                    />
                    <View style={{ flexDirection: 'column', marginTop: 9 }}>
                        {dataUsers ? (<Text style={{textAlign: 'center', fontSize: 18, color: '#004268' }}>{dataUsers.fullname}</Text>) :(<Text style={{ color: '#FFAC33', fontSize: 25, fontWeight: '600' }}>Loading...</Text>)}
                        {dataUsers ? (<Text style={{ marginTop: 2, fontSize: 20, fontWeight: '500', color: '#004268' }}>{dataUsers.email}</Text>) : (<Text style={{ color: '#FFAC33', fontSize: 25, fontWeight: '600' }}>Loading...</Text>)}
                    </View>
                    <TouchableOpacity style={{ justifyContent: 'center',
                                        height: 40, width: 109,
                                        alignItems: 'center',
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        marginTop: 20,
                                        backgroundColor: '#459708',
                                        borderRadius: 50,}}
                                        onPress={() => navigation.navigate('update-profile', {
                                        userId: userId,
                                        fullname: dataUsers.fullname,
                                        imageUri: dataUsers.imageUri,
                    })}>

                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#ffffff' }}>Edit Profil</Text>
                                </TouchableOpacity>
            </View>

            <Text style={{ marginLeft: '10%', marginTop: '10%', fontSize: 20, fontWeight: 'bold', color: '#004268', textAlign: 'justify' }}>Profile</Text>

        <View style={{ marginLeft: '10%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#E4E7C9', borderRadius: 10, }}>
                    <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268', }}>{dataUsers.fullname}</Text>
            </View>
            {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#FFC97A', borderRadius: 10,  borderColor: '#FFAC33', borderWidth: 1 }}>
                    <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>{dataUsers.gender === true ? 'Laki-laki' : 'Perempuan'}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 52, width: 310, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#FFC97A', borderRadius: 10,  borderColor: '#FFAC33', borderWidth: 1 }}>
                    <Text style={{ paddingLeft: 20, fontSize: 15, fontWeight: 'bold', color: '#004268' }}>{dataUsers.alamat}</Text>
            </View> */}
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom:'20%'}}>
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', height: 52, width: 100, paddingHorizontal: 8, paddingVertical: 4, marginTop: 15, backgroundColor: '#DD310C', borderRadius: 10, }} onPress={handleLogout}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#ffffff' }}>Log Out</Text>
            </TouchableOpacity>
        </View>
      <Navbar route={route}/>
    </View>
    )
}

export default Profil;