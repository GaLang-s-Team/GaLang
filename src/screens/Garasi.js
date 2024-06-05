import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import Navbar from '../component/Navbar';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import TopbarBack from '../component/TopbarBack';

const { width } = Dimensions.get('window');

const Garasi = ({ navigation, route }) => {
    const { userId } = route.params;
    const [peralatan, setPeralatan] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const keranjangRef = collection(firestore, 'keranjang');
            const queryKeranjang = query(keranjangRef, where('userId', '==', userId));
            const snapshotKeranjang = await getDocs(queryKeranjang);

            // Initialize an empty array to store the JSON objects
            const peralatanArray = [];

            // Iterate through the snapshot and create the JSON object
            for (const doc of snapshotKeranjang.docs) {
                const data = doc.data();
                const id_peralatan = data.id_peralatan.split(',');

                for (let i = 0; i < id_peralatan.length; i++) {
                    const peralatanData = {
                        id_peralatan: id_peralatan[i],
                        nama: '',
                        foto: ''
                    };

                    // Fetch additional data for each item
                    const peralatanRef = collection(firestore, 'peralatan');
                    const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', id_peralatan[i]));
                    const snapshotPeralatan = await getDocs(queryPeralatan);

                    if (!snapshotPeralatan.empty) {
                        const peralatanDoc = snapshotPeralatan.docs[0].data();
                        peralatanData.nama = peralatanDoc.nama || '';
                        peralatanData.foto = peralatanDoc.foto || '';
                    }

                    peralatanArray.push(peralatanData);
                }
            }

            // Update the state with the fetched data
            setPeralatan(peralatanArray);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
        setIsLoading(false);

    }

    const deleteItem = async (id_peralatan) => {
        setIsLoading(true);
        try {
            // Assuming each item in 'keranjang' collection has a unique id
            const keranjangRef = collection(firestore, 'keranjang');
            const queryKeranjang = query(keranjangRef, where('userId', '==', userId));
            const snapshotKeranjang = await getDocs(queryKeranjang);

            if (!snapshotKeranjang.empty) {
                // Delete each document that matches the query
                if (snapshotKeranjang.docs[0].data().id_peralatan.includes(',')) {
                    var arrPeralatan = snapshotKeranjang.docs[0].data().id_peralatan.split(',');
                    var index = arrPeralatan.indexOf(id_peralatan);
                    if (index > -1) {
                        arrPeralatan.splice(index, 1);
                    }
                    await updateDoc(doc(firestore, 'keranjang', snapshotKeranjang.docs[0].id), {
                        id_peralatan: arrPeralatan.join(',')
                    });
                } else {
                    await deleteDoc(doc(firestore, 'keranjang', snapshotKeranjang.docs[0].id));
                }
                // Refresh the data
                fetchData();
            }
        } catch (error) {
            console.error("Error deleting item: ", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();     
    }, [])

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <TopbarBack navigation={navigation} title='Keranjang' />
            
            <FlatList
                data={peralatan}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.foto }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemText, styles.itemTextProductName]}>{item.nama}</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, {marginRight: 20,}]} onPress={() => navigation.navigate('PeralatanDetail', { userId: userId, peralatanId: item.id_peralatan })}>
                                    <Text style={{color: 'white'}}>Detail</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, {backgroundColor: '#FB0A0A'}]} onPress={() => deleteItem(item.id_peralatan)}>
                                    <Text style={{color: 'white'}}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
            <Navbar route={route} />
        </View>
        
    );

}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    button: {
        fontSize: 10,
        color: 'white', 
        textAlign: 'center',
        backgroundColor: '#51B309',
        padding: 5,
        paddingHorizontal: 18,
        borderRadius: 7,
    },
    container: {
        flex: 1,
        padding: 0,
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
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
        width: width * 0.3, 
        height: width * 0.3,
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
    // Add other styles here
});

export default Garasi;