import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '../config/firebase'

const Navbar = ({ route }) => {
    const { userId } = route.params;
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

    const navigation = useNavigation();
    const handleToHome = () => {
        navigation.navigate('Home', {userId: userId});
    }
    const handleToTrans = () => {
        navigation.navigate('TransaksiPenyewaan', {userId: userId});
    }
    const handleToGarasi = () => {
        navigation.navigate('Garasi', {userId: userId});
    }
    const handleToProfile = () => {
        navigation.navigate('Profil', {userId: userId});
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.menuItem} onPress={handleToHome}>
                <Ionicons name="home-outline" size={24} color="gray" />
                <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleToTrans}>
                <Ionicons name="swap-horizontal-outline" size={24} color="gray" />
                <Text style={styles.menuText}>Transaksi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleToGarasi}>
                <Ionicons name="basket-outline" size={24} color="gray" />
                <Text style={styles.menuText}>Garasi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleToProfile}>
                <Ionicons name="person-outline" size={24} color="gray" />
                <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        height: 60,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        position: 'static',
    },
    menuItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 4,
    },
});

export default Navbar;
