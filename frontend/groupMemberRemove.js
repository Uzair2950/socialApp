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
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

const GroupMemberRemove = ({route, navigation}) => {
  const {groupId} = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // const API_BASE_URL = 'http://192.168.215.120:3001/api';
  // const IMG_BASE_URL = 'http://192.168.215.120:3001';

  // Fetch group members with individual user details
  const fetchMembers = async () => {
    try {
      setLoading(true);

      // First get member IDs
      const membersResponse = await axios.get(
        `${API_BASE_URL}/postgroup/getGroupMembers/${groupId}`,
      );
      const memberIds = membersResponse.data.members;

      // Then fetch details for each member
      const membersWithDetails = await Promise.all(
        memberIds.map(async memberId => {
          try {
            const userResponse = await axios.get(
              `${API_BASE_URL}/user/getUserData/${memberId}`,
            );
            return userResponse.data;
          } catch (error) {
            console.error(`Error fetching user ${memberId}:`, error);
            return {
              _id: memberId,
              name: 'Unknown User',
              type: 'Member',
              imgUrl: null,
            };
          }
        }),
      );

      setMembers(membersWithDetails);
    } catch (error) {
      console.error('Fetch members error:', error);
      Alert.alert('Error', 'Failed to load group members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  // Remove member function
  const removeMember = async userId => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this member?',
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
              await axios.post(
                `${API_BASE_URL}/postgroup/removeMember/${groupId}/${userId}`,
              );

              // Optimistic UI update
              setMembers(prev => prev.filter(member => member._id !== userId));
              Alert.alert('Success', 'Member removed successfully');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove member');
              // Refresh to ensure consistency
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

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  // Render each member item
  const renderMemberItem = ({item}) => (
    <View style={styles.memberItem}>
      <Image
        source={{
          uri: item.imgUrl
            ? `${IMG_BASE_URL}${item.imgUrl.startsWith('/') ? '' : '/'}${
                item.imgUrl
              }`
            : `${IMG_BASE_URL}/static/avatars/default_profile.png`,
        }}
        style={styles.memberImage}
      />

      <View style={styles.memberInfo}>
        <Text style={styles.memberName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.memberType} numberOfLines={1}>
          {item.type}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.removeButton,
          removingId === item._id && styles.removeButtonDisabled,
        ]}
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
      <Text style={styles.headerTitle}>Group Members ({members.length})</Text>

      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#14AE5C']}
            tintColor="#14AE5C"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="group" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No members found</Text>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#14AE5C',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  memberInfo: {
    flex: 1,
    marginRight: 10,
    overflow: 'hidden',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  memberType: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonDisabled: {
    backgroundColor: '#f5b7b1',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 15,
    fontSize: 16,
  },
});

export default GroupMemberRemove;
