import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { collection, doc, addDoc, query, where, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import TopbarBack from '../component/TopbarBack';
import { firestore, storage } from '../config/firebase';
import Navbar from '../component/Navbar';
import { FlatList } from 'react-native-gesture-handler';
import { set } from 'firebase/database';
import NavDash from '../component/NavDash';

export default function TransaksiReview({ navigation, route }) {
  const { userId } = route.params;
  const [transaksiPermintaan, setTransaksiPermintaan] = useState([]);
  const [transaksiAktif, setTransaksiAktif] = useState([]);
  const [peralatanPermintaan, setPeralatanPermintaan] = useState([]);
  const [peralatanAktif, setPeralatanAktif] = useState([]);

  const [mode, setMode] = useState('permintaan');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermintaan();
    fetchAktif();
  }, []);

  const fetchPermintaan = async () => {
    const permintaanRef = query(collection(firestore, 'informasi_penyewaan'), where('penyedia', '==', userId), where('status', '==', 'Menunggu Konfirmasi'));
    const permintaanDoc = await getDocs(permintaanRef);
    if (permintaanDoc) {
      const permintaan = permintaanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let daftarPeralatan =[];
      for (let i = 0; i < permintaan.length; i++) {
        const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', permintaan[i].peralatan));
        const peralatanDoc = await getDocs(peralatanRef);
        if (peralatanDoc) {
          const peralatan = peralatanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          daftarPeralatan.push(peralatan[0]);
        }
      }
      
      setPeralatanPermintaan(daftarPeralatan);
      setTransaksiPermintaan(permintaan);
    } else {
      console.log('No such permintaan!');
    }
  };

  const fetchAktif = async () => {
    const aktifRef = query(collection(firestore, 'informasi_penyewaan'), where('penyedia', '==', userId), where('status', '==', 'Aktif'));
    const aktifDoc = await getDocs(aktifRef);
    if (aktifDoc) {
      const aktif = aktifDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let daftarPeralatan =[];
      for (let i = 0; i < aktif.length; i++) {
        const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', aktif[i].peralatan));
        const peralatanDoc = await getDocs(peralatanRef);
        if (peralatanDoc) {
          const peralatan = peralatanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          daftarPeralatan.push(peralatan[0]);
        }
      }

      setPeralatanAktif(daftarPeralatan);
      setTransaksiAktif(aktif);
    } else {
      console.log('No such permintaan!');
    }
  };

  const handleTerima = async (transaksiId) => {
    const docRef = query(collection(firestore, 'informasi_penyewaan'), where('id_transaksi', '==', transaksiId));
    const docId = (await getDocs(docRef)).docs[0].id;

    try {
      const informasiPenyewaanRef = doc(firestore, 'informasi_penyewaan', docId);
      await updateDoc(informasiPenyewaanRef, {
        status: 'Aktif',
      });

      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status: ', error);
    } finally {
      fetchPermintaan();
    }
  }

  const handleTolak = async (transaksiId) => {
    const docRef = query(collection(firestore, 'informasi_penyewaan'), where('id_transaksi', '==', transaksiId));
    const docId = (await getDocs(docRef)).docs[0].id;

    try {
      const informasiPenyewaanRef = doc(firestore, 'informasi_penyewaan', docId);
      await updateDoc(informasiPenyewaanRef, {
        status: 'Ditolak',
      });

      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status: ', error);
    } finally {
      fetchPermintaan();
    }
  }

  function formatHarga(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  const renderPermintaan = ({ peralatan, transaksi }) => {
    const image = peralatan.find(item => item.id_peralatan === transaksi.peralatan).foto.split(',')[0];
    const name = peralatan.find(item => item.id_peralatan === transaksi.peralatan).nama;
    
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
        <TouchableOpacity style={{width:35, height:35, marginRight:2.5, marginTop:65, justifyContent:'center', alignItems:'center', backgroundColor:'#FB0A0A', borderRadius:10}}
          onPress={() => Alert.alert('Konfirmasi', 'Apakah anda yakin ingin menolak transaksi ini?', [{text: 'Tidak', onPress: () => {}}, {text: 'Ya', onPress: () => {handleTolak(transaksi.id_transaksi)}}])}>
          <Ionicons name='close' size={25} color='#FFFFFF'/>
        </TouchableOpacity>
        <TouchableOpacity style={{width:35, height:35, marginLeft:2.5, marginTop:65, justifyContent:'center', alignItems:'center', backgroundColor:'#459708', borderRadius:10}}
          onPress={() => handleTerima(transaksi.id_transaksi)}>
          <Ionicons name='checkmark' size={25} color='#FFFFFF'/>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAktif = ({ peralatan, transaksi }) => {
    const image = peralatan.find(item => item.id_peralatan === transaksi.peralatan).foto.split(',')[0];
    const name = peralatan.find(item => item.id_peralatan === transaksi.peralatan).nama;
    
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
        <TouchableOpacity style={{width:90, height:35, marginLeft:2.5, marginTop:65, justifyContent:'center', alignItems:'center', backgroundColor:'#459708', borderRadius:10}}
          onPress={() => navigation.navigate('PembayaranReview', { userId: userId, transaksiId: transaksi.id_transaksi})}>
          <Text style={{color:'#FFFFFF', fontSize:16, fontWeight:'bold'}}>Periksa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopbarBack navigation={navigation} title={'Transaksi'}/>
      <View style={{ flexDirection:'row', width:'auto', height:50, marginHorizontal:20, marginBottom:10, backgroundColor:'transparent', borderRadius:25 }}>
        <Pressable style={{ width:'50%', height:'100%', justifyContent:'center', alignItems:'center', backgroundColor:mode === 'permintaan' ? '#459708' : '#FFFFFF', borderTopLeftRadius:25, borderBottomLeftRadius:25 }} onPress={() => {setMode('permintaan'); fetchPermintaan()}}>
          <Text style={{ color:mode === 'permintaan' ? '#FFFFFF' : '#004268', fontWeight:'bold' }}>Permintaan</Text>
        </Pressable>
        <Pressable style={{ width:'50%', height:'100%', justifyContent:'center', alignItems:'center', backgroundColor:mode === 'aktif' ? '#459708' : '#FFFFFF', borderTopRightRadius:25, borderBottomRightRadius:25 }} onPress={() => {setMode('aktif'); fetchAktif()}}>
          <Text style={{ color:mode === 'aktif' ? '#FFFFFF' : '#004268', fontWeight:'bold' }}>Aktif</Text>
        </Pressable>
      </View>
      {mode === 'permintaan' ? (
        <FlatList
          data={transaksiPermintaan}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderPermintaan({ peralatan: peralatanPermintaan, transaksi: item })}
          contentContainerStyle={{paddingHorizontal: 20}}
        />
      ) : (
        <FlatList
          data={transaksiAktif}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderAktif({ peralatan: peralatanAktif, transaksi: item })}
          contentContainerStyle={{paddingHorizontal: 20}}
        />
      )}
      <NavDash route={route}/>
      <Modal transparent={true} animationType="none" visible={loading} onRequestClose={() => {}}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator animating={loading} size="large" color="#459708" />
          </View>
        </View>
      </Modal>
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
