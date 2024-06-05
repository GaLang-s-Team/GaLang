import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Image, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { firestore, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import TopbarBack from '../component/TopbarBack';
import * as ImageManipulator from 'expo-image-manipulator';


const PembayaranTagihan = ({ navigation, route }) => {
    const { userId } = route.params;

    const [tagihan, setTagihan] = useState(0);
    const [diskon, setDiskon] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const penyediaRef = collection(firestore, 'penyedia');
                const queryPenyedia = query(penyediaRef, where('id_pengguna', '==', userId));
                const snapshotPenyedia = await getDocs(queryPenyedia);

                const tagihan = snapshotPenyedia.docs[0].data().tagihan;
                const diskon = snapshotPenyedia.docs[0].data().diskon_tagihan;
                const uploadedImage = snapshotPenyedia.docs[0].data().bukti_tagihan;

                setDiskon(diskon);
                setUploadedImage(uploadedImage);
                
                if (diskon) {
                  setTagihan(tagihan - (tagihan * 0.1));
                } else {
                  setTagihan(tagihan);
                }
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
                
                const compressedUri = await compressImage(uri);
                const imageName = uri.substring(uri.lastIndexOf('/') + 1);
                const response = await fetch(compressedUri);
                const blob = await response.blob();
    
                const storageRef = ref(storage, `tagihan/${imageName}`);
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
                const q = query(collection(firestore, 'penyedia'), where('id_pengguna', '==', userId));
                const querySnapshot = await getDocs(q);

                var docID = querySnapshot.docs[0].id;
                const colRef = doc(firestore, 'penyedia', docID);
                await updateDoc(colRef, {
                    bukti_tagihan: downloadURL
                })
                console.log('upload sukses')
            }
            Alert.alert('Pembayaran Tagihan', 'Upload bukti pembayaran tagihan berhasil');
            navigation.navigate('Dashboard', { userId: userId });
        } catch (error) {
            console.error('Failed to upload pembayaran:', error);
        }
        setIsLoading(false)
    };

    function formatDigit(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    }

    if (isLoading) {
        return <></>;
    }

    return (
        <View style={{position: 'relative', height: '100%'}}>
            <TopbarBack navigation={navigation} title='Pembayaran Tagihan' />
            <View style={{ paddingHorizontal: 20, position: 'relative', height: '100%' }}>
                <Text style={{fontWeight:'bold', color: '#004268', fontSize:18, marginBottom:10}}>Bukti Pembayaran</Text>
                <Text style={{color:'#004268', marginBottom: 5}}>Harap lakukan pembayaran sesuai nominal tagihan Anda.</Text>
                <Text style={{color:'#004268', marginBottom: 5}}>Tagihan : Rp{formatDigit(tagihan)}</Text>
                <Text style={{color:'#004268', marginBottom: 5}}>Rekening Pembayaran : 123456789</Text>
                {uploadedImage && (
                    <Image source={{ uri: uploadedImage }} style={{ width: '100%', marginTop:30, height: 300, borderRadius: 10 }} />
                )} 
            </View>
            <View style={{position:'absolute', bottom:170, width:'100%', paddingLeft: 20, paddingRight: 20}}>
              <TouchableOpacity onPress={handleUploadBukti} style={{ marginTop: 20, padding: 5, borderRadius: 10, borderWidth:1, backgroundColor: 'white', borderColor:'#004268', width: '50%', marginLeft: 'auto', marginRight: 'auto', marginBottom: 20, paddingVertical: 10 }}>
                  <Text style={{ color: '#004268', textAlign: 'center' }}>Upload Bukti</Text>
              </TouchableOpacity>
            </View>
            <View style={{position: 'absolute', bottom: 20, width: '100%', paddingLeft: 20, paddingRight: 20}}>
                <TouchableOpacity onPress={handleUploadPembayaran} style={{ width: '100%', padding: 5, borderRadius: 10, backgroundColor: '#459708', marginLeft: 'auto', marginRight: 'auto', marginTop: 20, paddingVertical: 10 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Upload Pembayaran Tagihan</Text>
                </TouchableOpacity>
            </View>
        </View>
        
    );
};

export default PembayaranTagihan;