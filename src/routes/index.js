import { StyleSheet, Text, View, Dimensions, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signup from '../screens/Signup';
import React from 'react';
import Splash from '../screens/Splash';
// import Signin from '../screens/Signin';

const Stack = createStackNavigator()


const Routes = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
            {/* <Stack.Screen name='Splash' component={Splash} options={{ headerShown: false }}/> */}
            {/* <Stack.Screen name= 'Signin' component ={Signin} options={{ headerShown: false }}/> */}
            <Stack.Screen name= 'Signup' component ={Signup} options={{ headerShown: false }}/>
            {/* <Stack.Screen name= 'Home' component ={Home} options={{ headerShown: false }}/> */}
            {/* <Stack.Screen name="BarcodeScanner" component={BarcodeScanner} options={{ headerShown: false }}/> */}
            {/* <Stack.Screen name= 'MyVoucher' component ={MyVoucher} options={{ headerShown: false }}/> */}
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
