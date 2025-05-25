import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

// const API_BASE_URL = 'http://192.168.215.120:3001/api';
// const IMG_BASE_URL = 'http://192.168.215.120:3001';
const USER_ID = '6754a9268db89992d5b8221e';

const UserGroups = () => {
  const [groups, setGroups] = useState([]);
  const navigation = useNavigation();

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/getGroups/${USER_ID}`);
      const cleanData = res.data.filter(item => item !== null);
      setGroups(cleanData);
      console.log(cleanData);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  const renderItem = ({item}) => {
    if (!item || !item._id) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('GroupDetailAndPosts', item);
        }}>
        <Image
          source={{
            uri: `${IMG_BASE_URL}${
              item.imgUrl || '/static/avatars/default_group.png'
            }`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name || 'Unnamed Group'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.groupCount}>{groups.length} Groups</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateGroup', USER_ID)}>
          <Text style={styles.createButtonText}>+ Create Group</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        keyExtractor={item => item?._id}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 20}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 10, flex: 1},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#21A558',
  },
  createButton: {
    backgroundColor: '#21A558',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
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
  name: {fontSize: 16, color: 'black'},
});

export default UserGroups;
