// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import {SelectList} from 'react-native-dropdown-select-list';
// import axios from 'axios';

// const API_BASE_URL = 'http://192.168.215.120:3001/api';

// const GroupSettings = ({navigation, route}) => {
//   const {groupId, groupInfo} = route.params;

//   const [name, setName] = useState('');
//   const [aboutGroup, setAboutGroup] = useState('');
//   const [type, setType] = useState('');
//   const [visibility, setVisibility] = useState('');
//   const [allowPosting, setAllowPosting] = useState('');

//   useEffect(() => {
//     if (groupInfo) {
//       setName(groupInfo.name || '');
//       setAboutGroup(groupInfo.aboutGroup || '');
//       setType(groupInfo.isOfficial ? 'Post Only' : 'Society');
//       setVisibility(groupInfo.is_private ? 'Private' : 'Public');
//       setAllowPosting(groupInfo.allowPosting ? 'Everyone' : 'Only Admin');
//     }
//   }, [groupInfo]);

//   const handleUpdateGroup = async () => {
//     const updatedGroup = {
//       name,
//       aboutGroup,
//       isOfficial: type === 'Post Only',
//       isSociety: type === 'Society',
//       is_private: visibility === 'Private',
//       allowPosting: allowPosting === 'Everyone',
//     };

//     try {
//       await axios.put(
//         `${API_BASE_URL}/postgroup/updateGroup/${groupId}`,
//         updatedGroup,
//       );
//       Alert.alert('Success', 'Group updated successfully!');
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       Alert.alert('Error', 'Failed to update group');
//     }
//   };

//   const handleDeleteGroup = () => {
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this group? This action cannot be undone.',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           onPress: async () => {
//             try {
//               await axios.delete(
//                 `${API_BASE_URL}/postgroup/deleteGroup/${groupId}`,
//               );
//               Alert.alert('Success', 'Group deleted successfully!');
//               navigation.goBack(); // Navigate back after deletion
//             } catch (err) {
//               console.error(err.response?.data || err.message);
//               Alert.alert('Error', 'Failed to delete group');
//             }
//           },
//         },
//       ],
//     );
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* Top Buttons */}
//       <View style={styles.topButtonContainer}>
//         <TouchableOpacity
//           style={styles.smallButton}
//           onPress={() => navigation.navigate('PendingRequests', {groupId})}>
//           <Text style={styles.smallButtonText}>📩 Requests</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.smallButton}
//           onPress={() => navigation.navigate('AddMembers', {groupId})}>
//           <Text style={styles.smallButtonText}>➕ Add</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.smallButton}
//           onPress={() => navigation.navigate('RemoveMembers', {groupId})}>
//           <Text style={styles.smallButtonText}>➖ Remove</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.smallButton}
//           onPress={handleDeleteGroup}>
//           <Text style={styles.smallButtonText}>🗑️ Delete</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Editable Fields */}
//       <TextInput
//         value={name}
//         onChangeText={setName}
//         placeholder="Group Name"
//         placeholderTextColor="silver"
//         style={styles.input}
//       />

//       <TextInput
//         value={aboutGroup}
//         onChangeText={setAboutGroup}
//         placeholder="About Group"
//         placeholderTextColor="silver"
//         style={styles.input}
//         multiline
//       />

//       <Text style={styles.dropdownLabel}>Type</Text>
//       <SelectList
//         setSelected={setType}
//         data={[
//           {key: '1', value: 'Post Only'},
//           {key: '2', value: 'Society'},
//         ]}
//         save="value"
//         defaultOption={{key: '1', value: type}}
//         boxStyles={styles.dropdown}
//         inputStyles={styles.dropdownText}
//         dropdownTextStyles={styles.dropdownText}
//       />

//       <Text style={styles.dropdownLabel}>Visibility</Text>
//       <SelectList
//         setSelected={setVisibility}
//         data={[
//           {key: '1', value: 'Public'},
//           {key: '2', value: 'Private'},
//         ]}
//         save="value"
//         defaultOption={{key: '1', value: visibility}}
//         boxStyles={styles.dropdown}
//         inputStyles={styles.dropdownText}
//         dropdownTextStyles={styles.dropdownText}
//       />

//       <Text style={styles.dropdownLabel}>Allow Posting</Text>
//       <SelectList
//         setSelected={setAllowPosting}
//         data={[
//           {key: '1', value: 'Only Admin'},
//           {key: '2', value: 'Everyone'},
//         ]}
//         save="value"
//         defaultOption={{key: '1', value: allowPosting}}
//         boxStyles={styles.dropdown}
//         inputStyles={styles.dropdownText}
//         dropdownTextStyles={styles.dropdownText}
//       />

//       <TouchableOpacity style={styles.updateButton} onPress={handleUpdateGroup}>
//         <Text style={styles.updateButtonText}>Update Group</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, padding: 20, backgroundColor: '#fff'},
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     fontSize: 16,
//     color: 'black',
//   },
//   dropdownLabel: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 4,
//     marginTop: 10,
//   },
//   dropdown: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   dropdownText: {
//     color: 'black',
//     fontSize: 16,
//   },
//   updateButton: {
//     marginTop: 20,
//     backgroundColor: '#A5D6A7',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   updateButtonText: {
//     color: '#1B5E20',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   topButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   smallButton: {
//     backgroundColor: '#E0F2F1',
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//     elevation: 2,
//   },
//   smallButtonText: {
//     color: '#00695C',
//     fontWeight: '600',
//     fontSize: 10,
//   },
// });

// export default GroupSettings;
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

// const API_BASE_URL = 'http://192.168.215.120:3001/api';

const GroupSettings = ({navigation, route}) => {
  const {groupId, groupInfo, isCreator} = route.params;
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState('');
  const [aboutGroup, setAboutGroup] = useState('');
  const [type, setType] = useState('');
  const [visibility, setVisibility] = useState('');
  const [allowPosting, setAllowPosting] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupInfo) {
      setName(groupInfo.name || '');
      setAboutGroup(groupInfo.aboutGroup || '');
      setType(groupInfo.isOfficial ? 'Post Only' : 'Society');
      setVisibility(groupInfo.is_private ? 'Private' : 'Public');
      setAllowPosting(groupInfo.allowPosting ? 'Everyone' : 'Only Admin');
      setImage(
        groupInfo.imgUrl
          ? {uri: API_BASE_URL.replace('/api', '') + groupInfo.imgUrl}
          : null,
      );
    }
  }, [groupInfo]);

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

    setLoading(true);

    const formData = new FormData();
    // formData.append('name', name);
    // formData.append('aboutGroup', aboutGroup);
    // formData.append(
    //   'allowPosting',
    //   allowPosting === 'Everyone' ? 'true' : 'false',
    // );
    // formData.append('is_private', visibility === 'Private' ? 'true' : 'false');
    // formData.append('isOfficial', type === 'Post Only' ? 'true' : 'false');
    // formData.append('isSociety', type === 'Society' ? 'true' : 'false');
    formData.append('name', name);
    formData.append('aboutGroup', aboutGroup);

    // EITHER keep this (works):
    formData.append(
      'allowPosting',
      allowPosting === 'Everyone' ? 'true' : 'false',
    );
    formData.append('is_private', visibility === 'Private' ? 'true' : 'false');
    formData.append('isOfficial', type === 'Post Only' ? 'true' : 'false');
    formData.append('isSociety', type === 'Society' ? 'true' : 'false');

    if (image?.uri && !image.uri.startsWith('http')) {
      formData.append('group_avatar', {
        uri: image.uri,
        name: image.fileName || 'group_avatar.jpg',
        type: image.type || 'image/jpeg',
      });
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/postgroup/updateGroup/${groupId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert('Success', 'Group updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const response = await axios.delete(
                `${API_BASE_URL}/postgroup/deleteGroup/${groupId}`,
                {timeout: 10000},
              );
              if (response.data.success) {
                Alert.alert('Success', 'Group deleted successfully!');
                navigation.navigate('Groups');
              } else {
                throw new Error(response.data.message || 'Deletion failed');
              }
            } catch (error) {
              console.error('Delete error:', {
                message: error.message,
                response: error.response?.data,
                config: error.config,
              });
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete group',
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Buttons */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate('GroupJoinRequests', {groupId})}>
          <Text style={styles.smallButtonText}>📩 Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate('GroupMemberAdd', {groupId})}>
          <Text style={styles.smallButtonText}>➕ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => navigation.navigate('GroupMemberRemove', {groupId})}>
          <Text style={styles.smallButtonText}>➖ Remove</Text>
        </TouchableOpacity>

        {isCreator && (
          <TouchableOpacity
            disabled={deleting}
            style={[styles.smallButton, styles.deleteButton]}
            onPress={handleDeleteGroup}>
            <Text style={styles.smallButtonText}>
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.smallButton}
          onPress={async () => {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/postgroup/getGroupAdmins/${groupId}`,
              );
              console.log(
                'These are admins------------------>',
                response.data.admins,
              );
              navigation.navigate('AddGroupAdmins', {
                groupId,
                currentAdmins: response.data.admins || [],
              });
            } catch (error) {
              console.error('Failed to fetch group admins:', error);
              Alert.alert('Error', 'Unable to fetch group admins');
            }
          }}>
          <Text style={styles.smallButtonText}>➕ Admin</Text>
        </TouchableOpacity>
      </View>

      {/* Editable Fields */}
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
        placeholderTextColor="#999"
        style={styles.input}
      />

      <TextInput
        value={aboutGroup}
        onChangeText={setAboutGroup}
        placeholder="About Group"
        placeholderTextColor="#999"
        style={[styles.input, styles.multilineInput]}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.dropdownLabel}>Type</Text>
      <SelectList
        setSelected={setType}
        data={[
          {key: '1', value: 'Post Only'},
          {key: '2', value: 'Society'},
        ]}
        save="value"
        defaultOption={{key: '1', value: type}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText}
        dropdownTextStyles={styles.dropdownText}
      />

      <Text style={styles.dropdownLabel}>Visibility</Text>
      <SelectList
        setSelected={setVisibility}
        data={[
          {key: '1', value: 'Public'},
          {key: '2', value: 'Private'},
        ]}
        save="value"
        defaultOption={{key: '1', value: visibility}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText}
        dropdownTextStyles={styles.dropdownText}
      />

      <Text style={styles.dropdownLabel}>Allow Posting</Text>
      <SelectList
        setSelected={setAllowPosting}
        data={[
          {key: '1', value: 'Only Admin'},
          {key: '2', value: 'Everyone'},
        ]}
        save="value"
        defaultOption={{key: '1', value: allowPosting}}
        boxStyles={styles.dropdown}
        inputStyles={styles.dropdownText}
        dropdownTextStyles={styles.dropdownText}
      />

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdateGroup}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Update Group</Text>
        )}
      </TouchableOpacity>
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
  },
  deleteButton: {
    backgroundColor: '#ffebee',
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

export default GroupSettings;
