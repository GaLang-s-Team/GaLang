import React, { useState } from "react";
import { View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, FlatList } from 'react-native';
import Swiper from 'react-native-swiper';
import Topback from "../component/Topback";
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from "react-native-gesture-handler";
import Navbar from "../component/Navbar";

const Home = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = [
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
        require('../../assets/Sepatu.jpg'),
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <Image source={item} style={styles.image} />
            <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">Perlengkapan Outdoor</Text>
                <Text style={styles.title}>Rp150.000</Text>
                <Text style={styles.rating}>★★★★★</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-outline" size={20} color="black" />
                    <Text style={styles.description}>Bandung</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
            <Topback />
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
            <Text style={{ marginHorizontal:'auto', marginLeft: 30, marginVertical: 20, fontWeight:'bold',color:'#004268', fontSize: 16 }}>Perlengkapan Outdoor-mu</Text>
            
            <View style={styles.flatListContainer}>
                <FlatList
                    data={images}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.flatListContent}
                />
            </View>
            </ScrollView>
            <Navbar/>
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
        width: 160, // Explicitly set the width // Explicitly set the height
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
    },
});

export default Home;
