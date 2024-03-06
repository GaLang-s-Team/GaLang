import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1500);

export default function App() {
  return (      
    <View style={styles.container}>
      <View style={styles.paragraph}>
        <Text>GaLang merupakan aplikasi yang menghubungkan</Text>
        <Text>para penyedia jasa sewa perlengkapan outdoor</Text>
        <Text>dengan orang-orang yang membutuhkannya. GaLang</Text>
        <Text>sendiri merupakan singkatan dari Garasi Petualang.</Text>
        <Text></Text>
        <Text>GaLang dikembangkan oleh:</Text>
        <Text>+ Richard Haris 18221006 [Hustler]</Text>
        <Text>+ Gyan Maiziko 18221008 [Hipster]</Text>
        <Text>+ Wildhan Hidayatullah 18221024 [Hacker]</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E7C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'justify',
  }
});
