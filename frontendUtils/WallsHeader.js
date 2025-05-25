import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CustomHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="green" style={styles.icon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          style={styles.input}
        />
      </View>
      {/* <View style={styles.iconContainer}>
        <Icon name="menu" size={20} color="black" style={styles.menuIcon} />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    width: '100%',
  },
  searchContainer: {
    backgroundColor: '#f8f4f4',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 36,
    paddingHorizontal: 10,
    width: '97%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  menuIcon: {
    marginLeft: 0,
  },
  iconContainer: {
    backgroundColor: '#f8f4f4',
    padding: 10,
    left: 20,
    borderRadius: 150 / 2,
  },
});

export default CustomHeader;
