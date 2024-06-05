import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Alert, View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, Pressable, FlatList } from 'react-native';
import Swiper from 'react-native-swiper';
import Topback from '../component/Topback';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, addDoc, query, where, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

import Navbar from '../component/Navbar';
import { destroyKey, getKey } from '../config/localStorage'
import { firebaseAuth, firestore } from '../config/firebase'
import NavDash from '../component/NavDash';
import TopbackDash from '../component/TopbackDash';
import { set } from 'firebase/database';

export default function Dashboard({ navigation, route }) {
    const { userId } = route.params;

    const [dataUsers, setDataUsers] = useState({});
    const [peralatan, setPeralatan] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [tagihan, setTagihan] = useState(0);
    const [reviewTagihan, setReviewTagihan] = useState(false);
    const [rating, setRating] = useState('');
    const [lokasi, setLokasi] = useState('');
    
    const isFocused = useIsFocused();

    useEffect(() => {
    setIsLoading(true);
    const fetchUserData = async () => {
        try {
            const docRef = doc(firestore, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setDataUsers(docSnap.data());
            } else {
                console.log('No such user document!');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchPeralatanAndPenyedia = async () => {
        try {
            const peralatanRef = query(collection(firestore, 'peralatan'), where('penyedia', '==', userId));
            const peralatanDoc = await getDocs(peralatanRef);
            if (!peralatanDoc.empty) {
                const peralatanInfo = peralatanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPeralatan(peralatanInfo);
            } else {
                console.log('No such peralatan!');
            }

            const penyediaRef = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', userId));
            const penyediaDoc = await getDocs(penyediaRef);
            if (penyediaDoc) {
              penyediaDoc.forEach(documentSnapshot => {
                setTagihan(formatHarga(documentSnapshot.data().tagihan));
                setReviewTagihan(documentSnapshot.data().review_tagihan);
                setRating(documentSnapshot.data().rating);
                setLokasi(documentSnapshot.data().kota);
              });
            } else {
                console.log('No such penyedia!');
            }
        } catch (error) {
            console.error('Error fetching peralatan or penyedia:', error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchUserData();
    fetchPeralatanAndPenyedia();
}, [isFocused, userId]);


    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null
        });
    }, [isFocused, userId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PeralatanEdit', { userId: userId, peralatanId: item.id_peralatan })}>
            <Image source={{ uri: item.foto.split(',')[0] }} style={styles.image} />
            <View>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>{item.nama}</Text>
                <Text style={styles.harga}>Rp{formatHarga(item.harga)}</Text>
                <Text style={styles.rating}>{formatRating(item.rating)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name='location-outline' size={20} color='#004268' style={{ marginLeft:9, marginBottom:5 }}/>
                    <Text style={styles.location}>{lokasi}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleBooster = async () => {
      const docRef = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', userId));
      const docId = (await getDocs(docRef)).docs[0].id;
      
      const penyediaRef = doc(firestore, 'penyedia', docId);
      const penyediaDoc = await getDoc(penyediaRef);

      try {
        if (penyediaDoc) {
          const currentData = penyediaDoc.data();
          const currentTagihan = currentData['tagihan'];
  
          if (typeof currentTagihan === 'number') {
            const newTagihan = parseInt(currentTagihan) + parseInt(1000);
  
            await updateDoc(penyediaRef, {
              ['tagihan']: newTagihan,
            });
            setTagihan(formatHarga(newTagihan));
  
            Alert.alert('Success', 'Document updated successfully.');
          } else {
            Alert.alert('Error', 'The attribute value is not a number.');
          }
        } else {
          Alert.alert('Error', 'No such document.');
        }
      } catch (error) {
        console.error('Error updating document: ', error);
        Alert.alert('Error', 'Failed to update document.');
      }
    }

    function formatHarga(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    function formatRating(num) {
      if (num != 0) return `★${num}`;
      else return `Belum Diulas`;
    }

    return (
      <View style={{ flex:1 }}>
          <Topback nama={dataUsers.fullname} route={route} />
          { reviewTagihan ? (
            <Text style={{ marginHorizontal:'auto', marginLeft:20, marginTop:15, fontWeight:'bold',color:'#004268', fontSize:16 }}>Tagihan: Rp{tagihan} (Pembayaran sedang diperiksa)</Text>
          ) : (
            <Text style={{ marginHorizontal:'auto', marginLeft:20, marginTop:15, fontWeight:'bold',color:'#004268', fontSize:16 }}>Tagihan: Rp{tagihan}</Text>
          )}
          <Text style={{ marginHorizontal:'auto', marginLeft:20, fontWeight:'bold',color:'#004268', fontSize:16 }}>Rating: ★{rating}</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:5, marginHorizontal:20, marginTop:15 }}>
            <Pressable style={{backgroundColor:'#459708', padding:10, borderRadius:10, width:'47.5%'}} onPress={() => navigation.navigate('PembayaranTagihan', {userId: userId})}>
              <Text style={{color:'white', fontSize:16, fontWeight:'bold', textAlign:'center' }}>Bayar Tagihan</Text>
            </Pressable>
            <Pressable style={{ backgroundColor: '#459708', padding: 10, borderRadius: 10, width: '47.5%' }} onPress={handleBooster}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Aktifkan Booster</Text>
            </Pressable>
        </View>
        <View style={styles.container}>
            <FlatList
                data={peralatan}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.flatListContainer}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.flatListContainer}
            />
        </View>
        <TouchableOpacity style={{ position: 'absolute', backgroundColor: '#459708', width: 35, height: 35, bottom: 70, right: 25, borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => navigation.navigate('PeralatanInsert', { userId: userId })}>
            <Ionicons name='add' size={24} color='#FFFFFF' />
        </TouchableOpacity>
        <NavDash route={route} />
    </View>
);

  };
  
  const styles = StyleSheet.create({
    image: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 10,
      marginBottom: 15,
      width: '48%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    row: {
      flex: 1,
      justifyContent: 'space-between',
    },
    title: {
      color: '#004268',
      marginHorizontal: 10,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    harga: {
      color: '#004268',
      marginHorizontal: 10,
      fontSize: 16,
      marginBottom: 5,
    },
    location: {
      color: '#004268',
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    rating: {
      color: '#004268',
      fontSize: 20,
      paddingLeft: 10,
    },
    container: {
      flex: 1,
    },
    flatListContainer: {
      paddingHorizontal: 10,
      paddingTop: 5,
    },
    flatListContent: {
      width: '100%',
      flexGrow: 1,
    },
});
