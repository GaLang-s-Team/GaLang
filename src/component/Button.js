import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({ children, onPress, backgroundColor }) => {

    const buttonStyles = {
        backgroundColor: backgroundColor || "#459708",
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginTop: 16,
        marginHorizontal: 'auto',
        marginBottom: 6,
        elevation: 2,
        shadowColor: '#003049',
        shadowOpacity: 0.15,
        shadowOffset: {
        width: 1,
        height: 1,
        },
        width: 297,
        shadowRadius: 2,
        borderRadius: 8,
    };

    return(
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed, buttonStyles]} onPress={onPress}>
            <LinearGradient colors={['#51B308', '#459708']} style={styles.buttonLinear}/>
            <Text style={styles.text}>{children}</Text>
        </Pressable>
    );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        opacity: 1,
    },
    pressed: {
        opacity: 0.7,
    },
    text: {
        textAlign: 'center',
        fontSize: 18,
        color: "white",
        fontWeight: 'bold'
    },
    buttonLinear : {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: 297,
        height: 51,
        top: 0,
        borderRadius: 8,
    }
})