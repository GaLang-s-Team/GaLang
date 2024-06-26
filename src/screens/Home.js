import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import Swiper from 'react-native-swiper';
import Topback from '../component/Topback';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, DocumentSnapshot, query, where } from 'firebase/firestore';
import { destroyKey, getKey } from '../config/localStorage'
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firebaseAuth, firestore } from '../config/firebase'
import { signOut } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import Navbar from '../component/Navbar';

const Home = ({ navigation, route }) => {
    const { userId } = route.params;
    const [dataUsers, setDataUsers] = useState({});
    const [peralatan, setPeralatan] = useState([]);
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const images = [
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
    ];

    useEffect(() => {
        setIsLoading(true);
        const fetchUserData = async () => {
            try {
              const docRef = doc(firestore, 'penyewa', userId);
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

        const fetchPeralatan = async () => {
            try {
                const peralatanCollection = query(collection(firestore, 'peralatan'), where('nama', '!=', ''));
                const peralatanSnapshot = await getDocs(peralatanCollection);
                var peralatanList = peralatanSnapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
                peralatanList = peralatanList.filter(peralatan => peralatan.lokasi == dataUsers.kota);
                setPeralatan(peralatanList);
            } catch (error) {
                console.error('Error fetching peralatan:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
        fetchPeralatan()
    }, [isFocused, userId, peralatan]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null
        });
    }, [isFocused, userId]);

    function formatHarga(num) {
        if (num === null) return 0;
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    function formatRating(num) {
        if (num != 0) return `★${num}`;
        else return `Belum Diulas`;
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PeralatanDetail', { userId: userId, peralatanId: item.id_peralatan })}>
        <Image source={{ uri: item.foto.split(',')[0] }} style={styles.image} />
        <View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>{item.nama}</Text>
            <Text style={styles.harga}>Rp{formatHarga(item.harga)}</Text>
            <Text style={styles.rating}>{formatRating(item.rating)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name='location-outline' size={20} color='#004268' style={{ marginLeft:7, marginBottom:5 }}/>
                <Text style={styles.location}>{dataUsers.kota}</Text>
            </View>
        </View>
        </TouchableOpacity>
    );
    
    return (
        <View style={{ flex:1 }}>
            <Topback nama={dataUsers.nama} route={route} />
            <View style={styles.swiperContainer}>
                <Swiper 
                    loop 
                    autoplay 
                    autoplayTimeout={2.5}
                    onIndexChanged={(index) => setActiveIndex(index)}
                    showsPagination={false}
                    style={styles.swiper}
                >
                    {images.map((image, index) => (
                        <Image key={index} source={image} style={styles.imageAnimation} />
                    ))}
                </Swiper>
            </View>
            <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                    <View 
                        key={index} 
                        style={[
                            styles.dot, 
                            activeIndex === index ? styles.activeDot : styles.inactiveDot
                        ]} 
                    />
                ))}
            </View>
            <Text style={{ marginHorizontal:'auto', marginLeft:20, marginTop:10, fontWeight:'bold',color:'#004268', fontSize:16 }}>Temukan Perlengkapanmu!</Text>
            { peralatan.length === 0 ? (
                <View style={{flex:1, marginHorizontal:'auto', paddingHorizontal:20, justifyContent:'center', alignItems:'center'}}>
                    <Text style={{color:'#004268', fontSize:14, textAlign:'center'}}>Tidak ada peralatan yang tersedia di kota Anda. Cobalah untuk memilih kota lain pada halaman profile.</Text>
                </View>
            ) : (
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
            )}
            <Navbar route={route}/>
        </View>
    );
};

const styles = StyleSheet.create({
    swiperContainer: {
        marginTop: 15,
        height: 126,
        marginHorizontal: 20,
        borderRadius: 15,
        overflow: 'hidden'
    },
    swiper: {
        borderRadius: 15
    },
    imageAnimation: {
        width: '100%',
        height: 126,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    inactiveDot: {
        backgroundColor: 'rgba(0,0,0,.2)',
    },
    activeDot: {
        backgroundColor: '#000',
    },
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
        fontSize: 14,
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

export default Home;
