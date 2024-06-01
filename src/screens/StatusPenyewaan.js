// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import Navbar from '../component/Navbar';

const { width } = Dimensions.get('window');

const StatusPenyewaan = ({ navigation, route }) => {
  const [selectedMenu, setSelectedMenu] = useState('berhasil');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  

  useEffect(() => {
    const fetchData = async () => {
        //   const snapshot = await firebase.firestore().collection('InformasiPenyewaan').get();
        //   const items = await Promise.all(snapshot.docs.map(async doc => {
        //     const item = doc.data();
        //     const peralatanDoc = await firebase.firestore().collection('Peralatan').doc(item.peralatan).get();
        //     const peralatan = peralatanDoc.data();
        //     return {
        //       id: doc.id,
        //       pembayaran: item.pembayaran,
        //       waktu: item.waktu,
        //       nama: peralatan.nama,
        //     };
        //   }));
        const items = [
            {
                id: '1',
                pembayaran: true,
                waktu: '2 hours',
                nama: 'Tent',
            },
            {
                id: '2',
                pembayaran: false,
                waktu: '1 day',
                nama: 'Sleeping Bag',
            },
            {
                id: '3',
                pembayaran: true,
                waktu: '3 days',
                nama: 'Camping Stove',
            },
            {
                id: '4',
                pembayaran: false,
                waktu: '4 hours',
                nama: 'Hiking Heels',
            },
            {
                id: '5',
                pembayaran: false,
                waktu: '1 day',
                nama: 'a',
            },
            {
                id: '6',
                pembayaran: false,
                waktu: '1 day',
                nama: 'b',
            },
            {
                id: '7',
                pembayaran: false,
                waktu: '1 day',
                nama: 'c',
            },
            {
                id: '8',
                pembayaran: false,
                waktu: '1 day',
                nama: 'd',
            },
            {
                id: '9',
                pembayaran: false,
                waktu: '1 day',
                nama: 'e',
            },
            {
                id: '10',
                pembayaran: false,
                waktu: '1 day',
                nama: 'f',
            },
        ];
        setData(items);
        setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = data.filter(item => item.pembayaran === (selectedMenu === 'berhasil'));

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemLeft, selectedMenu === 'berhasil' && styles.activeMenuItem]} onPress={() => setSelectedMenu('berhasil')}>
          <Text style={[styles.menuText, selectedMenu === 'berhasil' && styles.activeMenuText]}>Berhasil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemRight, selectedMenu === 'ditolak' && styles.activeMenuItem]} onPress={() => setSelectedMenu('ditolak')}>
          <Text style={[styles.menuText, selectedMenu === 'ditolak' && styles.activeMenuText]}>Ditolak</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Image source={ require('../../assets/Sepatu.jpg') } style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemText, styles.itemTextProductName]}>{item.nama}</Text>
                <Text style={styles.itemText}>{item.pembayaran ? 'Pembayaran Berhasil' : 'Pembayaran Ditolak'}</Text>               
                <View style={styles.itemPeriodContainer}>
                    <Text style={styles.itemPeriod}>Periode sewa: {item.waktu}</Text>
                </View>
              </View>
              {/* <View style={styles.itemPeriodContainer}>
                <Text style={styles.itemPeriod}>Periode sewa: {item.waktu}</Text>
              </View> */}
            </View>
          )}
        />
      )}
      <Navbar/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: 'black',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width,
    backgroundColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'black',
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
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  itemImage: {
    width: '30%',
    height: '100%',
    marginRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
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
    borderColor: 'black',
    borderWidth: 1,
  },
  itemPeriod: {
    fontSize: 10,
    color: 'white', 
    borderWidth: 1, 
    borderColor: 'black', 
    textAlign: 'center',
    backgroundColor: '#51B309',
    padding: 5,
    paddingHorizontal: 18,
    borderRadius: 7,
    width: '70%',
  },
});

export default StatusPenyewaan;