import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { collection, doc, addDoc, query, where, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

import TopbarBack from '../component/TopbarBack';
import { firestore, storage } from '../config/firebase';
import { FlatList } from 'react-native-gesture-handler';
import NavDash from '../component/NavDash';
import { set } from 'firebase/database';

export default function HistoryPenyewaan({ navigation, route }) {
  const { userId } = route.params;

  const [transaksi, setTransaksi] = useState([]);
  const [peralatan, setPeralatan] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const transaksiRef = collection(firestore, 'informasi_penyewaan');
        const queryTransaksi = query(transaksiRef, where('penyedia', '==', userId), where('status', '==', 'Selesai'));
        const snapshotTransaksi = await getDocs(queryTransaksi);

        if (!snapshotTransaksi.empty) {
          const transaksiInfo = snapshotTransaksi.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          let daftarPeralatan =[];

          for (let i = 0; i < transaksiInfo.length; i++) {
            const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', transaksiInfo[i].peralatan));
            const peralatanDoc = await getDocs(peralatanRef);
            if (peralatanDoc) {
              const peralatan = peralatanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              daftarPeralatan.push(peralatan[0]);
            }
          }
          
          setPeralatan(daftarPeralatan);
          setTransaksi(transaksiInfo);
        } else {
          console.log('No such transaksi!');
        }
      }
      catch (error) {
        console.error('Error fetching transaksi:', error);
      }
      
      setLoading(false);
    }

    fetchData();
  }, [isFocused]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: null
    });
  }, [isFocused]);

  const renderItem = ({ peralatan, transaksi }) => {
    const image = peralatan.find(i => i.id_peralatan === transaksi.peralatan).foto.split(',')[0];
    const name = peralatan.find(i => i.id_peralatan === transaksi.peralatan).nama;

    return (
      <View style={styles.card}>
        <Image source={{ uri:image }} style={styles.image} />
        <View style={styles.itemTextContainer}>
            <Text style={[styles.itemTitle]}>{name}</Text>
            <Text style={[styles.itemDescription]}>Ukuran : {transaksi.ukuran}</Text>
            <Text style={[styles.itemDescription]}>Jumlah : {transaksi.jumlah}</Text>
            <Text style={[styles.itemDescription]}>Pengambilan : {transaksi.pengambilan}</Text>
            <Text style={[styles.itemDescription]}>Pengembalian : {transaksi.pengembalian}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopbarBack navigation={navigation} title={'Riwayat Sewa'}/>
      <View style={{flex:1}}>
        { !loading && peralatan.length != 0 && (
          <FlatList
            data={transaksi}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderItem({ peralatan: peralatan, transaksi: item })}
            contentContainerStyle={{paddingHorizontal: 20}}
          />
        )}
        { !loading && peralatan.length == 0 && (
          <View style={{flex:1, justifyContent:'center'}}>
            <Text style={{textAlign:'center', color:'#004268', fontSize:16, fontWeight:'semibold'}}>Belum ada transaksi penyewaan</Text>
          </View>
        )}
      </View>
      <NavDash route={route}/>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    fontWeight: 'bold',
    color: '#004268',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#004268',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  activityIndicatorWrapper: {
    backgroundColor: 'transparent',
    height: 100,
    width: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    elevation: 1,
},
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    color: '#004268',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 18,
  },
  itemDescription: {
    color: '#666',
    fontSize: 13,
    marginLeft: 10,
  },
});