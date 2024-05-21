import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Navbar = ({  }) => {
    const navigation = useNavigation();
    const handleToHome = () => {
        navigation.navigate('Home');
    }
    const handleToTrans = () => {
        navigation.navigate('Signin');
    }
    const handleToTas = () => {
        navigation.navigate('Home');
    }
    const handleToProfile = () => {
        navigation.navigate('Home');
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
            <TouchableOpacity style={styles.menuItem} onPress={handleToTas}>
                <Ionicons name="basket-outline" size={24} color="gray" />
                <Text style={styles.menuText}>Tas</Text>
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
