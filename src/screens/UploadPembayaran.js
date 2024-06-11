import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { firestore, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import TopbarBack from '../component/TopbarBack';
import * as ImageManipulator from 'expo-image-manipulator';

const { width } = Dimensions.get('window');

const UploadPembayaran = ({ navigation, route }) => {
    const { userId, transaksiId } = route.params;

    const [productName, setProductName] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [jumlah, setJumlah] = useState(0);
    const [pengambilan, setPengambilan] = useState('');
    const [pengembalian, setPengembalian] = useState('');
    const [orderAmount, setOrderAmount] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const informasiPenyewaanRef = collection(firestore, 'informasi_penyewaan');
                const queryInformasiPenyewaan = query(informasiPenyewaanRef, where("id_transaksi", "==", transaksiId));
                const snapshotInformasiPenyewaan = await getDocs(queryInformasiPenyewaan);

                const peralatan = snapshotInformasiPenyewaan.docs[0].data().peralatan;
                const peralatanRef = collection(firestore, "peralatan");
                const queryPeralatan = query(peralatanRef, where("id_peralatan", "==", peralatan));
                const snapshotPeralatan = await getDocs(queryPeralatan);
                
                const productName = snapshotPeralatan.docs[0].data().nama;
                const productImage = snapshotPeralatan.docs[0].data().foto.split(',')[0];
                const jumlah = snapshotInformasiPenyewaan.docs[0].data().jumlah;
                const pengambilan = snapshotInformasiPenyewaan.docs[0].data().pengambilan;
                const pengembalian = snapshotInformasiPenyewaan.docs[0].data().pengembalian;
                const orderAmount = snapshotInformasiPenyewaan.docs[0].data().total_harga;
                const uploadedImage = snapshotInformasiPenyewaan.docs[0].data().bukti_pembayaran;

                setProductName(productName);
                setProductImage(productImage);
                setJumlah(jumlah);
                setPengambilan(pengambilan);
                setPengembalian(pengembalian);
                setOrderAmount(orderAmount);
                setUploadedImage(uploadedImage);
            } catch (error) {
                console.error('Error fetching documents: ', error);
            }

            setIsLoading(false);
        }
        fetchData();
    }, []);

    const compressImage = async (uri) => {
        const manipResult = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }], // Resize image to width 800, keeping aspect ratio
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
    };

    const handleUploadBukti = async () => {
        setIsLoading(true);
        try {
            const result = await launchImageLibraryAsync({
                mediaTypes: 'Images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
    
            if (!result.canceled && result.assets.length > 0 && result.assets[0].uri) {
                const { uri } = result.assets[0];
                
                const imageName = uri.substring(uri.lastIndexOf('/') + 1);
                const compressedUri = await compressImage(uri);
                const response = await fetch(compressedUri);
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
        const uploadPembayaran = async () => {
            setIsLoading(true);
            try {
                const downloadURL = uploadedImage;
                if (downloadURL) {         
                    const q = query(collection(firestore, "informasi_penyewaan"), where("id_transaksi", "==", transaksiId));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.docs[0].data().bukti_pembayaran == "") {
                        var docID = querySnapshot.docs[0].id;
                        const colRef = doc(firestore, "informasi_penyewaan", docID);
                        await updateDoc(colRef, {
                            bukti_pembayaran: downloadURL
                        })
                        Alert.alert('Bukti Pembayaran', 'Bukti pembayaran berhasil diupload');
                        console.log('upload sukses')
                    } else {
                        Alert.alert('Bukti Pembayaran', 'Bukti pembayaran hanya dapat diupload sekali');
                    }
                }
            } catch (error) {
                console.error('Failed to upload pembayaran:', error);
            }
            setIsLoading(false);
        };

        Alert.alert('Upload Pembayaran', 'Apakah Anda yakin ingin mengunggah bukti pembayaran? Harap periksa kembali bukti pembayaran Anda karena hanya dapat diunggah sekali', [
            {
                text: 'Batal',
                style: 'cancel',
            },
            {
                text: 'Ya',
                onPress: () => uploadPembayaran(),
            }
        ]);
    };

    function formatHarga(num) {
        if (num === null) return 0;
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    return (
        <View style={{position: 'relative', height: '100%'}}>
            <TopbarBack navigation={navigation} title='Pembayaran' />
            <View style={{ paddingHorizontal: 20, position: 'relative', height: '85%' }}>
            <Text style={{ color: '#004268', marginBottom: 10, fontSize:21, fontWeight:'bold' }}>Produk</Text>
                <View style={{ padding: 10, flexDirection: 'row', borderRadius: 10, backgroundColor: 'white' }}>
                    <Image source={{ uri: productImage }} style={{ width: width * 0.3, height: width * 0.3, borderRadius: 10, }} />
                    <View style={{ padding: 5, flex: 1, paddingLeft: 20 }}>
                        <Text style={{ color:'#004268', fontWeight:'bold', fontSize:18 }}>{productName}</Text>
                        <Text style={{ color: '#004268', marginTop: 5 }}>Jumlah: {jumlah}</Text>
                        <Text style={{ color: '#004268' }}>Pengambilan: {pengambilan}</Text>
                        <Text style={{ color: '#004268' }}>Pengembalian: {pengembalian}</Text>
                    </View>
                </View>
                <Text style={{marginTop: 20, color: '#004268', marginBottom: 20, fontSize:21, fontWeight:'bold'}}>Bukti Pembayaran</Text>
                {uploadedImage && !isLoading && (
                    <Image source={{ uri: uploadedImage }} style={{ width: '100%', height: 275, borderRadius: 10 }} />
                )}
                {!uploadedImage && !isLoading && (
                    <Text style={{ color: '#004268', textAlign: 'center', marginTop: 20, fontSize:14 }}>Bukti pembayaran belum diupload</Text>
                )}
            </View>
            {uploadedImage === ""? 
                <View style={{position: 'absolute', bottom: 170, width: '100%', paddingLeft: 20, paddingRight: 20}}>
                    <TouchableOpacity onPress={handleUploadBukti} style={{ marginTop: 20, padding: 5, borderRadius: 10, backgroundColor: '#459708', width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                        <Text style={{ color: 'white', textAlign: 'center' }}>Upload Bukti</Text>
                    </TouchableOpacity>
                </View>
                :
                <></>
            }
            <View style={{position: 'absolute', bottom: 20, width: '100%', paddingLeft: 20, paddingRight: 20}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <Text style={{color: '#9B9B9B'}}>Total Tagihan:</Text>
                    <Text>Rp{formatHarga(orderAmount)}</Text>
                </View>
                <TouchableOpacity onPress={handleUploadPembayaran} style={{ width: '100%', padding: 5, borderRadius: 10, backgroundColor: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Upload Pembayaran</Text>
                </TouchableOpacity>
            </View>
        </View>
        
    );
};

export default UploadPembayaran;