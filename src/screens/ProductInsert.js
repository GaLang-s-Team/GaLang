import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import TopbarBack from '../component/TopbarBack';

export default function AddProductScreen({ navigation }) {
  const [images, setImages] = useState([null, null, null]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productSizes, setProductSizes] = useState('');

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

  const handleAddProduct = () => {
    if (images.includes(null)) {
      Alert.alert('Error', 'Please upload 3 images.');
      return;
    }
    if (!productName || !productPrice || !productDescription || !productQuantity || !productSizes) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    // Submit product data to server or API
    Alert.alert('Success', 'Product added successfully!');
    // Reset form
    setImages([null, null, null]);
    setProductName('');
    setProductPrice('');
    setProductDescription('');
    setProductQuantity('');
    setProductSizes('');
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <TopbarBack title={'Tambah Produk'}/>
        <Text style={styles.subtitle}>Foto Produk</Text>
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
        <Text style={styles.subtitle}>Nama Produk</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan nama produk'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={productName}
          onChangeText={setProductName}
        />
        <Text style={styles.subtitle}>Harga Produk</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan harga produk'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={productPrice}
          onChangeText={setProductPrice}
          keyboardType='numeric'
        />
        <Text style={styles.subtitle}>Deskripsi Produk</Text>
        <TextInput
          style={[styles.input, styles.textArea, { paddingTop:10 }]}
          placeholder='Silahkan masukkan deskripsi produk'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={productDescription}
          onChangeText={setProductDescription}
          multiline
          numberOfLines={4}
        />
        <Text style={styles.subtitle}>Jumlah Tersedia</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan jumlah ketersediaan produk'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={productQuantity}
          onChangeText={setProductQuantity}
          keyboardType='numeric'
        />
        <Text style={styles.subtitle}>Ukuran Tersedia</Text>
        <TextInput
          style={styles.input}
          placeholder='Silahkan masukkan ukuran yang tersedia (pisahkan dengan koma, misalnya: S,M,L,XL)'
          placeholderTextColor={'rgba(0, 66, 104, 0.5)'}
          value={productSizes}
          onChangeText={setProductSizes}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>Tambahkan</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
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
    position: 'absolute',
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
});
