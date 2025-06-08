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
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';
const GroupMemberAdd = ({route, navigation}) => {
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
      const response = await axios.get(`${API_BASE_URL}/user/getAllUsers`);
      // Filter users locally based on search query
      const filteredUsers = response.data.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add selected users to group
  const addMembersToGroup = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Info', 'Please select at least one user');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/postgroup/addMembers/${groupId}`, {
        members: selectedUsers,
      });
      Alert.alert('Success', 'Users added to group successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Add members error:', error);
      Alert.alert('Error', 'Failed to add members to group');
    } finally {
      setLoading(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = userId => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  // Render user item
  const renderUserItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUsers.includes(item._id) && styles.selectedUserItem,
      ]}
      onPress={() => toggleUserSelection(item._id)}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Image
          source={{
            uri: `${IMG_BASE_URL}${
              item.imgUrl || '/static/avatars/default_group.png'
            }`,
          }}
          style={styles.userProfile}
        />
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <Text style={styles.userType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name..."
          placeholderTextColor={'black'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchUsers}
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

      {/* Results Section */}
      {users.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Search Results:</Text>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={item => item._id}
            style={styles.userList}
          />
        </View>
      )}

      {/* Selected Users Section */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>
            Selected: {selectedUsers.length} user(s)
          </Text>
        </View>
      )}

      {/* Add Members Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          selectedUsers.length === 0 && styles.disabledButton,
        ]}
        onPress={addMembersToGroup}
        disabled={loading || selectedUsers.length === 0}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Add Selected Members</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color: 'black',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: 'green',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  userList: {
    flex: 1,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',

    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedUserItem: {
    backgroundColor: 'lightblue',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
  userProfile: {
    height: 50,
    width: 50,
    borderRadius: 100,
  },
  userType: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  selectedContainer: {
    marginBottom: 20,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ecc71',
  },
  addButton: {
    height: 50,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GroupMemberAdd;
