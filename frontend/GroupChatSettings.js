import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {SelectList} from 'react-native-dropdown-select-list';
import axios from 'axios';
import {API_BASE_URL} from '../constants/config';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GroupChatSettings = ({navigation, route}) => {
  const {groupId, isAdmin, groupInfo: initialGroupInfo} = route.params;
  const [groupInfo, setGroupInfo] = useState(initialGroupInfo || {});
  const [name, setName] = useState('');
  const [aboutGroup, setAboutGroup] = useState('');
  const [allowChatting, setAllowChatting] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (groupInfo) {
      setName(groupInfo.name || '');
      setAboutGroup(groupInfo.aboutGroup || '');
      setAllowChatting(groupInfo.allowChatting ? 'Enabled' : 'Disabled');
      setImage(
        groupInfo.imgUrl ? {uri: getFullFileUrl(groupInfo.imgUrl)} : null,
      );
    }
  }, [groupInfo]);

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

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleUpdateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    setUpdating(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('aboutGroup', aboutGroup || '');
    formData.append(
      'allowChatting',
      allowChatting === 'Enabled' ? 'true' : 'false',
    );

    // Only append image if it's a new file
    if (image?.uri && !image.uri.startsWith('http')) {
      formData.append('group_avatar', {
        uri: image.uri,
        name: image.fileName || `group_avatar_${Date.now()}.jpg`,
        type: image.type || 'image/jpeg',
      });
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/chatgroup/updateGroup/${groupId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.success) {
        Alert.alert('Success', 'Group updated successfully!');
        navigation.goBack();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to update group. Please try again.',
      );
    } finally {
      setUpdating(false);
    }
  };

  const navigateToAddAdmins = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chatgroup/getAdmins/${groupId}`,
      );
      navigation.navigate('GroupChatAdminsAdd', {
        groupId,
        currentAdmins: response.data || [],
      });
    } catch (error) {
      console.error('Failed to fetch group admins:', error);
      Alert.alert('Error', 'Unable to fetch group admins');
    }
  };

  const navigateToAddMembers = () => {
    navigation.navigate('GroupChatMemberAdd', {groupId});
  };

  const navigateToRemoveMembers = () => {
    navigation.navigate('GroupChatMemberRemove', {groupId});
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Buttons */}
      {isAdmin && (
        <View style={styles.topButtonContainer}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={navigateToAddMembers}>
            <Icon name="person-add" size={20} color="#14AE5C" />
            <Text style={styles.smallButtonText}> Add Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={navigateToRemoveMembers}>
            <Icon name="person-remove" size={20} color="#ff4444" />
            <Text style={styles.smallButtonText}> Remove</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={navigateToAddAdmins}>
            <Icon name="admin-panel-settings" size={20} color="#1976d2" />
            <Text style={styles.smallButtonText}> Admins</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Editable Fields */}
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={handlePickImage}
        disabled={!isAdmin}>
        {image ? (
          <Image source={{uri: image.uri}} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Icon name="group" size={50} color="#ccc" />
          </View>
        )}
        {isAdmin && <Text style={styles.editIcon}>✏️</Text>}
      </TouchableOpacity>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Group Name"
        placeholderTextColor="#999"
        style={styles.input}
        editable={isAdmin}
      />

      <TextInput
        value={aboutGroup}
        onChangeText={setAboutGroup}
        placeholder="About Group"
        placeholderTextColor="#999"
        style={[styles.input, styles.multilineInput]}
        multiline
        numberOfLines={4}
        editable={isAdmin}
      />

      <Text style={styles.dropdownLabel}>Chat Settings</Text>
      <SelectList
        setSelected={setAllowChatting}
        data={[
          {key: '1', value: 'Enabled'},
          {key: '2', value: 'Disabled'},
        ]}
        save="value"
        defaultOption={{key: '1', value: allowChatting}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText}
        dropdownTextStyles={styles.dropdownText}
        disabled={!isAdmin}
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateGroup}
          disabled={updating}>
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Group</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
  },
  updateButton: {
    marginTop: 30,
    backgroundColor: '#14AE5C',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  topButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    flexWrap: 'wrap',
  },
  smallButton: {
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButtonText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 14,
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#eee',
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    fontSize: 16,
    elevation: 2,
  },
});

export default GroupChatSettings;
