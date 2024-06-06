import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import TopbarBack from '../component/TopbarBack';
import { firestore, storage } from '../config/firebase';

export default function PeralatanInsert({ navigation, route }) {
  const [images, setImages] = useState([null, null, null]);
  const [peralatanName, setPeralatanName] = useState('');
  const [peralatanPrice, setPeralatanPrice] = useState('');
  const [peralatanDescription, setPeralatanDescription] = useState('');
  const [peralatanQuantity, setPeralatanQuantity] = useState('');
  const [peralatanSizes, setPeralatanSizes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const { userId } = route.params;
  const categories = ['Aksesoris', 'Pakaian', 'Peralatan', 'Sepatu', 'Tas', 'Lainnya'];

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
  };

  const getPeralatanNumber = async (id_penyedia) => {
    const q = query(collection(firestore, 'peralatan'), where('penyedia', '==', id_penyedia));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
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

  const handleAddPeralatan = async () => {
    if (images.includes(null)) {
      Alert.alert('Error', 'Please upload 3 images.');
      return;
    }
    if (!peralatanName || !peralatanPrice || !peralatanDescription || !peralatanQuantity || !peralatanSizes || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    setLoading(true); // Mulai loading
    
    var get_id = `${userId}-${await getPeralatanNumber(userId) + 1}`;

    var imageUrls = '';
    for (let i = 1; i <= 3; i++) {
      const url = await uploadImageAsync(images[i - 1], `${get_id}-${i}`);
      if (imageUrls === '') {
        imageUrls += url;
      } else {
        imageUrls += `,${url}`;
      }
    }

    const peralatanData = {
      id_peralatan: get_id,
      nama: peralatanName,
      ketersediaan: parseInt(peralatanQuantity),
      harga: parseFloat(peralatanPrice),
      rating: 0,
      jumlah_sewa: 0,
      kategori: selectedCategory,
      ukuran: peralatanSizes,
      deskripsi: peralatanDescription,
      foto: imageUrls,
      penyedia: userId,
    };

    try {
      // Add peralatan data to Firestore
      await addDoc(collection(firestore, 'peralatan'), peralatanData);
      Alert.alert('Success', 'Peralatan added successfully!');

      // Reset form
      setImages([null, null, null]);
      setPeralatanName('');
      setPeralatanPrice('');
      setPeralatanDescription('');
      setPeralatanQuantity('');
      setPeralatanSizes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add peralatan: ' + error.message);
    } finally {
      setLoading(false); // Akhiri loading
    }
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <TopbarBack navigation={navigation} title={'Tambah Peralatan'}/>
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddPeralatan}>
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
