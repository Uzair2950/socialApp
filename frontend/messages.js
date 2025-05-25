import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {Text} from 'react-native-paper';
import axios from 'axios';
import noProfile from '../Images/noProfile.jpeg';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';
const Messages = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = '6754a9268db89992d5b8221e';
  // const API_BASE_URL = 'http://192.168.215.120:3001/api/';
  // const IMG_BASE_URL = 'http://192.168.215.120:3001';
  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/getAllChats/${uid}`,
      );
      setChats(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Render each chat item
  const renderChatItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          uid: uid,
          chatId: item.id,
          chatAvatar: item.chatInfo.imgUrl
            ? item.chatInfo.imgUrl.startsWith('http')
              ? item.chatInfo.imgUrl // Use full URL as is
              : `${IMG_BASE_URL}${item.chatInfo.imgUrl}` // Prepend base URL
            : noProfile, // Fallback to local image
          chatName: item.chatInfo.name,
        })
      }>
      <Image
        source={
          item.chatInfo.imgUrl
            ? {uri: `${IMG_BASE_URL}${item.chatInfo.imgUrl}`}
            : noProfile
        }
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.chatInfo.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage.content || 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        {loading ? (
          <Text>Loading chats...</Text>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
  },
  unreadBadge: {
    backgroundColor: '#0CAF50',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navIcons: {
    width: 30,
    height: 30,
  },
  tabNav: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 72,
    alignItems: 'center',
    elevation: 20,
  },
  navText: {
    color: 'black',
  },
  navTextActive: {
    color: '#14AE5C',
  },
});

export default Messages;
