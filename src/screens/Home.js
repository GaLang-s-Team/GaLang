import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import Swiper from 'react-native-swiper';
import Topback from "../component/Topback";
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { destroyKey, getKey } from '../config/localStorage'
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { firebaseAuth, firestore } from '../config/firebase'
import { signOut } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import Navbar from "../component/Navbar";
import { LinearGradient } from 'expo-linear-gradient';

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
    const docRef = doc(firestore, "users", userId);
    getDoc(docRef).then((doc) => {
        setDataUsers(doc.data());
    });

    const fetchPeralatan = async () => {
        const peralatanCollection = collection(firestore, "peralatan");
        let peralatanSnapshot;
        
        if (dataUsers.role === 'Penyedia') {
            // Jika penyedia, hanya tampilkan peralatan yang dimilikinya
            const q = query(peralatanCollection, where("penyedia", "==", userId));
            peralatanSnapshot = await getDocs(q);
        } else {
            // Jika penyewa, tampilkan semua peralatan
            peralatanSnapshot = await getDocs(peralatanCollection);
        }
        
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
}, [userId, dataUsers.role]);


    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: null
        });
    }, [isFocused, userId]);

    function formatHarga(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <Image source={{ uri: imageUrls[item.id] }} style={styles.image} />
            <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{item.nama}</Text>
                <Text style={styles.title}>Rp{formatHarga(item.harga)}</Text>
                <Text style={styles.rating}>{'★'.repeat(item.rating)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-outline" size={20} color="black" />
                    <Text style={styles.description}>Bandung</Text>
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
        <View style={{ flex: 1 }}>
            <Topback nama={dataUsers.fullname} userId={userId} />

            {dataUsers.role === 'Penyewa' && (
                <>
                    <View style={styles.swiperContainer}>
                        <Swiper
                            loop
                            autoplay
                            autoplayTimeout={2}
                            onIndexChanged={(index) => setActiveIndex(index)}
                            showsPagination={false}
                            style={styles.swiper}
                        >
                            {images.map((image, index) => (
                                <Image key={index} source={image} style={styles.image} />
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
                    <Text style={{ marginHorizontal: 'auto', marginLeft: 30, marginVertical: 20, fontWeight: 'bold', color: '#004268', fontSize: 16 }}>Perlengkapan Outdoor-mu</Text>
                </>
            )}
            {dataUsers.role === 'Penyedia' && (
                <>
                    <View style={{ flexDirection: 'row', marginHorizontal: 'auto', marginTop: 22, alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ marginHorizontal: '3%' }}>
                            <View style={{flexDirection: "column", height: 77, width: 155, backgroundColor: '#63D211', borderRadius: 10, alignItems: 'center',}}>
                                <LinearGradient colors={['#63D211', '#459708']} style={styles.buttonLinear}/>
                                <Ionicons name="bag-handle-outline" size={40} color="white" style={{marginHorizontal: 'auto', marginTop: '4%'}}/>
                                <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 2}}>Tambahkan Produk</Text>
                            </View> 
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginHorizontal: '2%' }}>
                            <View style={{ height: 77, width: 155, backgroundColor: '#63D211', borderRadius: 10, alignItems: 'center'}}>
                                <LinearGradient colors={['#63D211', '#459708']} style={styles.buttonLinear}/>
                                <Ionicons name="cash-outline" size={40} color="white" style={{marginHorizontal: 'auto', marginTop: '4%'}}/>
                                <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 2}}>Pembayaran</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginHorizontal: 'auto', marginLeft: 40, marginVertical: 20, fontWeight: 'bold', color: '#004268', fontSize: 16 }}>Katalog Produk</Text>
                </>
            )}
            <View style={styles.flatListContainer}>
                <FlatList
                    data={peralatan}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.flatListContent}
                />
            </View>
            <Navbar route={route}/>
        </View>
    );
};

const styles = StyleSheet.create({
    swiperContainer: {
        marginTop: 26,
        height: 126,
        marginHorizontal: '8%',
        borderRadius: 15,
        overflow: 'hidden'
    },
    swiper: {
        borderRadius: 15
    },
    image: {
        width: Dimensions.get('window').width * 0.84,
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
    card: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 5,
        marginVertical: 10,
        marginHorizontal: 5,
    },
    image: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    cardContent: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        fontSize: 14,
        color: '#666',
        paddingLeft: 5
    },
    rating: {
        color: 'gold',
        fontSize: 20,
    },
    flatListContainer: {
        flex: 1,
        marginHorizontal: 30,
    },
    flatListContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },buttonLinear : {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: 155,
        height: 77,
        top: 0,
        borderRadius: 8,
    }
});

export default Home;
