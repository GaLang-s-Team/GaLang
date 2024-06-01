import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import Navbar from '../component/Navbar';
import { collection, query, where, getDocs, } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import TopbarBack from '../component/TopbarBack';

const { height, width } = Dimensions.get('window');

const TransaksiPenyewaan = ({ navigation, route }) => {
  const [selectedMenu, setSelectedMenu] = useState('Menunggu');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = route.params;

  const fetchData = async () => {
    setLoading(true);
    try {
      const informasiPenyewaanRef = collection(firestore, 'informasi_penyewaan');
      const queryInformasiPenyewaan = query(informasiPenyewaanRef, where("penyewa", "==", userId));
      const snapshotInformasiPenyewaan = await getDocs(queryInformasiPenyewaan);
      const informasiPenyewaanDataPromises = snapshotInformasiPenyewaan.docs.map(async (doc) => {
        const data = doc.data();
        const peralatanRef = collection(firestore, 'peralatan');
        const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', data.peralatan));
        const snapshotPeralatan = await getDocs(queryPeralatan);

        return {
          transaksiId: data.id_transaksi,
          nama: snapshotPeralatan.docs[0].data().nama,
          ukuran: data.ukuran,
          jumlah: data.jumlah,
          pengambilan: data.pengambilan,
          pengembalian: data.pengembalian,
          status: data.status,
          foto: snapshotPeralatan.docs[0].data().foto
        };
      });

      const informasiPenyewaanData = await Promise.all(informasiPenyewaanDataPromises);
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
  if (selectedMenu === "Menunggu") {
    filteredData = data.filter(item => item.status === "Menunggu Konfirmasi" || item.status === "Menunggu Pembayaran");
  }
  else if (selectedMenu === "Selesai") {
    filteredData = data.filter(item => item.status === "Ditolak" || item.status === "Selesai" || item.status === "Aktif");
  }

  return (
    <View style={styles.container}>
      <TopbarBack navigation={navigation} title='Transaksi'></TopbarBack>
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemLeft, selectedMenu === 'Selesai' && styles.activeMenuItem]} onPress={() => setSelectedMenu('Selesai')}>
          <Text style={[styles.menuText, selectedMenu === 'Selesai' && styles.activeMenuText]}>Selesai</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemRight, selectedMenu === 'Menunggu' && styles.activeMenuItem]} onPress={() => setSelectedMenu('Menunggu')}>
          <Text style={[styles.menuText, selectedMenu === 'Menunggu' && styles.activeMenuText]}>Menunggu</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <></>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={{ uri: item.foto }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemText, styles.itemTextProductName]}>{item.nama}</Text>
                <Text style={styles.itemText}>Ukuran: {item.ukuran}</Text>    
                <Text style={styles.itemText}>Jumlah: {item.jumlah}</Text> 
                <Text style={styles.itemText}>Start: {item.pengambilan}</Text> 
                <Text style={styles.itemText}>End: {item.pengembalian}</Text>            
                {item.status === "Menunggu Pembayaran"? 
                  <TouchableOpacity style={styles.itemPeriodContainer} onPress={() => navigation.navigate('UploadPembayaran', { userId: userId, transaksiId: item.transaksiId})}>
                    <Text style={[styles.itemPeriod, {backgroundColor: 'blue'}]}>Bayar</Text> 
                  </TouchableOpacity>                 
                  : 
                  <View style={styles.itemPeriodContainer}>
                    <Text style={[
                      styles.itemPeriod,
                      { 
                        backgroundColor: 
                          item.status === 'Menunggu Konfirmasi' ? 'grey' : 
                          item.status === 'Aktif' ? 'green' : 
                          item.status === 'Ditolak' ? 'red' : '#E4E7C9' // default color if no match
                      }
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                }
              </View>
            </View>
          )}
        />
      )}
      <View style={{position: 'absolute', bottom: 0, width: width}}>
        <Navbar route={route} />
      </View>   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd',
    position: 'relative',
    height: height,
    paddingBottom: 60,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
    backgroundColor: '#ddd',
    padding: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    paddingVertical: 5,
    backgroundColor: '#fff'
  },
  menuItemLeft: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20
  },
  menuItemRight: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
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
    flexDirection: 'row',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  itemImage: {
    width: '30%',
    height: '100%',
    marginRight: 10,
    borderRadius: 5,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
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
    paddingTop: 30,
    alignItems: 'flex-end',
  },
  itemPeriod: {
    fontSize: 10,
    color: 'white', 
    textAlign: 'center',
    backgroundColor: '#51B309',
    padding: 5,
    paddingHorizontal: 18,
    borderRadius: 7,
    width: '70%',
  },
});

export default TransaksiPenyewaan;