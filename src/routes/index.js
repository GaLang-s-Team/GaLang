import React from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from '../screens/Splash';
import Signup from '../screens/Signup';
import Signin from '../screens/Signin';
import ProductDetail from '../screens/ProductDetail';
import ProductInsert from '../screens/ProductInsert';
import Home from '../screens/Home';
import StatusPenyewaan from '../screens/StatusPenyewaan';
import Profil from '../screens/Profil';
import UpdateProfile from '../screens/UpdateProfile';
import UploadPembayaran from '../screens/UploadPembayaran';

const Stack = createStackNavigator()


const Routes = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
            {/* <Stack.Screen name='Splash' component={Splash} options={{ headerShown:false }}/> */}
            {/* <Stack.Screen name= 'Signin' component ={Signin} options={{ headerShown:false }}/>
            <Stack.Screen name='Signup' component={Signup} options={{ headerShown:false }}/>
            <Stack.Screen name= 'Home' component ={Home} options={{ headerShown:false }}/> */}
            {/* <Stack.Screen name='ProductDetail' component={ProductDetail} options={{ headerShown:false }}/> */}
            {/* <Stack.Screen name='ProductInsert' component={ProductInsert} options={{ headerShown:false }}/> */}
            {/* <Stack.Screen name= 'StatusPenyewaan' component ={StatusPenyewaan} options={{ headerShown:false }}/>
            <Stack.Screen name= 'Profil' component ={Profil} options={{ headerShown:false }}/>
            <Stack.Screen name= 'UpdateProfile' component ={UpdateProfile} options={{ headerShown:false }}/> */}
            <Stack.Screen name= 'UploadPembayaran' component={UploadPembayaran} options={{ headerShown:false }}/>

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
