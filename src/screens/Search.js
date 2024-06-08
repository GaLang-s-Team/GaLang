import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Alert, View, StyleSheet, Image, Dimensions, Text, TouchableOpacity, Pressable, FlatList, TextInput } from 'react-native';
import Swiper from 'react-native-swiper';
import TopbarBack from '../component/TopbarBack';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, addDoc, query, where, getDoc, getDocs, updateDoc } from 'firebase/firestore';

import { firestore } from '../config/firebase';

export default function Search({ navigation, route }) {
  const { userId, keyword } = route.params;

  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(keyword);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    try {
      parseQuery = searchQuery.split(' ');
      arrayQuery = [];
      
      for (let i = 0; i < parseQuery.length; i++) {
        arrayQuery.push(capitalizeFirstLetter(parseQuery[i]));
        arrayQuery.push(toLowerCase(parseQuery[i]));
        arrayQuery.push(toUpperCase(parseQuery[i]));
      }

      const peralatanRef = query(collection(firestore, 'peralatan'), where('search', 'array-contains-any', arrayQuery));
      const peralatanDoc = await getDocs(peralatanRef);
      const results = peralatanDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching: ', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleSearch();
  }, []);

  function formatHarga(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  function formatRating(num) {
    if (num != 0) return `★${num}`;
    else return `Belum Diulas`;
  }

  function capitalizeFirstLetter(str) {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function toLowerCase(str) {
    return str.toLowerCase();
  }

  function toUpperCase(str) {
    return str.toUpperCase();
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

  return (
    <View style={styles.container}>
      <TopbarBack navigation={navigation} title='Cari Peralatan' />
      <View style={{ borderRadius:30, marginHorizontal:'auto', marginBottom:10, paddingHorizontal:15, borderColor:'#004268', borderWidth:1, flexDirection:'row', alignItems:'center', height:45, width:'90%', backgroundColor:'#FFFFFF' }}>
        <Ionicons name='search-outline' size={24} color='#004268' style={{ marginRight: 10 }} />
        <TextInput
          style={{ flex: 1, paddingLeft:10 }}
          color='#004268'
          placeholder='Search Your Gear...'
          label={'Search'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      <View style={styles.content}>
        { searchResults.length === 0 && !loading &&
          <View style={{ height:'90%', justifyContent:'center', alignItems:'center' }}>
            <Text style={{ color:'#004268', fontWeight:'semibold', fontSize:21 }}>Peralatan tidak ditemukan</Text>
          </View> }
        <View style={styles.container}>
          <FlatList
            data={searchResults}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.flatListContainer}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.flatListContainer}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '100%',
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