import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '../config/firebase'

const NavDash = ({ route }) => {
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
      navigation.navigate('Dashboard', {userId: userId});
    }
    const handleToTrans = () => {
      navigation.navigate('TransaksiReview', {userId: userId});
    }
    const handleToRiwayat = () => {
      navigation.navigate('Dashboard', {userId: userId});
    }
    const handleToProfile = () => {
      navigation.navigate('ProfilDash', {userId: userId});
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
            <TouchableOpacity style={styles.menuItem} onPress={handleToRiwayat}>
                <Ionicons name="basket-outline" size={24} color="gray" />
                <Text style={styles.menuText}>Riwayat</Text>
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

export default NavDash;
