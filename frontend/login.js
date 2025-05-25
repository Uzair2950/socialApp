import React, {useState} from 'react';
import {Image, StyleSheet, View, TextInput, Alert} from 'react-native';
import {Button, Text} from 'react-native-paper';
import axios from 'axios';
import {API_BASE_URL} from '../constants/config';

const Login = ({navigation}) => {
  const [email, setemail] = useState('2021-ARID-4591@biit.edu.pk');
  const [password, setPassword] = useState('212');
  // const API_BASE_URL = 'http://192.168.215.120:3001/api';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    console.log(`Full URL: ${API_BASE_URL}/user/authorize`);
    try {
      const response = await axios.post(`${API_BASE_URL}/user/authorize`, {
        email,
        password,
      });

      navigation.navigate('BiitOfficialWall', {user: response.data});
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Invalid email or password');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.mainView}>
      <View style={styles.heading}>
        <Text style={styles.headingtxt}>Login</Text>
      </View>
      <Image source={require('../Images/login.png')} style={styles.image} />
      <TextInput
        placeholder="Email"
        style={styles.textInput}
        placeholderTextColor={'grey'}
        value={email}
        onChangeText={setemail}
      />
      <TextInput
        placeholder="Password"
        style={styles.textInput}
        placeholderTextColor={'grey'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button mode="contained" style={styles.button} onPress={handleLogin}>
        Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  heading: {
    alignItems: 'center',
  },
  headingtxt: {
    color: '#14AE5C',
    fontWeight: 'semibold',
    fontSize: 32,
    marginTop: 15,
  },
  image: {
    marginTop: 30,
    marginBottom: 40,
    alignSelf: 'center',
    height: 250,
    width: 250,
  },
  textInput: {
    alignSelf: 'center',
    width: 270,
    color: 'black',
    borderWidth: 1,
    borderColor: 'black',
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 40,
  },
  button: {
    marginTop: 40,
    alignSelf: 'center',
    backgroundColor: '#14AE5C',
    color: 'white',
    width: 270,
    borderRadius: 4,
  },
});

export default Login;
