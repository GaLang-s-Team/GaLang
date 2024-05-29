import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useLayoutEffect, useState } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { firestore, storage } from '../config/firebase'
import { Toast } from 'react-native-toast-notifications'
import getBlobFromUri from '../utils/getBlobFromUri'
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import UploadImage from '../component/UploadImage'
import { Ionicons } from '@expo/vector-icons';
import Input from '../component/Input';
import Button from '../component/Button';
import { Snackbar } from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';

const UpdateProfile = ({ route, navigation }) => {

  const userId = route.params.userId

  const [selectedImage, setSelectedImage] = useState('')

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [inputs, setInputs] = useState({
    fullname: {
      value: '', isValid: true
    },
    gender: {
        value: route.params.gender, isValid: true
    },
    nomorTelp: {
      value: '', isValid: true
    },
  });

  const [isLoading, setIsLoading] = useState(false)

  const inputChangeHandler = (inputIdentifier, enteredValue) => {
    setInputs((currentInputs) => {
      return {
        ...currentInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true }
      }
    })
  }

  function uploadImageHandler(imageUri) {
    setSelectedImage(imageUri)
  }

  useLayoutEffect(() => {
      navigation.setOptions({
      headerTitle: `Update Profile : ${route.params.fullname}`,
      headerTintColor: 'white',
      headerStyle: {
          backgroundColor: '#164da4'
      },
      });
  }, [route.params])

  const handleUpdateData = async () => {
    if (!selectedImage) {
      const colRef = doc(firestore, "users", userId);
      const dataUpdate = {
        fullname: inputs.fullname.value ? inputs.fullname.value : route.params.fullname,
        gender: inputs.gender.value,
        nomorTelp: inputs.nomorTelp.value ? inputs.nomorTelp.value : route.params.nomorTelp,
      };

      setIsLoading(true)
      try {
        await updateDoc(colRef, dataUpdate);
        setSnackbarMessage("Profile Updated");
        setSnackbarVisible(true);
        navigation.replace("Profil", { userId: userId });
      } catch (error) {
        setSnackbarMessage(error);
        setSnackbarVisible(true);
      } finally {
        setIsLoading(false);
      }

    } else {
      const blobFile = await getBlobFromUri(selectedImage)

      if (selectedImage) {
        try {
          const colref = doc(firestore, "users", userId);
          const docSnapshot = await getDoc(colref);

          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();

            if (userData && userData.imageUri) {
              const imageUri = userData.imageUri;
              const imgRef = ref(storage, imageUri);
              await deleteObject(imgRef);
              setSnackbarMessage("Delete old image");
              setSnackbarVisible(true);
            }
          }

          setIsLoading(true)
          const storagePath = "imgUsers/" + new Date().getTime();
          const storageRef = ref(storage, storagePath);
          const uploadTask = uploadBytesResumable(storageRef, blobFile);

          uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
              case 'paused':
                setSnackbarMessage("Progress upload" + progress.toFixed(0) + '%');
                setSnackbarVisible(true);
                break;
              case 'running':
                setSnackbarMessage("Progress upload" + progress.toFixed(0) + '%');
                setSnackbarVisible(true);
                break;
              case 'success':
                setSnackbarMessage("Progress upload" + progress.toFixed(0) + '%');
                setSnackbarVisible(true);
                break;
            }
          }, (err) => {
            setSnackbarMessage("Progress upload" + err);
            setSnackbarVisible(true);
          }, async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const colRef = doc(firestore, "users", userId);

            const dataUpdateWithImage = {
              fullname: inputs.fullname.value ? inputs.fullname.value : route.params.fullname,
              imageUri: downloadURL,
              gender: inputs.gender.value,
              nomorTelp: inputs.nomorTelp.value ? inputs.nomorTelp.value : route.params.nomorTelp,
            };

            await updateDoc(colRef, dataUpdateWithImage);
            setSnackbarMessage("Profile updated");
            setSnackbarVisible(true);
            navigation.replace("Profil", { userId: userId });
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  const navigateToProfile = () => {
    navigation.replace('Profil',{ userId: userId });
  }

  return (
    <View style={{ flex: 1, flexDirection: 'column', paddingBottom: 20, marginHorizontal: 'auto', width: '100%', backgroundColor: 'white', maxWidth: 480 }}>
      <Image
        source={require('../../assets/Abstrackprof.png')}
        style={{ position: 'absolute', width: 395, height: 199 }}
      />
      <View style={{ marginTop: '10%', marginLeft: '4%' }}>
        <TouchableOpacity onPress={navigateToProfile} style={{ position: 'absolute', top: 20, left: 5, borderRadius: 50, backgroundColor: '#FFFFFF', padding: 10 }}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={{ marginTop: '5%', fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}>Update Profile</Text>
      <UploadImage
        fullname={route.params.fullname}
        imageUri={route.params.imageUri}
        onImageUpload={uploadImageHandler}
      />
      <ScrollView>
        <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20, marginRight: 20 }}>
          <Input
            label="Fullname"
            invalid={!inputs.fullname.isValid}
            textInputConfig={{
              defaultValue: route.params.fullname,
              onChangeText: inputChangeHandler.bind(this, 'fullname')
            }}
          />
        </View>
        <View style={{ justifyContent: 'center', marginLeft: 20, marginRight: 20 }}>
          <Input
            label="No. Telp"
            invalid={!inputs.nomorTelp.isValid}
            textInputConfig={{
              defaultValue: route.params.nomorTelp,
              onChangeText: inputChangeHandler.bind(this, 'nomorTelp')
            }}
          />
        </View>
        <View style={{ justifyContent: 'center', marginLeft: 20, marginRight: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 4, color: '#004268', fontWeight: 'bold' }}>Pilih Jenis Kelamin</Text>
          <View style={{ backgroundColor: '#E4E7C9', paddingHorizontal: 15, borderRadius: 10, color: '#E4E7C9', borderColor: '#459708', borderWidth: 1 }}>
            <Picker
                style={{ color: '#E4E7C9' }}
                selectedValue={inputs.gender.value !== undefined ? inputs.gender.value : "default"}
                onValueChange={(itemValue, itemIndex) =>
                setInputs((prevState) => ({
                    ...prevState,
                    gender: { value: itemValue, isValid: true }
                }))
                }>
                {/* Display default option if gender data is undefined */}
                <Picker.Item label="Pilih jenis kelamin" value="default" />
                {/* Display other gender options */}
                <Picker.Item label="Laki-laki" value={true} />
                <Picker.Item label="Perempuan" value={false} />
            </Picker>
            </View>
        </View>
      </ScrollView>
      <View style={{ flex: 1, alignItems: 'center', marginTop: '20%', width: '100%' }}>
        <TouchableOpacity style={{
          justifyContent: 'center',
          height: 60,
          width: 335,
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginTop: 20,
          backgroundColor: '#459708',
          borderRadius: 50,
        }} onPress={handleUpdateData}>
          {isLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (<Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Update profile</Text>)}
        </TouchableOpacity>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ marginBottom: "2%", backgroundColor: '#ff0e0e', justifyContent: 'center', borderRadius: 29, marginBottom: '3%' }}
      >
        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </View>
  )
}

export default UpdateProfile

const styles = StyleSheet.create({})
