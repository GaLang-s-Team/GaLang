import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import Swiper from 'react-native-swiper';
import Topback from '../component/Topback';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, DocumentSnapshot } from 'firebase/firestore';
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
    const [imageUrls, setImageUrls] = useState({});
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const storage = getStorage();

    const images = [
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
    ];

    useEffect(() => {
        setIsLoading(true);
        const docRef = doc(firestore, 'users', userId);
        getDoc(docRef).then((doc) => {
            setDataUsers(doc.data());
        });

        const fetchPeralatan = async () => {
            const peralatanCollection = collection(firestore, 'peralatan');
            const peralatanSnapshot = await getDocs(peralatanCollection);
            const peralatanList = peralatanSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Fetch image URLs for each peralatan
            const urls = {};
            await Promise.all(peralatanList.map(async (item) => {
                if (item.foto) {
                    const urlArray = item.foto.split(',');
                    if (urlArray.length > 0) {
                        urls[item.id] = urlArray[0].trim(); // Use the first URL
                    }
                }
            }));

            setPeralatan(peralatanList);
            setImageUrls(urls);
        };

        fetchPeralatan().finally(() => {
            setIsLoading(false);
        });
    }, [userId]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null
        });
    }, [isFocused, userId]);

    function formatHarga(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    function formatRating(num) {
        if (num != 0) return `★${num}`;
        else return `Belum Diulas`;
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PeralatanDetail', { peralatanId: item.id_peralatan })}>
        <Image source={{ uri: item.foto.split(',')[0] }} style={styles.image} />
        <View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>{item.nama}</Text>
            <Text style={styles.harga}>Rp{formatHarga(item.harga)}</Text>
            <Text style={styles.rating}>{formatRating(item.rating)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name='location-outline' size={20} color='#004268' style={{ marginLeft:9, marginBottom:5 }}/>
                <Text style={styles.location}>Bandung</Text>
            </View>
        </View>
        </TouchableOpacity>
    );

    const handleLogout = () => {
        signOut(firebaseAuth).then(() => {
            destroyKey();
            navigation.replace('Signin');
        });
    };
    
    return (
        <View style={{ flex:1 }}>
            <Topback nama={dataUsers.fullname} userId={userId} />
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
        width: 90,
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

export default Home;
