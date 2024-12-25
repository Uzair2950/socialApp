import React from "react";
import { Image, StyleSheet, View, TextInput } from "react-native";
import { Button, Text } from "react-native-paper";

const Login = () => {
  return (
    <View style={styles.mainView}>
      <View style={styles.heading}>
        <Text style={styles.headingtxt}>Login</Text>
      </View>
      <Image
        source={require('../static/images/loginAvatar.png')}
        style={styles.image}
      />
      <TextInput
        placeholder="Username"
        style={styles.textInput}
        placeholderTextColor={"grey"}
      />
      <TextInput
        placeholder="Password"
        style={styles.textInput}
        placeholderTextColor={"grey"}
        secureTextEntry
        keyboardType="numeric"
      />
      <Button mode="contained" style={styles.button}>Login</Button>
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
    alignItems: 'center',
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
    alignSelf: 'center',
    height: 250,
    width: 250,
  },
  textInput: {
    alignSelf: 'center',
    width: 270,
    color: 'black',
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
    alignSelf: 'center',
    backgroundColor: "#14AE5C",
    color: 'white',
    width: 270,
    borderRadius: 4,
  }
});

export default Login;
