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

const GroupChatAdminsAdd = ({route, navigation}) => {
  const {groupId} = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchNonAdminMembers = async () => {
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
    fetchNonAdminMembers();
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
              await axios.post(
                `${API_BASE_URL}/chatgroup/addGroupAdmins/${groupId}`,
                {admins: [userId]},
              );
              setMembers(prev => prev.filter(member => member._id !== userId));
              Alert.alert('Success', 'Member promoted to admin successfully');
            } catch (error) {
              console.error('Add admin error:', error);
              Alert.alert('Error', 'Failed to add admin');
              fetchNonAdminMembers();
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
            ? `${IMG_BASE_URL}${item.imgUrl}`
            : `${IMG_BASE_URL}/static/avatars/default_profile.png`,
        }}
        style={styles.memberImage}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>Member</Text>
      </View>
      <TouchableOpacity
        style={styles.addAdminButton}
        onPress={() => addAdmin(item._id)}
        disabled={processingId === item._id}>
        {processingId === item._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon name="admin-panel-settings" size={20} color="#fff" />
            <Text style={styles.addAdminText}>Make Admin</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    fetchNonAdminMembers();
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
      <Text style={styles.title}>Add Group Admins</Text>
      <Text style={styles.subtitle}>
        Select members to promote to admin status
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
            <Text style={styles.emptyText}>
              {members.length === 0 && !loading
                ? 'No members available to promote'
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
  },
  addAdminButton: {
    backgroundColor: '#14AE5C',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAdminText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
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

export default GroupChatAdminsAdd;
