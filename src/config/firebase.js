import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyA0OxWGX81Yj4gzPgoObCWn8LPXZCVSusQ",
    authDomain: "galang-907b4.firebaseapp.com",
    projectId: "galang-907b4",
    storageBucket: "galang-907b4.appspot.com",
    messagingSenderId: "288447102241",
    appId: "1:288447102241:web:e6d4326292dc3399e01260",
    measurementId: "G-0RTGVPRJY4"
};

// fungsi initializeApp dengan objek firebaseConfig bertindak sebagai argumen untuk menginisialisasi Firebase dalam 
// aplikasi. Hasil inisialisasi disimpan dalam variabel app
const app = initializeApp(firebaseConfig);

// getFirestore digunakan untuk menginisialisasi layanan Firebase Firestore, yang merupakan basis data Firebase. 
// Hasil inisialisasi disimpan dalam variabel firestore.
export const firestore = getFirestore(app)

// getStorage ini digunakan untuk menginisialisasi layanan Firebase Storage, 
// yang digunakan untuk menyimpan dan mengelola berkas di Firebase. 
// Hasil inisialisasi disimpan dalam variabel storage. 
// Layanan ini berguna ketika kita ingin menyimpan berkas seperti gambar atau dokumen.
export const storage = getStorage(app)

// initializeAuth: digunakan untuk menginisialisasi layanan Firebase Authentication. 
// kita juga mengatur opsi persistence ke getReactNativePersistence(ReactNativeAsyncStorage). 
// menyimpan sesi otentikasi pengguna di perangkat dengan 
// menggunakan React Native Async Storage. 
export const firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})