import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Dropdown = () => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");

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
              id_provinsi: selectedProvince
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

  return (
    <View style={styles.container}>
        <View style={{ justifyContent: 'center', marginLeft: 20, marginRight: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 4, color: '#004268', fontWeight: 'bold' }}>Pilih Provinsi</Text>
            <View style={{ backgroundColor: '#E4E7C9', paddingHorizontal: 15, borderRadius: 10, color: '#E4E7C9', borderColor: '#459708', borderWidth: 1 }}>
                <Picker
                    selectedValue={selectedProvince}
                    onValueChange={(itemValue) => setSelectedProvince(itemValue)}
                    style={{  }}
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
                    selectedValue={selectedProvince}
                    onValueChange={(itemValue) => setSelectedProvince(itemValue)}
                    style={styles.picker}
                    enabled={selectedProvince !== ""}
                >
                    <Picker.Item label="Pilih Kota" value="" />
                    {cities.map(city => (
                    <Picker.Item key={city.id} label={city.name} value={city.id} />
                    ))}
                </Picker>
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 10,
  },
  
});

export default Dropdown;
