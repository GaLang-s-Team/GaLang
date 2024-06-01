import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'
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
import Dropdown from '../component/Dropdown'; 
import axios from 'axios';

const UpdateProfileDash = ({ route, navigation }) => {

  const userId = route.params.userId

  const [selectedImage, setSelectedImage] = useState('')

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // PROVINCE AND CITY
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [nameProvinsi, setNameProvinsi] = useState("");
  const [nameKota, setNameKota] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // API KEY 
  const apiKey = "9d1691566520a90a4eef2081606b9259e6f502c7f6af486be42f0396e22fda9b";

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://api.binderbyte.com/wilayah/provinsi', {
          params: {
            api_key: apiKey
          }
        });
        console.log("Provinces response:", response.data); // Tambahkan log respons
        setProvinces(response.data.value); // Sesuaikan dengan struktur data dari BinderByte API
      } catch (error) {
        console.error("Error fetching provinces: ", error.response ? error.response.data : error.message);
      }
    };

    fetchProvinces();
  }, [apiKey]);

  useEffect(() => {
    const fetchCities = async () => {
      if (selectedProvince) {
        try {
          const response = await axios.get('https://api.binderbyte.com/wilayah/kabupaten', {
            params: {
              api_key: apiKey,
              id_provinsi: selectedProvince,
            }
          });
          console.log("Cities response:", response.data); // Tambahkan log respons
          setCities(response.data.value); // Sesuaikan dengan struktur data dari BinderByte API
        } catch (error) {
          console.error("Error fetching cities: ", error.response ? error.response.data : error.message);
        }
      }
    };

    fetchCities();
  }, [selectedProvince, apiKey]);

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
    provinsi: {
      value:'', isValid: true
    }, kota: {
      value:'', isValid: true
    }
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
        provinsi: inputs.provinsi.value ? inputs.provinsi.value : route.params.provinsi,
        kota: inputs.kota.value ? inputs.kota.value : route.params.kota,
      };

      setIsLoading(true)
      try {
        await updateDoc(colRef, dataUpdate);
        setSnackbarMessage("Profile Updated");
        setSnackbarVisible(true);
        navigation.replace("ProfilDash", { userId: userId });
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
              provinsi: inputs.provinsi.value ? inputs.provinsi.value : route.params.provinsi,
              kota: inputs.kota.value ? inputs.kota.value : route.params.kota,
            };

            await updateDoc(colRef, dataUpdateWithImage);
            setSnackbarMessage("Profile updated");
            setSnackbarVisible(true);
            navigation.replace("ProfilDash", { userId: userId });
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
  console.log(nameKota);
  console.log(nameProvinsi);

  const navigateToProfile = () => {
    navigation.replace('ProfilDash',{ userId: userId });
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
                selectedValue={inputs.gender.value !== undefined ? inputs.gender.value : "default"}
                onValueChange={(itemValue, itemIndex) =>
                setInputs((prevState) => ({
                    ...prevState,
                    gender: { value: itemValue, isValid: true }
                }))
                }>
                {/* Display default option if gender data is undefined */}
                <Picker.Item label="Pilih jenis kelamin" value="" />
                {/* Display other gender options */}
                <Picker.Item label="Laki-laki" value={true} />
                <Picker.Item label="Perempuan" value={false} />
            </Picker>
            </View>
        </View>
        <View style={{ justifyContent: 'center', marginLeft: 20, marginRight: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 4, color: '#004268', fontWeight: 'bold' }}>Pilih Provinsi</Text>
            <View style={{ backgroundColor: '#E4E7C9', paddingHorizontal: 15, borderRadius: 10, color: '#E4E7C9', borderColor: '#459708', borderWidth: 1 }}>
                <Picker
                    selectedValue={selectedProvince}
                    onValueChange={(itemValue) => {
                      setSelectedProvince(itemValue);
                      setNameProvinsi(provinces.find(prov => prov.id === itemValue)?.name); // Set nilai nameProvinsi
                      setInputs((prevState) => ({
                        ...prevState,
                        provinsi: { value: (provinces.find(prov => prov.id === itemValue)?.name), isValid: true }
                      }));
                      setSelectedCity(""); // Reset city when province changes
                    }}
                >
                    <Picker.Item label="Pilih Provinsi" value="" style={{paddingLeft: 20}}/>
                    {provinces.map(province => (
                    <Picker.Item key={province.id} label={province.name} value={province.id} />
                    ))}
                </Picker>
            </View>
        </View>

        <View style={{ justifyContent: 'center', marginLeft: 20, marginRight: 20, marginTop: 10 }}>
            <Text style={{ fontSize: 18, marginBottom: 4, color: '#004268', fontWeight: 'bold' }}>Pilih Kota/Kabupaten </Text>
            <View style={{ backgroundColor: '#E4E7C9', paddingHorizontal: 15, borderRadius: 10, color: '#E4E7C9', borderColor: '#459708', borderWidth: 1 }}>
                <Picker
                    selectedValue={selectedCity}
                    onValueChange={(itemValue) => {
                      setSelectedCity(itemValue);
                      setNameKota(cities.find(city => city.id === itemValue)?.name); // Set nilai nameKota
                      setInputs((prevState) => ({
                        ...prevState,
                        kota: { value: (cities.find(city => city.id === itemValue)?.name), isValid: true }
                      }));
                    }}
                    enabled={selectedProvince !== ""}
                >

                    <Picker.Item label="Pilih Kota" value="" />
                    {cities.map(city => (
                    <Picker.Item key={city.id} label={city.name} value={city.id} />
                    ))}
                </Picker>
            </View>
        </View>
        {/* <Dropdown/> */}
        {/* Data Province and City */}
        <View style={{ flex: 1, alignItems: 'center', width: '100%' }}>
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
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={{ marginBottom: "2%", backgroundColor: '#BDE6AC', justifyContent: 'center', borderRadius: 29, marginBottom: '3%' }}
      >
        <Text style={{ textAlign: 'center', color: '#004268', fontWeight: 'bold' }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </View>
  )
}

export default UpdateProfileDash

const styles = StyleSheet.create({})
