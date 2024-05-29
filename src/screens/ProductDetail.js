import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

import { firestore } from '../config/firebase';


export default function PeralatanDetail({ navigation, route }) {
  const { peralatanId, penyediaId } = route.params;
  const { userId } = route.params;

  const [peralatanImages, setPeralatanImages] = useState([]);
  const [peralatanNama, setPeralatanNama] = useState('');
  const [peralatanHarga, setPeralatanHarga] = useState('');
  const [peralatanRating, setPeralatanRating] = useState('');
  const [peralatanDisewa, setPeralatanDisewa] = useState('');
  const [peralatanDeskripsi, setPeralatanDeskripsi] = useState('');
  
  const [penyedia, setPenyedia] = useState(null);
  const [penyediaProfile, setPenyediaProfile] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [isBuyModalVisible, setBuyModalVisible] = useState(false);
  
  const similarPeralatans = [
    // Data peralatan serupa
    { id: '1', name: 'Peralatan 1', image: 'https://via.placeholder.com/100', price: '10000' },
    { id: '2', name: 'Peralatan 2', image: 'https://via.placeholder.com/100', price: '15000' },
  ];

  useEffect(() => {
    const fetchPeralatanAndPenyedia = async () => {
      try {
        const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', 'Bsnxp7k99qSKKYBDJ4kRluQcrwC2-2'));
        const peralatanDoc = await getDocs(peralatanRef);
        if (peralatanDoc) {
          peralatanDoc.forEach(documentSnapshot => {
            setPeralatanImages(documentSnapshot.data().foto.split(','));
            setPeralatanNama(documentSnapshot.data().nama);
            setPeralatanHarga(formatHarga(documentSnapshot.data().harga));
            setPeralatanRating(formatRating(documentSnapshot.data().rating));
            setPeralatanDisewa(documentSnapshot.data().disewa);
            setPeralatanDeskripsi(documentSnapshot.data().deskripsi)
            setPenyedia(documentSnapshot.data().penyedia);
          });
        } else {
          console.log('No such peralatan!');
        }

        const penyediaRef = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', penyedia));
        const penyediaDoc = await getDocs(penyediaRef);
        if (penyediaDoc) {
          penyediaDoc.forEach(documentSnapshot => {
            setPenyediaProfile(documentSnapshot.data().profil);
          });
        } else {
          console.log('No such penyedia!');
        }
      } catch (error) {
        console.error('Error fetching peralatan or penyedia:', error);
      } finally {
        
      }
    };

    fetchPeralatanAndPenyedia();
  }, [peralatanId, penyediaId]);

  const toggleBuyModal = () => {
    setBuyModalVisible(!isBuyModalVisible);
  };

  const handleAddToCart = () => {
    Alert.alert('Success', 'Peralatan added to cart!');
  };

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  function formatHarga(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  function formatRating(num) {
    if (num != 9) return `★${num}`;
    else return `Belum Diulas`;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name='arrow-back' size={24} color='#FFFFFF' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Share', 'Share this peralatan!')}>
            <Ionicons name='share-social' size={24} color='#FFFFFF' />
          </TouchableOpacity>
        </View>
        <View style={styles.imageSlider}>
          <TouchableOpacity style={styles.arrowLeft}>
            <Ionicons name='chevron-back' size={24} color='white' />
          </TouchableOpacity>
          <Swiper showsPagination={false} loop>
            <Image source={{ uri: peralatanImages[0] }} style={styles.peralatanImage} />
            <Image source={{ uri: peralatanImages[1] }} style={styles.peralatanImage} />
            <Image source={{ uri: peralatanImages[2] }} style={styles.peralatanImage} />
          </Swiper>
          <TouchableOpacity style={styles.arrowRight}>
            <Ionicons name='chevron-forward' size={24} color='white' />
          </TouchableOpacity>
        </View>
        <View style={styles.peralatanDetails}>
          <Text style={styles.peralatanName}>{peralatanNama}</Text>
          <Text style={styles.peralatanPrice}>Rp{peralatanHarga}</Text>
          <Text style={styles.peralatanHighlight}>Rating: {peralatanRating}</Text>
          <Text style={styles.peralatanHighlight}>Disewa: {peralatanDisewa}</Text>
        </View>
        <View style={styles.storeProfile}>
          <TouchableOpacity onPress={() => Alert.alert('Store', 'Go to store page!')}>
            <Image source={{ uri: penyediaProfile }} style={styles.storeImage} />
          </TouchableOpacity>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>Toko</Text>
            <TouchableOpacity onPress={() => Alert.alert('Store', 'Go to store page!')}>
              <Text style={styles.visitStore}>Lihat Toko</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.peralatanDescription}>
          <Text style={styles.sectionTitle}>Deskripsi Peralatan</Text>
          <Text style={styles.sectionDescription}>{peralatanDeskripsi}</Text>
        </View>
        <View style={styles.similarPeralatans}>
          <Text style={styles.sectionTitle}>Peralatan Serupa</Text>
          <FlatList
            data={similarPeralatans}
            renderItem={({ item }) => (
              <View style={styles.similarPeralatanCard}>
                <Image source={{ uri: item.image }} style={styles.similarPeralatanImage} />
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
  backButton: {
    position: 'absolute',
    zIndex: 1,
    top: 10,
    left: 10,
    backgroundColor: 'rgba(22, 25, 32, 0.5)',
    borderRadius: 50,
    padding: 7.5,
  },
  shareButton: {
    position: 'absolute',
    zIndex: 1,
    top: 10,
    right: 10,
    backgroundColor: 'rgba(22, 25, 32, 0.5)',
    borderRadius: 50,
    padding: 7.5,
  },
  imageSlider: {
    height: 300,
  },
  arrowLeft: {
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
  peralatanImage: {
    width: '100%',
    height: '100%',
  },
  peralatanDetails: {
    padding: 10,
  },
  peralatanName: {
    color: '#004268',
    fontSize: 24,
    fontWeight: 'bold',
  },
  peralatanPrice: {
    color: '#004268',
    fontSize: 20,
    marginVertical: 5,
  },
  peralatanHighlight: {
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
  peralatanDescription: {
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
  similarPeralatans: {
    padding: 10,
  },
  similarPeralatanCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 10,
  },
  similarPeralatanImage: {
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
