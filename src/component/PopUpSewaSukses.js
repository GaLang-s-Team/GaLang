import { Pressable, StyleSheet, Text, View, Image, Button } from 'react-native'
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const PopUpSewaSukses = ({ onClose }) => {
    return(
        <View style={{padding: 20}}>
            <Image source={require('../../assets/GaLang.png')} style={{width: 133, height: 189, marginLeft: 'auto', marginRight: 'auto'}}></Image>
            <Image source={require('../../assets/TulisanGaLang.png')} style={{width: 117, height: 27, marginLeft: 'auto', marginRight: 'auto'}}></Image>
            <Text style={{color: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, fontWeight: 'bold', fontSize: 16}}>Permintaanmu sedang diproses</Text>
            <Text style={{color: '#004268', marginLeft: 'auto', marginRight: 'auto', marginTop: 10, fontWeight: 'bold', fontSize: 14}}>Terima kasih telah mengajukan sewa</Text>
            <Pressable onPress={onClose} style={{marginTop: 20, backgroundColor: '#459708', padding: 15, borderRadius: 10}}><Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>OK</Text></Pressable>
        </View>
    )
}

export default PopUpSewaSukses;