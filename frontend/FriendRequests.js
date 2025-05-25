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
const USER_ID = '6754a9268db89992d5b82220';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/user/getPendingRequests/${USER_ID}`,
      );
      const formatted = res.data.map(item => ({
        _id: item._id,
        name: item.uid.name,
        imgUrl: item.uid.imgUrl,
      }));
      setRequests(formatted);
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, []),
  );

  const handleAccept = async id => {
    try {
      await axios.post(`${API_BASE_URL}/user/acceptRequest/${id}`);
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleReject = async id => {
    try {
      await axios.post(`${API_BASE_URL}/user/rejectRequest/${id}`);
      setRequests(prev => prev.filter(req => req._id !== id));
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image
        source={{uri: `${IMG_BASE_URL}${item.imgUrl}`}}
        style={styles.avatar}
      />
      <Text style={styles.name}>{item.name}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleAccept(item._id)}
          style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleReject(item._id)}
          style={styles.rejectBtn}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.chatIcon}>
        <Icon name="chatbubble-ellipses-outline" size={22} color="#21A558" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.requestCount}>{requests.length} Requests</Text>
      </View>
      <FlatList
        data={requests}
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
    marginBottom: 10,
  },
  requestCount: {fontWeight: 'bold', fontSize: 16, color: '#21A558'},
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
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  confirmBtn: {
    backgroundColor: '#21A558',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 5,
  },
  rejectBtn: {
    backgroundColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  confirmText: {color: 'white', fontWeight: 'bold'},
  rejectText: {color: '#333', fontWeight: 'bold'},
  chatIcon: {paddingHorizontal: 5},
});

export default FriendRequests;
