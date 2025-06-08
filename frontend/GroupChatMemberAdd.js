import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';

const GroupChatMemberAdd = ({route, navigation}) => {
  const {groupId} = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchUsers = async () => {
    if (searchQuery.length < 2) {
      Alert.alert('Info', 'Please enter at least 2 characters to search');
      return;
    }

    setSearchLoading(true);
    try {
      // Get all users and current group members in parallel
      const [allUsersResponse, groupMembersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/getAllUsers`),
        axios.get(`${API_BASE_URL}/chatgroup/getMembers/${groupId}`),
      ]);

      // Extract user data and current member IDs
      const allUsers = allUsersResponse.data;
      const currentMemberIds = groupMembersResponse.data.map(
        member => member.id,
      );

      // Filter users who aren't already in the group and match search query
      const filteredUsers = allUsers.filter(
        user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !currentMemberIds.includes(user._id),
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const addMembersToGroup = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Info', 'Please select at least one user');
      return;
    }

    setLoading(true);
    try {
      // Use the joinGroup endpoint for each selected user
      await Promise.all(
        selectedUsers.map(userId =>
          axios.post(
            `${API_BASE_URL}/chatgroup/joinGroup/${groupId}/${userId}`,
          ),
        ),
      );

      Alert.alert('Success', 'Users added to group successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Add members error:', error);
      Alert.alert('Error', 'Failed to add members to group');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  const renderUserItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUsers.includes(item._id) && styles.selectedUserItem,
      ]}
      onPress={() => toggleUserSelection(item._id)}>
      <Image
        source={{
          uri: item.imgUrl
            ? `${IMG_BASE_URL}${item.imgUrl.startsWith('/') ? '' : '/'}${
                item.imgUrl
              }`
            : `${IMG_BASE_URL}/static/avatars/default_profile.png`,
        }}
        style={styles.userImage}
      />
      <Text style={styles.userName}>{item.name}</Text>
      {selectedUsers.includes(item._id) && (
        <Icon
          name="check-circle"
          size={24}
          color="#14AE5C"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Members to Group</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchUsers}
          disabled={searchLoading}>
          {searchLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No users found'
                : 'Search for users to add'}
            </Text>
          </View>
        }
      />

      {selectedUsers.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={addMembersToGroup}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>
              Add {selectedUsers.length} Member(s)
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#14AE5C',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedUserItem: {
    borderColor: '#14AE5C',
    backgroundColor: '#e8f5e9',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checkIcon: {
    marginLeft: 10,
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
  addButton: {
    backgroundColor: '#14AE5C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GroupChatMemberAdd;
