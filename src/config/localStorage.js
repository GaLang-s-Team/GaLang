import AsyncStorage from "@react-native-async-storage/async-storage";

// store key fungsi yang digunakan untuk menyimpan data dengan kunci (key) tertentu ke penyimpanan lokal (local storage).
// Fungsi ini menerima dua parameter: key dan value.
// Data yang akan disimpan dalam penyimpanan lokal diubah menjadi format JSON menggunakan JSON.stringify.
// Fungsi ini menggunakan await karena operasi penyimpanan lokal dapat bersifat asinkron. 
// Jika terjadi kesalahan, sebuah pesan toast "Error store key" akan ditampilkan dengan tipe "danger" dan durasi 2 detik.
export const storeKey = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error("Error storing key:", error);
    }
}

// Fungsi yang digunakan untuk mendapatkan data dari penyimpanan lokal berdasarkan kunci (key) tertentu.
// Fungsi ini menerima satu parameter: key.
// Jika data dengan kunci yang dikirimkan ada, data tersebut diambil dari penyimpanan lokal dan 
// diuraikan dari format JSON menggunakan JSON.parse. Kemudian, data tersebut dikembalikan.
// Jika terjadi kesalahan, sebuah pesan toast "Error get key" akan ditampilkan dengan tipe "danger" dan durasi 2 detik.
export const getKey = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error("Error retrieving key:", error);
        return null;
    }
};

// Fungsi yang digunakan untuk menghapus semua data dari penyimpanan lokal.
// Fungsi ini menggunakan AsyncStorage.clear() untuk menghapus semua data dari penyimpanan lokal.
// Ini berguna jika kita ingin membersihkan seluruh penyimpanan lokal, misalnya ketika pengguna keluar atau logout dari aplikasi.
export const destroyKey = async() => {
    AsyncStorage.clear()
}