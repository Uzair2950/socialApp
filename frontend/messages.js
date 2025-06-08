// import React, {useEffect, useState, useCallback} from 'react';
// import {
//   View,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Pressable,
//   Modal,
//   TextInput,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import {Text, Button} from 'react-native-paper';
// import {useFocusEffect} from '@react-navigation/native';
// import axios from 'axios';
// import noProfile from '../Images/noProfile.jpeg';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {API_BASE_URL} from '../constants/config';
// import {IMG_BASE_URL} from '../constants/config';

// const Messages = ({navigation}) => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [chatTypeModal, setChatTypeModal] = useState(false);
//   const [isGroupChat, setIsGroupChat] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [groupDetails, setGroupDetails] = useState({
//     name: '',
//     aboutGroup: '',
//     allowChatting: true,
//   });
//   const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [creatingChat, setCreatingChat] = useState(false);
//   const uid = '6754a9268db89992d5b8221e';

//   const fetchChats = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/chat/getAllChats/${uid}`,
//       );
//       setChats(response.data);
//     } catch (error) {
//       console.error('Error fetching chats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsers = async () => {
//     setLoadingUsers(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/user/getAllUsers`);
//       setUsers(response.data);
//       setFilteredUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchChats();
//     }, []),
//   );

//   useEffect(() => {
//     if (searchText) {
//       const filtered = users.filter(user =>
//         user.name.toLowerCase().includes(searchText.toLowerCase()),
//       );
//       setFilteredUsers(filtered);
//     } else {
//       setFilteredUsers(users);
//     }
//   }, [searchText, users]);

//   const handleCreateChat = async () => {
//     if (!selectedUser) return;
//     setCreatingChat(true);
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/chat/initiateChat/${uid}/${selectedUser._id}`,
//       );
//       const chatId = response.data.id;

//       navigation.navigate('Chat', {
//         uid: uid,
//         chatId: chatId,
//         chatAvatar: selectedUser.imgUrl
//           ? selectedUser.imgUrl.startsWith('http')
//             ? selectedUser.imgUrl
//             : `${IMG_BASE_URL}${selectedUser.imgUrl}`
//           : noProfile,
//         chatName: selectedUser.name,
//       });
//       setModalVisible(false);
//       setChatTypeModal(false);
//       setSelectedUser(null);
//     } catch (error) {
//       console.error('Error creating chat:', error);
//       Alert.alert('Error', 'Failed to create chat');
//     } finally {
//       setCreatingChat(false);
//     }
//   };

//   const handleCreateGroupChat = async () => {
//     if (!groupDetails.name || selectedUsersForGroup.length === 0) {
//       Alert.alert(
//         'Error',
//         'Please provide group name and select at least one member',
//       );
//       return;
//     }
//     setCreatingChat(true);
//     try {
//       const formData = new FormData();
//       formData.append('name', groupDetails.name);
//       formData.append('aboutGroup', groupDetails.aboutGroup);
//       formData.append('allowChatting', groupDetails.allowChatting.toString());
//       formData.append(
//         'participants',
//         JSON.stringify(selectedUsersForGroup.map(u => u._id)),
//       );

//       const response = await axios.post(
//         `${API_BASE_URL}/chatgroup/newGroupChat/${uid}`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         },
//       );

//       const groupId = response.data.id;
//       navigation.navigate('Chat', {
//         uid: uid,
//         chatId: groupId,
//         chatAvatar: noProfile,
//         chatName: groupDetails.name,
//         isGroup: true,
//       });
//       setModalVisible(false);
//       setChatTypeModal(false);
//       setGroupDetails({
//         name: '',
//         aboutGroup: '',
//         allowChatting: true,
//       });
//       setSelectedUsersForGroup([]);
//     } catch (error) {
//       console.error('Error creating group chat:', error);
//       Alert.alert('Error', 'Failed to create group chat');
//     } finally {
//       setCreatingChat(false);
//     }
//   };

//   const toggleUserSelection = user => {
//     if (selectedUsersForGroup.some(u => u._id === user._id)) {
//       setSelectedUsersForGroup(
//         selectedUsersForGroup.filter(u => u._id !== user._id),
//       );
//     } else {
//       setSelectedUsersForGroup([...selectedUsersForGroup, user]);
//     }
//   };

//   const renderUserItem = ({item}) => (
//     <TouchableOpacity
//       style={styles.userItem}
//       onPress={() => {
//         if (isGroupChat) {
//           toggleUserSelection(item);
//         } else {
//           setSelectedUser(item);
//         }
//       }}>
//       <Image
//         source={
//           item.imgUrl ? {uri: `${IMG_BASE_URL}${item.imgUrl}`} : noProfile
//         }
//         style={styles.avatar}
//       />
//       <Text style={styles.userName}>{item.name}</Text>
//       {isGroupChat ? (
//         <Icon
//           name={
//             selectedUsersForGroup.some(u => u._id === item._id)
//               ? 'check-box'
//               : 'check-box-outline-blank'
//           }
//           size={24}
//           color={
//             selectedUsersForGroup.some(u => u._id === item._id)
//               ? '#6200ee'
//               : '#ccc'
//           }
//         />
//       ) : (
//         selectedUser?._id === item._id && (
//           <Icon name="check" size={24} color="#6200ee" />
//         )
//       )}
//     </TouchableOpacity>
//   );

//   const renderChatItem = ({item}) => (
//     <TouchableOpacity
//       style={styles.chatItem}
//       onPress={() =>
//         navigation.navigate('Chat', {
//           uid: uid,
//           chatId: item.id,
//           chatAvatar: item.chatInfo.imgUrl
//             ? item.chatInfo.imgUrl.startsWith('http')
//               ? item.chatInfo.imgUrl
//               : `${IMG_BASE_URL}${item.chatInfo.imgUrl}`
//             : noProfile,
//           chatName: item.chatInfo.name,
//           participants: item.totalParticipants,
//         })
//       }>
//       <Image
//         source={
//           item.chatInfo.imgUrl
//             ? {uri: `${IMG_BASE_URL}${item.chatInfo.imgUrl}`}
//             : noProfile
//         }
//         style={styles.avatar}
//       />
//       <View style={styles.chatInfo}>
//         <Text style={styles.chatName}>{item.chatInfo.name}</Text>
//         <Text style={styles.lastMessage} numberOfLines={1}>
//           {item.lastMessage.content || 'No messages yet'}
//         </Text>
//       </View>
//       {item.unreadCount > 0 && (
//         <View style={styles.unreadBadge}>
//           <Text style={styles.unreadText}>{item.unreadCount}</Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={{flex: 1}}>
//       <View style={styles.container}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#6200ee" />
//         ) : (
//           <FlatList
//             data={chats}
//             keyExtractor={item => item.id}
//             renderItem={renderChatItem}
//             showsVerticalScrollIndicator={false}
//           />
//         )}
//       </View>

//       <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
//         <Icon name="add" size={25} color="#fff" />
//       </Pressable>

//       <Modal
//         visible={modalVisible && !chatTypeModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Create New</Text>
//             <Button
//               mode="contained"
//               style={styles.modalButton}
//               onPress={() => {
//                 setIsGroupChat(false);
//                 setChatTypeModal(true);
//                 fetchUsers();
//               }}>
//               New Chat
//             </Button>
//             <Button
//               mode="contained"
//               style={styles.modalButton}
//               onPress={() => {
//                 setIsGroupChat(true);
//                 setChatTypeModal(true);
//                 fetchUsers();
//               }}>
//               New Group Chat
//             </Button>
//             <Button
//               mode="outlined"
//               style={styles.modalButton}
//               onPress={() => setModalVisible(false)}>
//               Cancel
//             </Button>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={chatTypeModal}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => {
//           setChatTypeModal(false);
//           setSelectedUser(null);
//           setSelectedUsersForGroup([]);
//           setIsGroupChat(false);
//         }}>
//         <View style={styles.fullModalContainer}>
//           <View style={styles.modalHeader}>
//             <Icon
//               name="arrow-back"
//               size={24}
//               onPress={() => {
//                 setChatTypeModal(false);
//                 setSelectedUser(null);
//                 setSelectedUsersForGroup([]);
//                 setIsGroupChat(false);
//               }}
//             />
//             <Text style={styles.modalHeaderTitle}>
//               {isGroupChat ? 'Select Group Members' : 'Select User'}
//             </Text>
//           </View>

//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search users..."
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor="black"
//           />

//           {loadingUsers ? (
//             <ActivityIndicator size="large" style={styles.loader} />
//           ) : (
//             <FlatList
//               data={filteredUsers.filter(user => user._id !== uid)}
//               keyExtractor={item => item._id}
//               renderItem={renderUserItem}
//               contentContainerStyle={styles.userList}
//             />
//           )}

//           {selectedUser && !isGroupChat && (
//             <Button
//               mode="contained"
//               loading={creatingChat}
//               style={styles.createButton}
//               onPress={handleCreateChat}>
//               Create Chat
//             </Button>
//           )}

//           {isGroupChat && selectedUsersForGroup.length > 0 && (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Group Name"
//                 value={groupDetails.name}
//                 onChangeText={text =>
//                   setGroupDetails({...groupDetails, name: text})
//                 }
//                 placeholderTextColor="black"
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="About Group (Optional)"
//                 value={groupDetails.aboutGroup}
//                 onChangeText={text =>
//                   setGroupDetails({...groupDetails, aboutGroup: text})
//                 }
//                 multiline
//                 placeholderTextColor="black"
//               />
//               <Button
//                 mode="contained"
//                 loading={creatingChat}
//                 style={styles.createButton}
//                 onPress={handleCreateGroupChat}>
//                 Create Group with {selectedUsersForGroup.length} members
//               </Button>
//             </>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// };
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, Button} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import noProfile from '../Images/noProfile.jpeg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

const Messages = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatTypeModal, setChatTypeModal] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupDetails, setGroupDetails] = useState({
    name: '',
    aboutGroup: '',
    allowChatting: true,
  });
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const uid = '67573f6611a71256e4e32d5f';

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/getAllChats/${uid}`,
      );
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/user/getAllUsers`);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, []),
  );

  useEffect(() => {
    if (searchText) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchText, users]);

  const handleCreateChat = async () => {
    if (!selectedUser) return;
    setCreatingChat(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/initiateChat/${uid}/${selectedUser._id}`,
      );
      const chatId = response.data.id;

      navigation.navigate('Chat', {
        uid: uid,
        chatId: chatId,
        chatAvatar: selectedUser.imgUrl
          ? selectedUser.imgUrl.startsWith('http')
            ? selectedUser.imgUrl
            : `${IMG_BASE_URL}${selectedUser.imgUrl}`
          : noProfile,
        chatName: selectedUser.name,
      });
      setModalVisible(false);
      setChatTypeModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    } finally {
      setCreatingChat(false);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupDetails.name || selectedUsersForGroup.length === 0) {
      Alert.alert(
        'Error',
        'Please provide group name and select at least one member',
      );
      return;
    }
    setCreatingChat(true);
    try {
      const formData = new FormData();
      formData.append('name', groupDetails.name);
      formData.append('aboutGroup', groupDetails.aboutGroup);
      formData.append('allowChatting', groupDetails.allowChatting.toString());
      formData.append(
        'participants',
        JSON.stringify([uid, ...selectedUsersForGroup.map(u => u._id)]), // Include creator and selected members
      );

      const response = await axios.post(
        `${API_BASE_URL}/chatgroup/newGroupChat/${uid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const groupId = response.data.id;

      // Add all selected members to the group
      await Promise.all(
        selectedUsersForGroup.map(user =>
          axios.post(
            `${API_BASE_URL}/chatgroup/joinGroup/${groupId}/${user._id}`,
          ),
        ),
      );

      // navigation.navigate('Chat', {
      //   uid: uid,
      //   chatId: groupId,
      //   chatAvatar: noProfile,
      //   chatName: groupDetails.name,
      //   isGroup: true,
      // });
      setModalVisible(false);
      setChatTypeModal(false);
      setGroupDetails({
        name: '',
        aboutGroup: '',
        allowChatting: true,
      });
      setSelectedUsersForGroup([]);
    } catch (error) {
      console.error('Error creating group chat:', error);
      Alert.alert('Error', 'Failed to create group chat');
    } finally {
      setCreatingChat(false);
    }
    fetchChats();
  };

  const toggleUserSelection = user => {
    if (selectedUsersForGroup.some(u => u._id === user._id)) {
      setSelectedUsersForGroup(
        selectedUsersForGroup.filter(u => u._id !== user._id),
      );
    } else {
      setSelectedUsersForGroup([...selectedUsersForGroup, user]);
    }
  };

  const renderUserItem = ({item}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        if (isGroupChat) {
          toggleUserSelection(item);
        } else {
          setSelectedUser(item);
        }
      }}>
      <Image
        source={
          item.imgUrl ? {uri: `${IMG_BASE_URL}${item.imgUrl}`} : noProfile
        }
        style={styles.avatar}
      />
      <Text style={styles.userName}>{item.name}</Text>
      {isGroupChat ? (
        <Icon
          name={
            selectedUsersForGroup.some(u => u._id === item._id)
              ? 'check-box'
              : 'check-box-outline-blank'
          }
          size={24}
          color={
            selectedUsersForGroup.some(u => u._id === item._id)
              ? '#6200ee'
              : '#ccc'
          }
        />
      ) : (
        selectedUser?._id === item._id && (
          <Icon name="check" size={24} color="#6200ee" />
        )
      )}
    </TouchableOpacity>
  );

  const renderChatItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Chat', {
          uid: uid,
          chatId: item.id,
          chatAvatar: item.chatInfo.imgUrl
            ? item.chatInfo.imgUrl.startsWith('http')
              ? item.chatInfo.imgUrl
              : `${IMG_BASE_URL}${item.chatInfo.imgUrl}`
            : noProfile,
          chatName: item.chatInfo.name,
          participants: item.totalParticipants,
          isGroup: item.isGroup,
        })
      }>
      <Image
        source={
          item.chatInfo.imgUrl
            ? {uri: `${IMG_BASE_URL}${item.chatInfo.imgUrl}`}
            : noProfile
        }
        style={styles.avatar}
      />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.chatInfo.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage.content || 'No messages yet'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={25} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisible && !chatTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New</Text>
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => {
                setIsGroupChat(false);
                setChatTypeModal(true);
                fetchUsers();
              }}>
              New Chat
            </Button>
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => {
                setIsGroupChat(true);
                setChatTypeModal(true);
                fetchUsers();
              }}>
              New Group Chat
            </Button>
            <Button
              mode="outlined"
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      <Modal
        visible={chatTypeModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setChatTypeModal(false);
          setSelectedUser(null);
          setSelectedUsersForGroup([]);
          setIsGroupChat(false);
        }}>
        <View style={styles.fullModalContainer}>
          <View style={styles.modalHeader}>
            <Icon
              name="arrow-back"
              size={24}
              onPress={() => {
                setChatTypeModal(false);
                setSelectedUser(null);
                setSelectedUsersForGroup([]);
                setIsGroupChat(false);
              }}
            />
            <Text style={styles.modalHeaderTitle}>
              {isGroupChat ? 'Select Group Members' : 'Select User'}
            </Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="black"
          />

          {loadingUsers ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <FlatList
              data={filteredUsers.filter(user => user._id !== uid)}
              keyExtractor={item => item._id}
              renderItem={renderUserItem}
              contentContainerStyle={styles.userList}
            />
          )}

          {selectedUser && !isGroupChat && (
            <Button
              mode="contained"
              loading={creatingChat}
              style={styles.createButton}
              onPress={handleCreateChat}>
              Create Chat
            </Button>
          )}

          {isGroupChat && selectedUsersForGroup.length > 0 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Group Name"
                value={groupDetails.name}
                onChangeText={text =>
                  setGroupDetails({...groupDetails, name: text})
                }
                placeholderTextColor="black"
              />
              <TextInput
                style={styles.input}
                placeholder="About Group (Optional)"
                value={groupDetails.aboutGroup}
                onChangeText={text =>
                  setGroupDetails({...groupDetails, aboutGroup: text})
                }
                multiline
                placeholderTextColor="black"
              />
              <Button
                mode="contained"
                loading={creatingChat}
                style={styles.createButton}
                onPress={handleCreateGroupChat}>
                Create Group with {selectedUsersForGroup.length} members
              </Button>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    color: 'black',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#6200ee',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    width: 50,
    height: 50,
    backgroundColor: '#14AE5C',
    position: 'absolute',
    bottom: 10,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  modalButton: {
    marginVertical: 8,
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color: 'black',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: 'black',
  },
  searchInput: {
    padding: 12,
    margin: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: 'black',
  },
  userList: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: 'black',
  },
  createButton: {
    margin: 16,
  },
  input: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: 'black',
  },
  loader: {
    marginTop: 40,
  },
});

export default Messages;
