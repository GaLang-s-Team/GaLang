import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList, Modal, TouchableWithoutFeedback, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { collection, doc, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

import { firestore } from '../config/firebase';

import PopUpSewaSukses from '../component/PopUpSewaSukses';
import { set } from 'firebase/database';


export default function PeralatanDetail({ navigation, route }) {
  const { peralatanId, userId} = route.params;

  const [peralatanImages, setPeralatanImages] = useState([]);
  const [peralatanNama, setPeralatanNama] = useState('');
  const [peralatanHarga, setPeralatanHarga] = useState('');
  const [peralatanKetersediaan, setPeralatanKetersediaan] = useState(0);
  const [peralatanRating, setPeralatanRating] = useState('');
  const [peralatanDisewa, setPeralatanDisewa] = useState('');
  const [peralatanDeskripsi, setPeralatanDeskripsi] = useState('');
  
  const [penyedia, setPenyedia] = useState(null);
  const [penyediaNama, setPenyediaNama] = useState('');
  const [penyediaProfile, setPenyediaProfile] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [takingDate, setTakingDate] = useState(new Date());
  const [duration, setDuration] = useState(1);

  const [showDate, setShowDate] = useState(false);
  const [isOnProcess, setIsOnProcess] = useState(false);
  const [isBuyModalVisible, setBuyModalVisible] = useState(false);
  const [garasiVisible, setGarasiVisible] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const handleClose = () => {
    setGarasiVisible(false);
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchPeralatanAndPenyedia = async () => {
      try {
        const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', peralatanId));
        const peralatanDoc = await getDocs(peralatanRef);
        if (peralatanDoc) {
          peralatanDoc.forEach(documentSnapshot => {
            setPeralatanImages(documentSnapshot.data().foto.split(','));
            setPeralatanNama(documentSnapshot.data().nama);
            setPeralatanHarga(documentSnapshot.data().harga);
            setPeralatanKetersediaan(documentSnapshot.data().ketersediaan);
            setPeralatanRating(documentSnapshot.data().rating);
            setPeralatanDisewa(documentSnapshot.data().jumlah_sewa);
            setPeralatanDeskripsi(documentSnapshot.data().deskripsi)
            setSizes(documentSnapshot.data().ukuran.split(','));
            setPenyedia(documentSnapshot.data().penyedia);
          });
        } else {
          console.log('No such peralatan!');
        }

        const penyediaRef = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', penyedia));
        const penyediaDoc = await getDocs(penyediaRef);
        if (penyediaDoc) {
          penyediaDoc.forEach(documentSnapshot => {
            setPenyediaNama(documentSnapshot.data().nama);
            if (documentSnapshot.data().imageUri == '') {
              setPenyediaProfile(`https://ui-avatars.com/api/?name=${penyediaNama}`);
            } else {
              setPenyediaProfile(documentSnapshot.data().imageUri);
            }
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
  }, [peralatanId, penyedia, penyediaNama, penyediaProfile]);

  const toggleBuyModal = () => {
    setBuyModalVisible(!isBuyModalVisible);
  };

  const handleAjukanSewa = async () => {
    if (!selectedSize) {
      Alert.alert('Error', 'Silahkan pilih ukuran peralatan');
      return;
    }
    
    setIsOnProcess(true);

    let docId
    const getAvailableQuantity = async () => {
      const q = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', peralatanId));
      const querySnapshot = await getDocs(q);
      docId = querySnapshot.docs[0].id;
      
      return Number(querySnapshot.docs[0].data().ketersediaan);
    };

    const qty = await getAvailableQuantity();
    if (quantity > qty) {
      Alert.alert('Error', 'Jumlah yang diminta melebihi ketersediaan peralatan.');
      return;
    }

    
    const getNumber = async () => {
      const q = collection(firestore, 'informasi_penyewaan');
      const querySnapshot = await getDocs(q);
      return querySnapshot.size + 1;
    };

    const number = await getNumber();
    const informasiPenyewaan = {
      id_transaksi: String('transaksi-' + number),
      peralatan: String(peralatanId),
      jumlah: quantity,
      ukuran: selectedSize,
      total_harga: peralatanHarga * quantity * duration,
      pengambilan: takingDate.toString().substring(0, 15),
      pengembalian: addDate(takingDate, duration).toString().substring(0, 15),
      status: 'Menunggu Konfirmasi',
      pembayaran: false,
      bukti_pembayaran: '',
      penyedia: penyedia,
      penyewa: String(userId),
      rating: 0,
      dikembalikan: false,
    };

    await addDoc(collection(firestore, 'informasi_penyewaan'), informasiPenyewaan);
    setIsOnProcess(false);
    setModalVisible(true)
  }
  
  const handleAddtoGarasi = async () => {
    try {
      const q = query(collection(firestore, 'keranjang'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const keranjangData = {
          userId: userId,
          id_peralatan: peralatanId,
        };
        await addDoc(collection(firestore, 'keranjang'), keranjangData);
      } else {
        const docId = querySnapshot.docs[0].id;
        const peralatan = String(querySnapshot.docs[0].data().id_peralatan + ',' + peralatanId);
        const keranjangData = {
          id_peralatan: peralatan,
        };
        await updateDoc(doc(firestore, 'keranjang', docId), keranjangData);
      }
      setGarasiVisible(true)
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  const handleDurationChange = (change) => {
    setDuration((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  function formatHarga(num) {
    if (num === null) return 0;
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  function formatRating(num) {
    if (num != 0) return `★${num}`;
    else return `Belum Diulas`;
  }

  const showDatepicker = () => {
    setShowDate(true);
  };

  const addDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDate(false);
    setTakingDate(currentDate);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name='arrow-back' size={24} color='#FFFFFF' />
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
          <Text style={styles.peralatanPrice}>Rp{formatHarga(peralatanHarga)}</Text>
          <Text style={styles.peralatanHighlight}>Rating: {formatRating(peralatanRating)}</Text>
          <Text style={styles.peralatanHighlight}>Disewa: {peralatanDisewa}</Text>
        </View>
        <View style={styles.storeProfile}>
          <TouchableOpacity onPress={() => Alert.alert('Store', 'Go to store page!')}>
            <Image source={{ uri: penyediaProfile }} style={styles.storeImage} />
          </TouchableOpacity>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{penyediaNama}</Text>
          </View>
        </View>
        <View style={styles.peralatanDescription}>
          <Text style={styles.sectionTitle}>Deskripsi Peralatan</Text>
          <Text style={[styles.sectionDescription, {marginBottom:5}]}>Tersedia: {peralatanKetersediaan}</Text>
          <Text style={styles.sectionDescription}>{peralatanDeskripsi}</Text>
        </View>
      </ScrollView>
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.footerButtonLeft} onPress={handleAddtoGarasi}>
          <Text style={styles.footerButtonTextLeft}>+ Garasi</Text>
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
                <Text style={[styles.sizeOptionText, selectedSize === size && styles.selectedText]}>{size}</Text>
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
          <Text style={styles.modalTitle}>Pilih Tanggal Pengambilan</Text>
          <View style={{ width:150, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: '#004268', borderRadius: 5 }}>
            <TouchableOpacity onPress={showDatepicker}>
              <Text style={styles.sizeOptionText}>{takingDate.toDateString()}</Text>
            </TouchableOpacity>
          </View>
          {showDate === true && (
            <>
            <DateTimePicker
              testID='dateTimePicker'
              value={takingDate}
              mode='date'
              display='default'
              onChange={onChange}
            />
            </>
          )}
          <Text style={styles.modalTitle}>Masukkan Lama Penyewaan (Hari)</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleDurationChange(-1)}>
              <Ionicons name='remove' size={24} color='#004268' />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              value={String(duration)}
              keyboardType='numeric'
              onChangeText={(text) => setDuration(Number(text))}
            />
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleDurationChange(1)}>
              <Ionicons name='add' size={24} color='#004268' />
            </TouchableOpacity>
          </View>
          <Pressable style={{height:45, backgroundColor:'#459708', padding:10, borderRadius:10}} onPress={handleAjukanSewa}>
            { isOnProcess ? (
              <ActivityIndicator size={27} color='white' />
            ) : (
              <Text style={{color:'white', fontSize:16, fontWeight:'bold', textAlign:'center' }}>Ajukan Sewa</Text>
            )}
          </Pressable>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="slide"
        visible={garasiVisible}
        onRequestClose={handleClose}
      >
        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10, width: '100%', height: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
          <View style={{backgroundColor: 'white', borderRadius: 20, marginTop: 'auto', marginBottom: 'auto'}}>
          <View style={{padding: 20}}>
            <Image source={require('../../assets/GaLang.png')} style={{width: 133, height: 189, marginLeft: 'auto', marginRight: 'auto'}}></Image>
            <Image source={require('../../assets/TulisanGaLang.png')} style={{width: 117, height: 27, marginLeft: 'auto', marginRight: 'auto'}}></Image>
            <Text style={{color: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, fontWeight: 'bold', fontSize: 16}}>Peralatan telah ditambahkan</Text>
            <Text style={{color: '#004268', marginLeft: 'auto', marginRight: 'auto', marginTop: 10, fontWeight: 'bold', fontSize: 14}}>Silahkan periksa garasi Anda</Text>
            <Pressable onPress={handleClose} style={{marginTop: 20, backgroundColor: '#459708', padding: 15, borderRadius: 10}}><Text style={{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>OK</Text></Pressable>
          </View>
          </View>
        </View>
      </Modal>
      <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={handleClose}
      >
          <View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 10, width: '100%', height: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
              {/* <View style={styles.modalContainer}> */}
              <View style={{backgroundColor: 'white', borderRadius: 20, marginTop: 'auto', marginBottom: 'auto'}}>
                <PopUpSewaSukses onClose={handleClose} />
              </View>
                  
                  
              {/* </View> */}
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
    color: '#004268',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    backgroundColor: '#459708',
    borderColor: '#459708',
  },
  sizeOptionText: {
    color: '#004268',
    fontSize: 16,
  },
  selectedText: {
    color: 'white',
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
