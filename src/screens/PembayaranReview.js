import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, Alert } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { firebaseAuth, firestore, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { update } from 'firebase/database';
import TopbarBack from '../component/TopbarBack';

const { width } = Dimensions.get('window');

export default function PembayaranReview ({ navigation, route }) {
    const { userId, transaksiId } = route.params;

    const [productName, setProductName] = useState(null);
    const [pembayaran, setPembayaran] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [jumlah, setJumlah] = useState(0);
    const [pengambilan, setPengambilan] = useState('');
    const [pengembalian, setPengembalian] = useState('');
    const [orderAmount, setOrderAmount] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const informasiPenyewaanRef = collection(firestore, 'informasi_penyewaan');
            const queryPenyewaan = query(informasiPenyewaanRef, where('id_transaksi', '==', transaksiId));
            const snapshotInformasiPenyewaan = await getDocs(queryPenyewaan);

            const peralatan = snapshotInformasiPenyewaan.docs[0].data().peralatan;
            const peralatanRef = collection(firestore, "peralatan");
            const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', peralatan));
            const snapshotPeralatan = await getDocs(queryPeralatan);
            
            const productName = snapshotPeralatan.docs[0].data().nama;
            const pembayaran = snapshotInformasiPenyewaan.docs[0].data().pembayaran;
            const productImage = snapshotPeralatan.docs[0].data().foto.split(',')[0];
            const jumlah = snapshotInformasiPenyewaan.docs[0].data().jumlah;
            const pengambilan = snapshotInformasiPenyewaan.docs[0].data().pengambilan;
            const pengembalian = snapshotInformasiPenyewaan.docs[0].data().pengembalian;
            const orderAmount = snapshotInformasiPenyewaan.docs[0].data().total_harga;
            const uploadedImage = snapshotInformasiPenyewaan.docs[0].data().bukti_pembayaran;

            setProductName(productName);
            setPembayaran(pembayaran);
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

    useEffect(() => {
      fetchData();
    }, []);

    const handleTerimaPembayaran = async () => {
        setIsLoading(true);
        try {
            const downloadURL = uploadedImage;
            if (downloadURL) {         
                const q = query(collection(firestore, "informasi_penyewaan"), where("id_transaksi", "==", transaksiId));
                const querySnapshot = await getDocs(q);

                var docID = querySnapshot.docs[0].id;
                const colRef = doc(firestore, "informasi_penyewaan", docID);
                await updateDoc(colRef, {
                    pembayaran: true,
                    status: 'Aktif'
                })

                const penyediaRef = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', userId));
                const penyediaDoc = await getDocs(penyediaRef);
                const penyediaId = penyediaDoc.docs[0].id;
                await updateDoc(doc(firestore, 'penyedia', penyediaId), {
                    tagihan: penyediaDoc.docs[0].data().tagihan + (docSnapshot.docs[0].data().total_harga * 0.025),
                    transaksi: penyediaDoc.docs[0].data().transaksi + 1,                
                });

                if (penyediaDoc.docs[0].data().booster > 0) {
                    await updateDoc(doc(firestore, 'penyedia', penyediaId), {
                        booster: penyediaDoc.docs[0].data().booster - 1
                    });
                }
            } else {
                Alert.alert('Error', 'Bukti pembayaran belum diupload');
            }
        } catch (error) {
            console.error('Failed:', error);
        }

        fetchData();
        setIsLoading(false)
    };
    
    const handleTolakPembayaran = async () => {
        const tolakPembayaran = async () => {
            try {
                const q = query(collection(firestore, "informasi_penyewaan"), where("id_transaksi", "==", transaksiId));
                const querySnapshot = await getDocs(q);
    
                var docID = querySnapshot.docs[0].id;
                const colRef = doc(firestore, "informasi_penyewaan", docID);
                await updateDoc(colRef, {
                    status: 'Ditolak'
                })

                const qty = querySnapshot.docs[0].data().jumlah;

                const peralatanRef = collection(firestore, "peralatan");
                const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', querySnapshot.docs[0].data().peralatan));
                const snapshotPeralatan = await getDocs(queryPeralatan);
                
                const peralatanDoc = snapshotPeralatan.docs[0];
                const peralatanRefUpdate = doc(firestore, "peralatan", peralatanDoc.id);

                await updateDoc(peralatanRefUpdate, {
                    ketersediaan: peralatanDoc.data().ketersediaan + qty
                });

                navigation.goBack();
            } catch (error) {
                console.error('Failed:', error);
            }
        }

        Alert.alert(
            'Konfirmasi',
            'Apakah anda yakin ingin menolak pembayaran ini?',
            [
                {
                    text: 'Batal',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Ya',
                    onPress: () => tolakPembayaran()
                }
            ]
        );
    }

    const handleTerimaPengembalian = async () => {
        Alert.alert(
            'Konfirmasi',
            'Apakah anda yakin ingin menyelesaikan transaksi ini?',
            [
                {
                    text: 'Batal',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Ya',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const q = query(collection(firestore, "informasi_penyewaan"), where("id_transaksi", "==", transaksiId));
                            const querySnapshot = await getDocs(q);
        
                            var docID = querySnapshot.docs[0].id;
                            const colRef = doc(firestore, "informasi_penyewaan", docID);
                            await updateDoc(colRef, {
                                status: 'Selesai'
                            });

                            const qty = querySnapshot.docs[0].data().jumlah;

                            const peralatanRef = collection(firestore, "peralatan");
                            const queryPeralatan = query(peralatanRef, where('id_peralatan', '==', querySnapshot.docs[0].data().peralatan));
                            const snapshotPeralatan = await getDocs(queryPeralatan);
                            
                            const peralatanDoc = snapshotPeralatan.docs[0];
                            const peralatanRefUpdate = doc(firestore, "peralatan", peralatanDoc.id);

                            await updateDoc(peralatanRefUpdate, {
                                ketersediaan: peralatanDoc.data().ketersediaan + qty
                            });

                            navigation.goBack();
                        } catch (error) {
                            console.error('Failed:', error);
                        }
                    }
                }
            ]
        );
    }

    function formatHarga(num) {
        if (num === null) return 0;
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    return (
      <View style={{flex:1}}>
        <TopbarBack navigation={navigation} title={'Review Pembayaran'}/>
        <View style={{ paddingHorizontal: 20, position: 'relative', height: '85%' }}>
            <Text style={{ color: '#004268', marginBottom: 10, fontSize:21, fontWeight:'bold' }}>Produk</Text>
            <View style={{ padding: 10, flexDirection: 'row', borderRadius: 10, backgroundColor: 'white' }}>
                <Image source={{ uri: productImage }} style={{ width: width * 0.3, height: width * 0.3, borderRadius: 10, }} />
                <View style={{ padding: 5, flex: 1, paddingLeft: 20 }}>
                    <Text style={{ color:'#004268', fontWeight:'bold', fontSize:18 }}>{productName}</Text>
                    <Text style={{ color: '#004268', marginTop: 5 }}>Jumlah: {jumlah}</Text>
                    <Text style={{ color: '#004268' }}>Pengambilan: {pengambilan}</Text>
                    <Text style={{ color: '#004268' }}>Pengembalian: {pengembalian}</Text>
                    <Text style={{ color:'#004268', marginTop:10 }}>Pembayaran: {pembayaran ? 'Diterima' : 'Belum / Ditolak'}</Text>
                </View>
            </View>
            <Text style={{marginTop: 20, color: '#004268', marginBottom: 20, fontSize:21, fontWeight:'bold'}}>Bukti Pembayaran</Text>
            {uploadedImage && !isLoading && (
                <Image source={{ uri: uploadedImage }} style={{ width: '100%', height: 275, borderRadius: 10 }} />
            )}
            {!uploadedImage && !isLoading && (
                <Text style={{ color: '#004268', textAlign: 'center', marginTop: 20, fontSize:14 }}>Bukti pembayaran belum diupload</Text>
            )}
            <View style={{position: 'absolute', bottom: 20, width: '100%', left: 20, zIndex:1}}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <Text style={{color: '#9B9B9B'}}>Total Tagihan:</Text>
                    { !isLoading && <Text>Rp{formatHarga(orderAmount)}</Text> }
                </View>
                {!pembayaran ? (
                  <View style={{flexDirection:'row',}}>
                  <TouchableOpacity onPress={handleTolakPembayaran} style={{ width: '47.5%', padding: 5, borderRadius: 10, backgroundColor: '#FB0A0A', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                      <Text style={{ color: 'white', textAlign: 'center' }}>Tolak Pembayaran</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleTerimaPembayaran} style={{ width: '47.5%', padding: 5, borderRadius: 10, backgroundColor: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Terima Pembayaran</Text>
                  </TouchableOpacity>
                  </View>
                ) : (
                  <>
                  <TouchableOpacity onPress={handleTerimaPengembalian} style={{ width: '100%', padding: 5, borderRadius: 10, backgroundColor: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Terima Pengembalian</Text>
                  </TouchableOpacity>
                  </>
                )}
            </View>
        </View>
      </View>
    );
};
