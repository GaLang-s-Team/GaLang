import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { firebaseAuth, firestore, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { update } from 'firebase/database';

const { width } = Dimensions.get('window');

const UploadPembayaran = ({ navigation, route }) => {
    const { userId, transaksiId } = route.params;

    const [productName, setProductName] = useState(null);
    const [pembayaran, setPembayaran] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [orderAmount, setOrderAmount] = useState(null);
    const [deliveryAmount, setDeliveryAmount] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const informasiPenyewaanRef = collection(firestore, 'informasi_penyewaan');
        
                const snapshotInformasiPenyewaan = await getDocs(informasiPenyewaanRef);

                const peralatan = snapshotInformasiPenyewaan.docs[0].data().peralatan;
                const peralatanRef = collection(firestore, "peralatan");
                const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', peralatan));
                const snapshotPeralatan = await getDocs(queryPeralatan);
                
                const productName = snapshotPeralatan.docs[0].data().nama;
                const pembayaran = snapshotInformasiPenyewaan.docs[0].data().pembayaran;
                const productImage = snapshotPeralatan.docs[0].data().foto;
                const orderAmount = snapshotInformasiPenyewaan.docs[0].data().total_harga;
                const uploadedImage = snapshotInformasiPenyewaan.docs[0].data().bukti_pembayaran;

                setProductName(productName);
                setPembayaran(pembayaran);
                setProductImage(productImage);
                setOrderAmount(orderAmount);
                setUploadedImage(uploadedImage);
            } catch (error) {
                console.error('Error fetching documents: ', error);
            }

            setIsLoading(false);
        }
        fetchData();
    }, []);

    const handleUploadBukti = async () => {
        setIsLoading(true);
        try {
            const result = await launchImageLibraryAsync({
                mediaTypes: 'Images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
    
            if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
                const { uri } = result.assets[0];
                
                const imageName = uri.substring(uri.lastIndexOf('/') + 1);
                const response = await fetch(uri);
                const blob = await response.blob();
    
                const storageRef = ref(storage, `pembayaran/${imageName}`);
                await uploadBytes(storageRef, blob);
    
                const downloadURL = await getDownloadURL(storageRef);
    
                setUploadedImage(downloadURL);
            } else {
                console.log('Image selection cancelled or URI is undefined.');
                console.log('Result:', result);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
        }
        setIsLoading(false);
    };

    const handleUploadPembayaran = async () => {
        setIsLoading(true);
        try {
            const downloadURL = uploadedImage;
            if (downloadURL) {         
                const q = query(collection(firestore, "informasi_penyewaan"), where("id_transaksi", "==", transaksiId));
                const querySnapshot = await getDocs(q);

                var docID = querySnapshot.docs[0].id;
                const colRef = doc(firestore, "informasi_penyewaan", docID);
                await updateDoc(colRef, {
                    bukti_pembayaran: downloadURL
                })
                console.log('upload sukses')
            }
            console.log('upload success');
        } catch (error) {
            console.error('Failed to upload pembayaran:', error);
        }
        setIsLoading(false)
    };

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={{ padding: 20, position: 'relative', height: '100%' }}>
            <Text style={{ color: '#004268', marginBottom: 10 }}>Produk</Text>
            <View style={{ padding: 10, flexDirection: 'row', borderRadius: 10, backgroundColor: 'white' }}>
                <Image source={{ uri: productImage }} style={{ width: width * 0.3, height: width * 0.3, borderRadius: 10, }} />
                <View style={{ padding: 5, flex: 1, paddingLeft: 20 }}>
                    <Text style={{ color:'#004268', fontWeight:'bold', fontSize:21 }}>{productName}</Text>
                </View>
            </View>
            <Text style={{marginTop: 20, color: '#004268', marginBottom: 20}}>Bukti Pembayaran</Text>
            {uploadedImage && (
                <Image source={{ uri: uploadedImage }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
            )}
            <View style={{position: 'absolute', bottom: 20, width: '100%', left: 20}}>
                <TouchableOpacity onPress={handleUploadBukti} style={{ marginTop: 20, padding: 5, borderRadius: 10, backgroundColor: '#459708', width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Upload Bukti</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <Text style={{color: '#9B9B9B'}}>Total Tagihan:</Text>
                    <Text>{'Rp'+orderAmount}</Text>
                </View>
                <TouchableOpacity onPress={handleUploadPembayaran} style={{ width: '100%', padding: 5, borderRadius: 10, backgroundColor: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Upload Pembayaran</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UploadPembayaran;