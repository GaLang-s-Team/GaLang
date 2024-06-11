import React from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from '../screens/Splash';
import Signup from '../screens/Signup';
import Signin from '../screens/Signin';
import PeralatanDetail from '../screens/PeralatanDetail';
import PeralatanInsert from '../screens/PeralatanInsert';
import Home from '../screens/Home';
import Dashboard from '../screens/Dashboard';
import StatusPenyewaan from '../screens/TransaksiPenyewaan';
import Profil from '../screens/Profil';
import UpdateProfile from '../screens/UpdateProfile';
import UploadPembayaran from '../screens/UploadPembayaran';
import Search from '../screens/Search';
import SearchDash from '../screens/SearchDash';
import TransaksiReview from '../screens/TransaksiReview';
import PembayaranReview from '../screens/PembayaranReview';
import TransaksiPenyewa from '../screens/TransaksiPenyewa';
import ProfilDash from '../screens/ProfilDash';
import UpdateProfileDash from '../screens/UpdateProfilDash';
import Garasi from '../screens/Garasi';
import TransaksiPenyewaan from '../screens/TransaksiPenyewaan';
import PembayaranTagihan from '../screens/PembayaranTagihan';
import PeralatanEdit from '../screens/PeralatanEdit';
import HistoryPenyewaan from '../screens/HistoryPenyewaan';

const Stack = createStackNavigator()


const Routes = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
            {/* <Stack.Screen name='Splash' component={Splash} options={{ headerShown:false }}/> */}
            <Stack.Screen name= 'Signin' component ={Signin} options={{ headerShown:false }}/>
            <Stack.Screen name='Signup' component={Signup} options={{ headerShown:false }}/>
            <Stack.Screen name= 'Home' component ={Home} options={{ headerShown:false }}/>
            <Stack.Screen name='Dashboard' component={Dashboard} options={{ headerShown:false }}/>
            <Stack.Screen name='History' component={HistoryPenyewaan} options={{ headerShown:false }}/>
            <Stack.Screen name='PeralatanDetail' component={PeralatanDetail} options={{ headerShown:false }}/>
            <Stack.Screen name='PeralatanInsert' component={PeralatanInsert} options={{ headerShown:false }}/>
            <Stack.Screen name='PeralatanEdit' component={PeralatanEdit} options={{ headerShown:false }}/>
            <Stack.Screen name='Search' component={Search} options={{ headerShown:false }}/>
            <Stack.Screen name='SearchDash' component={SearchDash} options={{ headerShown:false }}/>
            <Stack.Screen name= 'StatusPenyewaan' component ={StatusPenyewaan} options={{ headerShown:false }}/>
            <Stack.Screen name= 'Profil' component ={Profil} options={{ headerShown:false }}/>
            <Stack.Screen name= 'ProfilDash' component ={ProfilDash} options={{ headerShown:false }}/>
            <Stack.Screen name= 'UpdateProfile' component ={UpdateProfile} options={{ headerShown:false }}/>
            <Stack.Screen name= 'UpdateProfileDash' component ={UpdateProfileDash} options={{ headerShown:false }}/>
            <Stack.Screen name= 'TransaksiReview' component ={TransaksiReview} options={{ headerShown:false }}/>
            <Stack.Screen name= 'PembayaranReview' component ={PembayaranReview} options={{ headerShown:false }}/>            
            <Stack.Screen name= 'TransaksiPenyewa' component ={TransaksiPenyewa} options={{ headerShown:false }}/>            
            <Stack.Screen name= 'UploadPembayaran' component={UploadPembayaran} options={{ headerShown:false }}/>
            <Stack.Screen name= 'Garasi' component={Garasi} options={{ headerShown:false }}/>
            <Stack.Screen name= 'TransaksiPenyewaan' component={TransaksiPenyewaan} options={{ headerShown:false }}/>
            <Stack.Screen name= 'PembayaranTagihan' component={PembayaranTagihan} options={{ headerShown:false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    marginTop: StatusBar.currentHeight,
  },
});

export default Routes;
