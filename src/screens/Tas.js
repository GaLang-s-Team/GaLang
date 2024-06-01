import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import Navbar from '../component/Navbar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseAuth, firestore, storage } from '../config/firebase';

const { width } = Dimensions.get('window');

const Tas = ({ navigation, userId }) => {
    
    const [peralatan, setPeralatan] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        try {
            const keranjangRef = collection(firestore, 'keranjang');
            const queryKeranjang = query(keranjangRef, where('userId', '==', userId));
            const snapshotKeranjang = await getDocs(queryKeranjang);

            // Initialize an empty array to store the JSON objects
            const peralatanArray = [];

            // Iterate through the snapshot and create the JSON object
            for (const doc of snapshotKeranjang.docs) {
                const data = doc.data();
                const id_peralatan = data.id_peralatan;
                const peralatanData = {
                    id_peralatan: id_peralatan,
                    nama: '',
                    foto: ''
                };

                // Fetch additional data for each item
                const peralatanRef = collection(firestore, 'peralatan');
                const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', id_peralatan));
                const snapshotPeralatan = await getDocs(queryPeralatan);

                if (!snapshotPeralatan.empty) {
                    const peralatanDoc = snapshotPeralatan.docs[0].data();
                    peralatanData.nama = peralatanDoc.nama || '';
                    peralatanData.foto = peralatanDoc.foto || '';
                }

                peralatanArray.push(peralatanData);
            }

            // Update the state with the fetched data
            setPeralatan(peralatanArray);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    // const { userId } = route.params;

    useEffect(() => {
        console.log('userId', userId)
        setLoading(true);
        fetchData();
        
        setLoading(false)
    }, [])

    if (loading) {
        return<></>
    }

    return (
        <View style={styles.container}>
            <Navbar navigation={navigation} />
            <FlatList
                data={peralatan}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text>ID Peralatan: {item.id_peralatan}</Text>
                        <Text>Nama: {item.nama}</Text>
                        <Text>Foto: {item.foto}</Text>
                        {/* Render other item details here */}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    // Add other styles here
});

export default Tas;