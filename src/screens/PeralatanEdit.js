import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { collection, doc, query, where, getDocs, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import TopbarBack from '../component/TopbarBack';
import { firestore, storage } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

export default function PeralatanEdit({ navigation, route }) {
  const [images, setImages] = useState([null, null, null]);
  const [peralatanName, setPeralatanName] = useState('');
  const [peralatanPrice, setPeralatanPrice] = useState('');
  const [peralatanDescription, setPeralatanDescription] = useState('');
  const [peralatanQuantity, setPeralatanQuantity] = useState('');
  const [peralatanSizes, setPeralatanSizes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  const { userId, peralatanId } = route.params;
  const categories = ['Aksesoris', 'Pakaian', 'Peralatan', 'Sepatu', 'Tas', 'Lainnya'];

  useEffect(() => {
    fetch = async () => {
      const q = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', peralatanId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot) {
        for (let i = 0; i < querySnapshot.size; i++) {
          const peralatan = querySnapshot.docs[i].data();
          
          setImages(peralatan.foto.split(','));
          setPeralatanName(peralatan.nama);
          setPeralatanPrice(peralatan.harga);
          setPeralatanDescription(peralatan.deskripsi);
          setPeralatanQuantity(peralatan.ketersediaan);
          setPeralatanSizes(peralatan.ukuran);
          setSelectedCategory(peralatan.kategori);
        }
      }
    };

    fetch();
  }, []);

  const pickImage = async (index) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }

    setImageChanged(true);
  };


  const compressImage = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize image to width 800, keeping aspect ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  };

  const uploadImageAsync = async (uri, name) => {
    // Kompresi gambar
    const compressedUri = await compressImage(uri);

    // Konversi URI gambar menjadi Blob yang dapat diunggah
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    const imageRef = ref(storage, `peralatan/${name}`);
    await uploadBytes(imageRef, blob);

    return await getDownloadURL(imageRef);
  };

  const handleDeletePeralatan = async () => {
    Alert.alert('Peringatan', 'Apakah Anda yakin ingin menghapus peralatan ini?', [
      { text: 'Batal', onPress: () => {} },
      { text: 'Ya', onPress: deletePeralatan },
    ]);

    async function deletePeralatan() {
      try {
        setLoading(true); // Mulai loading

        // Menghapus peralatan dari Firestore
        const q = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', peralatanId));
        const querySnapshot = await getDocs(q);
        
        const penyewaanRef = query(collection(firestore, 'informasi_penyewaan'), where('peralatan', '==', peralatanId));
        const penyewaanSnapshot = await getDocs(penyewaanRef);

        if (penyewaanSnapshot.size > 0) {
          Alert.alert('Gagal', 'Peralatan tidak dapat dihapus karena sedang ditransaksikan!');
          return;
        }

        const docId = querySnapshot.docs[0].id;
        await setDoc(doc(firestore, 'peralatan', docId), {
          deleted: true,
          id_peralatan: peralatanId,
          nama: querySnapshot.docs[0].data().nama,
          foto: 'https://via.placeholder.com/250'
        });

        Alert.alert('Berhasil', 'Peralatan berhasil dihapus!');
        navigation.navigate('Dashboard', { userId: userId });
      } catch (error) {
        Alert.alert('Gagal', 'Gagal untuk menghapus peralatan: ' + error.message);
      } finally {
        setLoading(false); // Akhiri loading
      }
    }
  }
  
  const handleUpdatePeralatan = async () => {
    if (images.includes(null)) {
      Alert.alert('Error', 'Silahkan unggah 3 foto peralatan');
      return;
    }
    if (!peralatanName || !peralatanPrice || !peralatanDescription || !peralatanQuantity || !peralatanSizes || !selectedCategory) {
      Alert.alert('Error', 'Silahkan isi semua kolom yang tersedia');
      return;
    }
    
    setLoading(true); // Mulai loading

    var peralatanData;
    if (imageChanged) {
      var imageUrls = '';
      for (let i = 1; i <= 3; i++) {
        const url = await uploadImageAsync(images[i - 1], `${get_id}-${i}`);
        if (imageUrls === '') {
          imageUrls += url;
        } else {
          imageUrls += `,${url}`;
        }
      }

      peralatanData = {
        nama: peralatanName,
        ketersediaan: parseInt(peralatanQuantity),
        harga: parseFloat(peralatanPrice),
        kategori: selectedCategory,
        ukuran: peralatanSizes,
        deskripsi: peralatanDescription,
        foto: imageUrls,
      };
    } else {
      peralatanData = {
        nama: peralatanName,
        ketersediaan: parseInt(peralatanQuantity),
        harga: parseFloat(peralatanPrice),
        kategori: selectedCategory,
        ukuran: peralatanSizes,
        deskripsi: peralatanDescription,
      };
    }

    try {
      // Perbarui peralatan data to Firestore
      const q = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', peralatanId));
      const querySnapshot = await getDocs(q);
      
      const docId = querySnapshot.docs[0].id;
      await updateDoc(doc(firestore, 'peralatan', docId), peralatanData);

      Alert.alert('Berhasil', 'Peralatan berhasil diperbarui!');
      navigation.navigate('Dashboard', { userId: userId });
    } catch (error) {
      Alert.alert('Gagal', 'Gagal untuk memperbarui peralatan: ' + error.message);
    } finally {
      setLoading(false); // Akhiri loading
    }
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <TopbarBack navigation={navigation} title={'Perbarui Peralatan'}/>
        <Text style={styles.subtitle}>Foto Peralatan</Text>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => pickImage(index)} style={styles.imageWrapper}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image}/>
              ) : (
                <Ionicons name='camera' size={40} color='#004268'/>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.subtitle}>Nama Peralatan</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan nama peralatan'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={peralatanName}
          onChangeText={setPeralatanName}
        />
        <Text style={styles.subtitle}>Harga Peralatan</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan harga peralatan (tanpa tanda baca, misalnya: 100000)'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={peralatanPrice}
          onChangeText={setPeralatanPrice}
          keyboardType='numeric'
        />
        <Text style={styles.subtitle}>Category</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={{ color: '#004268' }}
          >
            <Picker.Item label='Select a category' value='' />
            {categories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </View>
        <Text style={styles.subtitle}>Deskripsi Peralatan</Text>
        <TextInput
          style={[styles.input, styles.textArea, { paddingTop:10 }]}
          placeholder='Silahkan masukkan deskripsi peralatan'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={peralatanDescription}
          onChangeText={setPeralatanDescription}
          multiline
          numberOfLines={4}
        />
        <Text style={styles.subtitle}>Jumlah Tersedia</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan jumlah ketersediaan peralatan'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={peralatanQuantity}
          onChangeText={setPeralatanQuantity}
          keyboardType='numeric'
        />
        <Text style={styles.subtitle}>Ukuran Tersedia</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan ukuran yang tersedia (pisahkan dengan koma, misalnya: S,M,L,XL)'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={peralatanSizes}
          onChangeText={setPeralatanSizes}
        />
        <View style={{flexDirection:'row', paddingHorizontal:20, justifyContent:'space-between'}}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePeralatan}>
            <Text style={styles.addButtonText}>Hapus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePeralatan}>
            <Text style={styles.addButtonText}>Perbarui</Text>
          </TouchableOpacity>
        </View>
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
  deleteButton: {
    backgroundColor: '#FF0000',
    width: '47.5%',
    height: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    padding: 15,
    borderRadius: 10,
  },
  updateButton: {
    backgroundColor: '#459708',
    width: '47.5%',
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
