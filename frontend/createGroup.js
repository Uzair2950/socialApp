import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {SelectList} from 'react-native-dropdown-select-list';
import {API_BASE_URL} from '../constants/config';

// const API_BASE_URL = 'http://192.168.215.120:3001/api';

const CreateGroup = ({route, navigation}) => {
  const USER_ID = route.params;

  const [name, setName] = useState('');
  const [aboutGroup, setAboutGroup] = useState('');
  const [image, setImage] = useState(null);

  const [type, setType] = useState('Post Only');
  const [visibility, setVisibility] = useState('Public');
  const [allowPosting, setAllowPosting] = useState('Only Admin');

  const typeOptions = [
    {key: '1', value: 'Post Only'},
    {key: '2', value: 'Society'},
  ];

  const visibilityOptions = [
    {key: '1', value: 'Public'},
    {key: '2', value: 'Private'},
  ];

  const postingOptions = [
    {key: '1', value: 'Only Admin'},
    {key: '2', value: 'Everyone'},
  ];

  const handlePickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) return Alert.alert('Missing Info', 'Enter a group name.');

    // Convert to proper boolean values before creating FormData
    const postingPermission = allowPosting === 'Everyone';
    const isPrivate = visibility === 'Private';
    const isOfficial = type === 'Post Only';
    const isSociety = type === 'Society';

    const formData = new FormData();
    formData.append('name', name);
    formData.append('aboutGroup', aboutGroup);
    formData.append('allowPosting', String(postingPermission)); // Explicitly convert to string
    formData.append('is_private', String(isPrivate));
    formData.append('isOfficial', String(isOfficial));
    formData.append('isSociety', String(isSociety));

    if (image) {
      formData.append('group_avatar', {
        uri: image.uri,
        name: image.fileName || 'group.jpg',
        type: image.type || 'image/jpeg',
      });
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/postgroup/createGroup/${USER_ID}`,
        formData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
        },
      );
      Alert.alert('Success', `Group "${name}" created!`);
      navigation.goBack();
    } catch (err) {
      console.error('Create group failed:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to create group.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {image ? (
          <Image source={{uri: image.uri}} style={styles.image} />
        ) : (
          <Image source={require('../Images/BIIT.png')} style={styles.image} />
        )}
        <Text style={styles.editIcon}>✏️</Text>
      </TouchableOpacity>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Group Name"
        placeholderTextColor="silver"
        style={styles.input}
      />

      <TextInput
        value={aboutGroup}
        onChangeText={setAboutGroup}
        placeholder="About Group"
        placeholderTextColor="silver"
        style={styles.input}
        multiline
      />

      <Text style={styles.dropdownLabel}>Type</Text>
      <SelectList
        setSelected={setType}
        data={typeOptions}
        save="value"
        defaultOption={{key: '1', value: type}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText} // <- for selected item
        dropdownTextStyles={styles.dropdownText}
      />

      <Text style={styles.dropdownLabel}>Visibility</Text>
      <SelectList
        setSelected={setVisibility}
        data={visibilityOptions}
        save="value"
        defaultOption={{key: '1', value: visibility}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText} // <- for selected item
        dropdownTextStyles={styles.dropdownText}
      />

      <Text style={styles.dropdownLabel}>Allow Posting</Text>
      <SelectList
        setSelected={setAllowPosting}
        data={postingOptions}
        save="value"
        defaultOption={{key: '1', value: allowPosting}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText} // <- for selected item
        dropdownTextStyles={styles.dropdownText}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: 'white'},
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  image: {width: 100, height: 100, borderRadius: 50},
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: 'black',
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginTop: 10,
  },
  dropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    color: 'black',
  },
  dropdownText: {
    color: 'black',
    fontSize: 16,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: '#B0F2B4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#21A558',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateGroup;
