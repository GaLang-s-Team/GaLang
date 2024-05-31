import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { collection, addDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import TopbarBack from '../component/TopbarBack';
import { firestore, storage } from '../config/firebase';

export default function PembayaranReview({ navigation, route }) {
  const { userId, transaksiId } = route.params;

  const [transaksi, setTransaksi] = useState({});
  const [peralatan, setPeralatan] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetchTransaksi = async () => {
    const transaksiRef = query(collection(firestore, 'informasi_penyewaan'), where('id_transaksi', '==', transaksiId));
    const transaksiDoc = await getDocs(transaksiRef);

    if (transaksiDoc) {
      const transaksiInfo = transaksiDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTransaksi(transaksiInfo[0]);
    }
    console.log('Transaksi:', transaksi);
  };

  const fetchPeralatan = async () => {
    const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', transaksi.peralatan));
    const peralatanDoc = await getDocs(peralatanRef);

    if (peralatanDoc) {
      const peralatanInfo = peralatanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPeralatan(peralatanInfo[0]);
    }
    console.log('Peralatan:', peralatan);
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <TopbarBack navigation={navigation} title={'Status Transaksi'}/>
        <Text style={styles.subtitle}>Produk</Text>
        <View style={styles.imageContainer}>
          <Image source={{ uri: peralatan?.foto }} style={styles.image} />
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Tambahkan</Text>
        </TouchableOpacity>
        <Modal transparent={true} animationType="none" visible={loading} onRequestClose={() => {}}>
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator animating={loading} size="large" color="#459708" />
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    width: '100%',
    height: '100%',
  },
  input: {
    height: 50,
    borderColor: '#004268',
    color: '#004268',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 1,
  },
  textArea: {  
    height: 100, // initial height
    textAlignVertical: 'top', // ensure text starts at the top-left corner
  },
  addButton: {
    backgroundColor: '#459708',
    width: '90%',
    height: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    padding: 15,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    borderColor: '#004268',
    color: '#004268',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 1,
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
});
