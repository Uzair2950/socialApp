import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

// const API_BASE_URL = 'http://192.168.215.120:3001/api';
// const IMG_BASE_URL = 'http://192.168.215.120:3001';
const USER_ID = '6754a9268db89992d5b8221e';

const Friends = ({navigation}) => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/getFriends/${USER_ID}`);
      setFriends(res.data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, []),
  );

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image
        source={{uri: `${IMG_BASE_URL}${item.imgUrl}`}}
        style={styles.avatar}
      />
      <Text style={styles.name}>{item.name}</Text>
      <TouchableOpacity style={styles.chatIcon}>
        <Icon name="chatbubble-ellipses-outline" size={22} color="#21A558" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.friendCount}>{friends.length} Friends</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FriendRequests');
          }}>
          <Text style={styles.link}>Friend Requests</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 20}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  friendCount: {fontWeight: 'bold', fontSize: 16, color: 'black'},
  link: {color: '#21A558', fontWeight: '600'},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  name: {flex: 1, fontSize: 16, color: 'black'},
  chatIcon: {padding: 4},
});

export default Friends;
