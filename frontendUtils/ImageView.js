import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ImageViewerScreen = ({ route, navigation }) => {
  const { imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.fullScreen} 
        onPress={() => navigation.goBack()}
        activeOpacity={1}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewerScreen;