import React, { useState, useEffect } from 'react';
import { Button, Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { doc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

import Navbar from '../component/Navbar';
import { firestore } from '../config/firebase';
import TopbarBack from '../component/TopbarBack';

const { height, width } = Dimensions.get('window');

const TransaksiPenyewaan = ({ navigation, route }) => {
  const [selectedMenu, setSelectedMenu] = useState('Menunggu');
  const [data, setData] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userId } = route.params;

  const fetchData = async () => {
    setLoading(true);
    try {
      const informasiPenyewaanRef = collection(firestore, 'informasi_penyewaan');
      const queryInformasiPenyewaan = query(informasiPenyewaanRef, where("penyewa", "==", userId));
      const snapshotInformasiPenyewaan = await getDocs(queryInformasiPenyewaan);

      let informasiPenyewaanData =[]
      const informasiPenyewaanDataPromises = snapshotInformasiPenyewaan.docs.map(async (doc) => {
        const data = doc.data();
        const peralatanRef = collection(firestore, 'peralatan');
        const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', data.peralatan));
        const snapshotPeralatan = await getDocs(queryPeralatan);

        if (snapshotPeralatan.docs.length != 0) {
          informasiPenyewaanData.push({
            transaksiId: data.id_transaksi,
            penyedia: data.penyedia,
            peralatanId: data.peralatan,
            penyewaan: snapshotPeralatan.docs[0].data().count_rating,
            rating: snapshotPeralatan.docs[0].data().rating,
            nama: snapshotPeralatan.docs[0].data().nama,
            ukuran: data.ukuran,
            jumlah: data.jumlah,
            pengambilan: data.pengambilan,
            pengembalian: data.pengembalian,
            status: data.status,
            foto: snapshotPeralatan.docs[0].data().foto.split(',')[0]
          });
        }
      });

      await Promise.all(informasiPenyewaanDataPromises);
      setData(informasiPenyewaanData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMenu])

  let filteredData = [];
  console.log(data);
  if (data.length != 0) {
    if (selectedMenu === "Menunggu") {
      filteredData = data.filter(item => item.status === "Menunggu Konfirmasi" || item.status === "Menunggu Pembayaran");
    }
    else if (selectedMenu === "Selesai") {
      filteredData = data.filter(item => item.status === "Ditolak" || item.status === "Selesai" || item.status === "Aktif");
    }
  }

  const sortedFilteredData = filteredData.sort((a, b) => {
    const dateA = new Date(a.pengambilan);
    const dateB = new Date(b.pengambilan);
    return dateA - dateB;
  });

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const ratingModal = (item, isVisible) => {  
    const handleStarPress = (index) => {
      setRating(index + 1);
    };

    const handleRating = async (item) => {
      setLoading(true);
      const transaksiRef = query(collection(firestore, 'informasi_penyewaan'), where('id_transaksi', '==', item.transaksiId));
      const transaksiId = (await getDocs(transaksiRef)).docs[0].id;
      await updateDoc(doc(firestore, 'informasi_penyewaan', transaksiId), {
        rating: rating,
      });
  
      const peralatanRef = query(collection(firestore, 'peralatan'), where('id_peralatan', '==', item.peralatanId));
      const peralatanid = (await getDocs(peralatanRef)).docs[0].id;
      await updateDoc(doc(firestore, 'peralatan', peralatanid), {
        rating: (((item.rating * item.penyewaan)  + rating) / (item.penyewaan + 1)),
        count_rating: item.penyewaan + 1,
      });
  
      const penyediaRef = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', item.penyedia));
      const penyediaDoc = await getDocs(penyediaRef);
      const penyediaid = penyediaDoc.docs[0].id;
      const allPeralatanRef = query(collection(firestore, 'peralatan'), where('penyedia', '==', item.penyedia));
      const allPeralatan = await getDocs(allPeralatanRef);
  
      let sum = 0;
      let count = 0;
      allPeralatan.docs.map(doc => {
        sum += doc.data().rating;
        count++;
      });
  
      await updateDoc(doc(firestore, 'penyedia', penyediaid), {
        rating: (sum / count),
      });
      closeModal();
      fetchData();
      setLoading(false);
    };
  
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={isVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Beri Nilai Peralatan</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <TouchableOpacity key={index} onPress={() => handleStarPress(index)}>
                  <FontAwesome
                    name={index < rating ? 'star' : 'star-o'}
                    size={50}
                    color="gold"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{width:150, height:30, flexDirection:'row', justifyContent:'space-between'}}>
              <TouchableOpacity style={{width:70, height:30, borderRadius:5, backgroundColor: '#FB0A0A', justifyContent:'center', alignItems:'center'}} onPress={closeModal}>
                <Text style={{color: '#FFFFFF'}}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{width:70, height:30, borderRadius:5, backgroundColor: '#459708', justifyContent:'center', alignItems:'center'}} onPress={() => handleRating(item)}>
                <Text style={{color: '#FFFFFF'}}>Kirim</Text> 
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <TopbarBack navigation={navigation} title='Transaksi'></TopbarBack>
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemRight, selectedMenu === 'Menunggu' && styles.activeMenuItem]} onPress={() => setSelectedMenu('Menunggu')}>
          <Text style={[styles.menuText, selectedMenu === 'Menunggu' && styles.activeMenuText]}>Menunggu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemLeft, selectedMenu === 'Selesai' && styles.activeMenuItem]} onPress={() => setSelectedMenu('Selesai')}>
          <Text style={[styles.menuText, selectedMenu === 'Selesai' && styles.activeMenuText]}>Selesai</Text>
        </TouchableOpacity>
      </View>
      {loading && data.length!= 0 ? (
        <></>
      ) : (
        <>
        {filteredData.length === 0 && <Text style={{ color: '#004268', textAlign: 'center', marginTop: 20 }}>Belum ada transakasi</Text>}
        <FlatList
          data={sortedFilteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={{ uri: item.foto }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <View>
                  <Text style={[styles.itemText, styles.itemTextProductName]}>{item.nama}</Text>
                  <Text style={styles.itemText}>Ukuran: {item.ukuran}</Text>    
                  <Text style={styles.itemText}>Jumlah: {item.jumlah}</Text> 
                  <Text style={styles.itemText}>Pengambilan: {item.pengambilan}</Text> 
                  <Text style={styles.itemText}>pengembalian: {item.pengembalian}</Text>
                </View>
                {item.status === "Menunggu Pembayaran"? (
                  <TouchableOpacity style={styles.itemPeriodContainer} onPress={() => navigation.navigate('UploadPembayaran', { userId: userId, transaksiId: item.transaksiId})}>
                    <Text style={[styles.itemPeriod, {backgroundColor: '#459708'}]}>Bayar</Text> 
                  </TouchableOpacity>                 
                ) : (
                  <>
                    {item.status === "Selesai" && item.rating === 0 ? (
                      <>
                        <TouchableOpacity style={styles.itemPeriodContainer} onPress={openModal}>
                          <Text style={[styles.itemPeriod, {backgroundColor: '#459708'}]}>Beri Nilai</Text> 
                          { isModalVisible && ratingModal(item, isModalVisible)}
                        </TouchableOpacity>
                      </>
                    ):(
                      <View style={styles.itemPeriodContainer}>
                        <Text style={[
                          styles.itemPeriod,
                          { 
                            backgroundColor: 
                              item.status === 'Menunggu Konfirmasi' ? 'grey' :
                              item.status === 'Aktif' ? '#459708' :
                              item.status === 'Ditolak' ? '#FB0A0A' :
                              item.status === 'Selesai' ? '#459708' : ''
                          }
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}
        />
        </>
      )}
      <View style={styles.container}>
      </View>
      <View style={{position: 'absolute', bottom: 0, width: width}}>
        <Navbar route={route} />
      </View>   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    height: height,
    paddingBottom: 60,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
    padding: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingVertical: 5,
    backgroundColor: '#fff'
  },
  menuItemLeft: {
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  menuItemRight: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  activeMenuItem: {
    backgroundColor: '#459708',
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#004268'
  },
  activeMenuText: {
    color: '#fff',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  itemImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    fontSize: 12,
  },
  itemTextProductName: {
    color: '#004268',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPeriodContainer: {
    width: 90,
    marginTop: 65,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  itemPeriod: {
    fontSize: 14,
    color: 'white', 
    textAlign: 'center',
    backgroundColor: '#51B309',
    padding: 5,
    paddingHorizontal: 18,
    borderRadius: 7,
    width: 115,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#004268',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
});

export default TransaksiPenyewaan;