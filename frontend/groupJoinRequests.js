import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';

const GroupJoinRequests = ({route}) => {
  const navigation = useNavigation();
  const {groupId} = route.params;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/postgroup/getPendingRequests/${groupId}`,
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      Alert.alert('Error', 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async requestId => {
    try {
      setProcessing(true);
      await axios.post(`${API_BASE_URL}/postgroup/approveRequest/${requestId}`);
      Alert.alert('Success', 'Request approved successfully');
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async requestId => {
    try {
      setProcessing(true);
      await axios.post(`${API_BASE_URL}/postgroup/rejectRequest/${requestId}`);
      Alert.alert('Success', 'Request rejected successfully');
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [groupId]);

  const renderRequestItem = ({item}) => (
    <View style={styles.requestItem}>
      <View style={styles.userInfo}>
        <Image
          source={{
            uri:
              `${IMG_BASE_URL}${item.user?.imgUrl}` ||
              'https://via.placeholder.com/40',
          }}
          style={styles.userAvatar}
        />
        <Text style={styles.userName}>{item.user?.name || 'Unknown User'}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveRequest(item._id)}
          disabled={processing}>
          <Icon name="check" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item._id)}
          disabled={processing}>
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14AE5C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Join Requests</Text>
        <View style={{width: 24}} />
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="group" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  approveButton: {
    backgroundColor: '#14AE5C',
  },
  rejectButton: {
    backgroundColor: '#ff4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default GroupJoinRequests;
