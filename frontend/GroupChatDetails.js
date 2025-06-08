import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {API_BASE_URL} from '../constants/config';

const USER_ID = '6754a9268db89992d5b8221e';
const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';

const GroupChatDetails = ({route, navigation}) => {
  const {chatId, userId} = route.params;
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const showMessage = message => {
    Alert.alert('Info', message);
  };

  const getFullFileUrl = relativeUrl => {
    if (!relativeUrl) return null;
    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }
    const IMG_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
    return `${IMG_BASE_URL}${
      relativeUrl.startsWith('/') ? '' : '/'
    }${relativeUrl}`;
  };

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      // First get the group info by chatId
      const groupResponse = await axios.get(
        `${API_BASE_URL}/chatgroup/getGroupByChatId/${chatId}`,
      );

      const group = groupResponse.data;

      // Then get the participants count
      const membersResponse = await axios.get(
        `${API_BASE_URL}/chatgroup/getMembers/${group._id}`,
      );

      setGroupInfo({
        ...group,
        isAdmin: group.admins.includes(userId),
      });

      setMembersCount(membersResponse.data.length);
      setIsAdmin(group.admins.includes(userId));
    } catch (error) {
      console.error('Error fetching group data:', error);
      showMessage('Failed to load group information');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (groupInfo?.admins?.includes(userId)) {
      Alert.alert(
        'You Are An Admin',
        'Are you sure you want to leave this group?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            onPress: async () => {
              try {
                setLeaving(true);
                await axios.put(
                  `${API_BASE_URL}/chatgroup/removeMember/${groupInfo._id}/${userId}`,
                );
                navigation.pop(2);
              } catch (error) {
                console.error('Leave group error:', error);
                showMessage('Failed to leave group');
              } finally {
                setLeaving(false);
              }
            },
            style: 'destructive',
          },
        ],
      );
    } else {
      Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          onPress: async () => {
            try {
              setLeaving(true);
              await axios.put(
                `${API_BASE_URL}/chatgroup/removeMember/${groupInfo._id}/${userId}`,
              );
              navigation.goBack();
            } catch (error) {
              console.error('Leave group error:', error);
              showMessage('Failed to leave group');
            } finally {
              setLeaving(false);
            }
          },
          style: 'destructive',
        },
      ]);
    }
  };

  const navigateToGroupMembers = () => {
    navigation.navigate('GroupChatMembersView', {
      groupId: groupInfo._id,
      isAdmin: isAdmin,
    });
  };

  const navigateToGroupSettings = () => {
    navigation.navigate('GroupChatSettings', {
      groupId: groupInfo._id,
      isAdmin: isAdmin,
      groupInfo: groupInfo,
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroupData();
    }, [chatId]),
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14AE5C" />
      </View>
    );
  }

  if (!groupInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load group information</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <Image
          source={{uri: getFullFileUrl(groupInfo.imgUrl)}}
          style={styles.groupImage}
        />
        <Text style={styles.groupName}>{groupInfo.name}</Text>
        <Text style={styles.groupMembers}>
          {membersCount} members • {groupInfo.is_private ? 'Private' : 'Public'}{' '}
          group
        </Text>
        <Text style={styles.groupDescription}>
          {groupInfo.aboutGroup || 'No description available'}
        </Text>
      </View>

      {/* Group Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Actions</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={navigateToGroupMembers}>
          <Icon name="people" size={24} color="#14AE5C" />
          <Text style={styles.actionText}>View Members</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.actionItem}
            onPress={navigateToGroupSettings}>
            <Icon name="settings" size={24} color="#14AE5C" />
            <Text style={styles.actionText}>Group Settings</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionItem, styles.leaveAction]}
          onPress={handleLeaveGroup}
          disabled={leaving}>
          {leaving ? (
            <ActivityIndicator size="small" color="#ff4444" />
          ) : (
            <>
              <Icon name="exit-to-app" size={24} color="#ff4444" />
              <Text style={[styles.actionText, styles.leaveText]}>
                Leave Group
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Group Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(groupInfo.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Chat Status</Text>
          <Text style={styles.infoValue}>
            {groupInfo.allowChatting ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Admins</Text>
          <Text style={styles.infoValue}>{groupInfo.admins?.length || 0}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
  },
  groupHeader: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  groupDescription: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  leaveAction: {
    borderBottomWidth: 0,
  },
  leaveText: {
    color: '#ff4444',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
  },
});

export default GroupChatDetails;
