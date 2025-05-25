import React, {useState, useCallback} from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE_URL} from '../constants/config';

const Alerts = () => {
  // const API_BASE_URL = 'http://192.168.215.120:3001/api';
  const USER_ID = '6754a9268db89992d5b8221e';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActorData = async actorId => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/user/getUserData/${actorId}`,
      );
      const IMG_BASE_URL = API_BASE_URL.replace('/api', '');
      return {
        name: res.data.name || 'Someone',
        imgUrl: res.data.imgUrl ? `${IMG_BASE_URL}${res.data.imgUrl}` : null,
      };
    } catch (error) {
      console.log('Error fetching actor data:', error);
      return {
        name: 'Someone',
        imgUrl: null,
      };
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/markAsRead/${USER_ID}`);
    } catch (error) {
      console.log('Error marking notifications as read:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/getNotifications/${USER_ID}`,
      );
      const IMG_BASE_URL = API_BASE_URL.replace('/api', '');

      const processedNotifications = await Promise.all(
        response.data.map(async notification => {
          let actorData = {name: 'Someone', imgUrl: null};

          if (typeof notification.actor === 'string') {
            actorData = await fetchActorData(notification.actor);
          } else if (notification.actor?.name) {
            actorData.name = notification.actor.name;
          }

          return {
            ...notification,
            image1: notification.image1
              ? `${IMG_BASE_URL}${notification.image1}`
              : null,
            image2: notification.image2
              ? `${IMG_BASE_URL}${notification.image2}`
              : null,
            actor: actorData,
          };
        }),
      );

      processedNotifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setNotifications(processedNotifications);

      // Mark as read after all notifications are loaded
      await markNotificationsAsRead();
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await fetchNotifications();
        setLoading(false);
      };

      loadData();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const renderNotification = notification => {
    const notificationImage =
      notification.actor.imgUrl || notification.image1 || notification.image2;
    const isUnread = !notification.isRead;

    return (
      <View
        style={isUnread ? styles.newNotification : styles.oldNotification}
        key={notification._id}>
        <Image
          source={notificationImage ? {uri: notificationImage} : ''}
          style={styles.profileImage}
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>
            {notification.actor?.name || 'Someone'}
          </Text>
          <Text style={styles.notificationText}>{notification.content}</Text>
          <Text style={styles.notificationTime}>
            {moment(notification.createdAt).fromNow()}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadIndicator} />}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#01A082" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {unreadNotifications.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>New Notifications</Text>
          {unreadNotifications.map(renderNotification)}
        </>
      )}

      {readNotifications.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Earlier Notifications</Text>
          {readNotifications.map(renderNotification)}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  newNotification: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  oldNotification: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  notificationText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#01A082',
    marginLeft: 10,
  },
});

export default Alerts;
