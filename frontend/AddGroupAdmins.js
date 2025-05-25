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

const AddGroupAdmins = ({route, navigation}) => {
  const {groupId, currentAdmins} = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

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
            return {
              ...userResponse.data,
              isAdmin: currentAdmins.includes(memberId),
            };
          } catch (error) {
            console.error(`Error fetching user ${memberId}:`, error);
            return {
              _id: memberId,
              name: 'Unknown User',
              type: 'Member',
              imgUrl: null,
              isAdmin: currentAdmins.includes(memberId),
            };
          }
        }),
      );

      // Filter out current admins if needed
      setMembers(membersWithDetails.filter(member => !member.isAdmin));
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

  const addAdmin = async userId => {
    Alert.alert(
      'Make Admin',
      'Are you sure you want to make this member an admin?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Make Admin',
          onPress: async () => {
            try {
              setProcessingId(userId);
              await axios.post(`${API_BASE_URL}/postgroup/addGroupAdmins/${groupId}`, {
                admins: [userId],
              });

              // Optimistic UI update - remove from list
              setMembers(prev => prev.filter(member => member._id !== userId));
              Alert.alert('Success', 'Member added as admin successfully');
            } catch (error) {
              console.error('Add admin error:', error);
              Alert.alert('Error', 'Failed to add admin');
              fetchMembers(); // Refresh to ensure consistency
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

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
          Member
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          processingId === item._id && styles.addButtonDisabled,
        ]}
        onPress={() => addAdmin(item._id)}
        disabled={processingId === item._id}>
        {processingId === item._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="person-add" size={20} color="#fff" />
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
      <Text style={styles.headerTitle}>Add New Admins</Text>
      <Text style={styles.subTitle}>Select members to make them admins</Text>

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
            <Text style={styles.emptyText}>
              {members.length === 0 && !loading
                ? 'No regular members available to promote'
                : 'Loading members...'}
            </Text>
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
    marginBottom: 5,
    textAlign: 'center',
  },
  subTitle: {
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
  addButton: {
    backgroundColor: '#14AE5C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#a0d9b4',
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

export default AddGroupAdmins;