import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyB5vkhjRPM_s7IZ1n-3AtPbk3pk2wL41Jk",
    authDomain: "galang-ab3b5.firebaseapp.com",
    projectId: "galang-ab3b5",
    storageBucket: "galang-ab3b5.appspot.com",
    messagingSenderId: "707778552323",
    appId: "1:707778552323:web:99d5864e8634d739e96436",
    measurementId: "G-RJLFFB2CMY"
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