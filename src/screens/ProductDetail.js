import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';


export default function ProductDetail({ navigation }) {
  const [isBuyModalVisible, setBuyModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const sizes = ['S', 'M', 'L', 'XL'];
  const similarProducts = [
    // Data produk serupa
    { id: '1', name: 'Product 1', image: 'https://via.placeholder.com/100', price: '10000' },
    { id: '2', name: 'Product 2', image: 'https://via.placeholder.com/100', price: '15000' },
  ];

  const toggleBuyModal = () => {
    setBuyModalVisible(!isBuyModalVisible);
  };

  const handleAddToCart = () => {
    Alert.alert('Success', 'Product added to cart!');
  };

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name='arrow-back' size={24} color='white' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Share', 'Share this product!')}>
            <Ionicons name='share-social' size={24} color='white' />
          </TouchableOpacity>
        </View>
        <View style={styles.imageSlider}>
          <TouchableOpacity style={styles.arrowLeft}>
            <Ionicons name='chevron-back' size={24} color='white' />
          </TouchableOpacity>
          <Swiper showsPagination={false} loop>
            <Image source={{ uri: 'https://via.placeholder.com/300' }} style={styles.productImage} />
            <Image source={{ uri: 'https://via.placeholder.com/300' }} style={styles.productImage} />
            <Image source={{ uri: 'https://via.placeholder.com/300' }} style={styles.productImage} />
          </Swiper>
          <TouchableOpacity style={styles.arrowRight}>
            <Ionicons name='chevron-forward' size={24} color='white' />
          </TouchableOpacity>
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>Nama Produk</Text>
          <Text style={styles.productPrice}>Rp50.000</Text>
          <Text style={styles.productHighlight}>Rating: ★★★★☆</Text>
          <Text style={styles.productHighlight}>Disewa: 1000 kali</Text>
        </View>
        <View style={styles.storeProfile}>
          <TouchableOpacity onPress={() => Alert.alert('Store', 'Go to store page!')}>
            <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.storeImage} />
          </TouchableOpacity>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>Toko</Text>
            <TouchableOpacity onPress={() => Alert.alert('Store', 'Go to store page!')}>
              <Text style={styles.visitStore}>Lihat Toko</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.productDescription}>
          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          <Text style={styles.sectionDescription}>Ini adalah deskripsi produk yang sangat lengkap.</Text>
        </View>
        <View style={styles.similarProducts}>
          <Text style={styles.sectionTitle}>Produk Serupa</Text>
          <FlatList
            data={similarProducts}
            renderItem={({ item }) => (
              <View style={styles.similarProductCard}>
                <Image source={{ uri: item.image }} style={styles.similarProductImage} />
                <Text style={styles.sectionDescription}>{item.name}</Text>
                <Text style={styles.sectionDescription}>Rp{item.price}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            horizontal
          />
        </View>
      </ScrollView>
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.footerButtonLeft} onPress={handleAddToCart}>
          <Text style={styles.footerButtonTextLeft}>+ Tas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButtonRight} onPress={toggleBuyModal}>
          <Text style={styles.footerButtonTextRight}>Sewa</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isBuyModalVisible} animationType='slide' transparent onRequestClose={toggleBuyModal}>
        <TouchableWithoutFeedback onPress={toggleBuyModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Pilih Ukuran</Text>
          <View style={styles.sizeOptions}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeOption, selectedSize === size && styles.selectedSizeOption]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={styles.sizeOptionText}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.modalTitle}>Masukkan Jumlah</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(-1)}>
              <Ionicons name='remove' size={24} color='#004268' />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={String(quantity)}
              keyboardType='numeric'
              onChangeText={(text) => setQuantity(Number(text))}
            />
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(1)}>
              <Ionicons name='add' size={24} color='#004268' />
            </TouchableOpacity>
          </View>
          <Pressable style={{backgroundColor:'#459708', padding:10, borderRadius:10}} onPress={() => Alert.alert('Purchase', 'Proceed to payment!')}>
            <Text style={{color:'white', fontSize:16, fontWeight:'bold', textAlign:'center' }}>Sewa</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#459708',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7.5,
  },
  backButton: {
    backgroundColor: 'rgba(22, 25, 32, 0.6)',
    borderRadius: 50,
    padding: 7.5,
  },
  shareButton: {
    backgroundColor: 'rgba(22, 25, 32, 0.6)',
    borderRadius: 50,
    padding: 7.5,
  },
  imageSlider: {
    height: 300,
  },arrowLeft: {
    position: 'absolute',
    top: '50%',
    left: 10,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 5,
  },
  arrowRight: {
    position: 'absolute',
    top: '50%',
    right: 10,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 5,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    color: '#004268',
    fontSize: 24,
    fontWeight: 'bold',
  },
  productPrice: {
    color: '#004268',
    fontSize: 20,
    marginVertical: 5,
  },
  productHighlight: {
    color: '#004268',
    fontSize: 16,
  },
  storeProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  storeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    color: '#004268',
    fontSize: 18,
    fontWeight: 'bold',
  },
  visitStore: {
    color: '#004268',
  },
  productDescription: {
    padding: 10,
  },
  sectionTitle: {
    color: '#004268',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  sectionDescription: {
    color: '#004268',
  },
  similarProducts: {
    padding: 10,
  },
  similarProductCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 10,
  },
  similarProductImage: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  footerButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fffdfd',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  footerButtonRight: {
    backgroundColor: '#459708',
    alignItems: 'center',
    width: '45%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderColor: '#459708',
    borderWidth: 2,
    borderRadius: 10,
  },
  footerButtonTextRight: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerButtonLeft: {
    backgroundColor: 'white',
    alignItems: 'center',
    width: '45%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderColor: '#004268',
    borderWidth: 2,
    borderRadius: 10,
  },
  footerButtonTextLeft: {
    color: '#004268',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sizeOption: {
    width:50,
    height: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#004268',
    borderRadius: 5,
  },
  selectedSizeOption: {
    backgroundColor: 'lightgray',
  },
  sizeOptionText: {
    color: '#004268',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    padding: 1.5,
    borderWidth: 1,
    borderColor: '#004268',
    borderRadius: 5,
  },
  quantityInput: {
    width: 50,
    height: 31,
    textAlign: 'center',
    color: '#004268',
    borderWidth: 1,
    borderColor: '#004268',
    borderRadius: 5,
    marginHorizontal: 10,
  },
});
