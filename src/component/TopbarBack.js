import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

export default function TopbarBack({navigation, title}) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#51B309', '#459708']} style={styles.container}/>
      <View style={styles.backButton}>
        <Link href='/'>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name='arrow-back' size={24} color='#5E5F60' />
          </TouchableOpacity>
        </Link>
      </View>
      <View style={{width:'100%', height:100, alignItems:'center', justifyContent:'center', position:'absolute'}}>
        <Text style={{color:'#FFFFFF', fontWeight:'bold', fontSize:21}}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    height: 100,
    marginBottom: 15,
    borderBottomLeftRadius:15,
    borderBottomRightRadius:15,
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    left: 15,
    padding: 5,
  },
});