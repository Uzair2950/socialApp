import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';

const GroupChatMemberRemove = ({route, navigation}) => {
  const {groupId} = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/chatgroup/getNonAdminMembers/${groupId}`,
      );
      setMembers(response.data);
    } catch (error) {
      console.error('Fetch members error:', error);
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const removeMember = async userId => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: async () => {
            try {
              setRemovingId(userId);
              await axios.put(
                `${API_BASE_URL}/chatgroup/removeMember/${groupId}/${userId}`,
              );
              setMembers(prev => prev.filter(member => member._id !== userId));
              Alert.alert('Success', 'Member removed successfully');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove member');
              fetchMembers();
            } finally {
              setRemovingId(null);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderMemberItem = ({item}) => (
    <View style={styles.memberItem}>
      <Image
        source={{
          uri: item.imgUrl
            ? `${IMG_BASE_URL}${item.imgUrl}`
            : `${IMG_BASE_URL}/static/avatars/default_profile.png`,
        }}
        style={styles.memberImage}
      />
      <Text style={styles.memberName}>{item.name}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeMember(item._id)}
        disabled={removingId === item._id}>
        {removingId === item._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="person-remove" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14AE5C" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Remove Members</Text>
      <Text style={styles.subtitle}>
        {members.length} non-admin members in group
      </Text>

      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14AE5C']}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="group" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No members available to remove</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#14AE5C',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  memberImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});

export default GroupChatMemberRemove;
