import React, { useState } from "react";
import { Image, StyleSheet, View, TextInput, Alert } from "react-native";
import { Button, Text } from "react-native-paper";
import axios from "axios";

const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in both fields");
      return;
    }

    try {
      const response = await axios.post('http://192.168.139.120:3000/user/authorize', { username, password });

      // If login is successful, navigate to BiitOfficialWall
      navigation.navigate("BiitOfficialWall", { user: response.data });
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        Alert.alert("Error", "Invalid username or password");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <View style={styles.mainView}>
      <View style={styles.heading}>
        <Text style={styles.headingtxt}>Login</Text>
      </View>
      <Image
        source={require("../static/images/loginAvatar.png")}
        style={styles.image}
      />
      <TextInput
        placeholder="Username"
        style={styles.textInput}
        placeholderTextColor={"grey"}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        style={styles.textInput}
        placeholderTextColor={"grey"}
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
    backgroundColor: "white",
    padding: 20,
  },
  heading: {
    alignItems: "center",
  },
  headingtxt: {
    color: "#14AE5C",
    fontWeight: "semibold",
    fontSize: 32,
    marginTop: 15,
  },
  image: {
    marginTop: 30,
    marginBottom: 40,
    alignSelf: "center",
    height: 250,
    width: 250,
  },
  textInput: {
    alignSelf: "center",
    width: 270,
    color: "black",
    borderWidth: 1,
    borderColor: "black",
    marginVertical: 10,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 40,
  },
  button: {
    marginTop: 40,
    alignSelf: "center",
    backgroundColor: "#14AE5C",
    color: "white",
    width: 270,
    borderRadius: 4,
  },
});

export default Login;
