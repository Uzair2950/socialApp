// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   Modal,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
// } from 'react-native';
// import axios from 'axios';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const AutoReply = ({route}) => {
//   const {userId, chatId} = route.params;
//   const API_BASE_URL = 'http://192.168.215.120:3001/api/chat/';
//   console.log('Route Params:', route.params);
//   console.log('User ID:', userId);
//   console.log('Chat ID:', chatId);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [message, setMessage] = useState('');
//   const [reply, setReply] = useState('');
//   const [autoReplies, setAutoReplies] = useState([]);

//   const [isEnabled, setIsEnabled] = useState(false);

//   const toggleSwitch = () => setIsEnabled(previousState => !previousState);

//   const green = '#14AE5C';
//   const handleAddPress = () => {
//     setModalVisible(true);
//   };
//   const fetchAutoReplies = async () => {
//     try {
//       const url = `${API_BASE_URL}getAutoReplies/${userId}/${chatId}/`;
//       console.log('Fetching auto-replies from:', url);

//       const response = await axios.get(url);
//       console.log('Auto-replies response:', response.data);
//       setAutoReplies(response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching auto-replies:', error);
//     }
//   };
//   const SaveAutoReplies = async () => {
//     try {
//       const url = `${API_BASE_URL}addAutoReply/${userId}/${chatId}/`;
//       const response = await axios.post(url, [{message, reply}]);
//       if (response) {
//         console.log('Auto-reply saved successfully:', response.data);
//         setMessage('');
//         setReply('');
//         setModalVisible(false);
//         fetchAutoReplies();
//       }
//       return response.data;
//     } catch (error) {
//       console.error('Error saving auto-replies:', error);
//     }
//   };
//   const deleteAutoReply = async autoReplyId => {
//     try {
//       const url = `${API_BASE_URL}removeAutoReply/${autoReplyId}`;
//       const response = await axios.delete(url);
//       if (response) {
//         console.log('Auto-reply deleted successfully:', response.data);
//         fetchAutoReplies();
//       }
//     } catch (error) {
//       console.error('Error deleting auto-reply:', error);
//     }
//   };

//   useEffect(() => {
//     fetchAutoReplies();
//   }, []);

//   return (
//     <View style={{flex: 1}}>
//       <ScrollView contentContainerStyle={{paddingBottom: 120}}>
//         <View style={styles.textAndToggle}>
//           <View>
//             <Text style={styles.text}>Turn on auto-reply for this chat</Text>
//             <Text style={styles.text1}>Auto reply feature</Text>
//             <Text style={styles.text1}>
//               automatically saves replies to stored messages
//             </Text>
//           </View>
//           <View>
//             <Pressable
//               style={[
//                 styles.toggleContainer,
//                 {backgroundColor: isEnabled ? '#4cd137' : '#dcdde1'},
//               ]}
//               onPress={toggleSwitch}>
//               <View
//                 style={[
//                   styles.circle,
//                   {alignSelf: isEnabled ? 'flex-end' : 'flex-start'},
//                 ]}
//               />
//             </Pressable>
//           </View>
//         </View>
//         <View
//           style={{
//             justifyContent: 'center',
//             alignItems: 'center',
//             flexDirection: 'row',
//             marginLeft: 60,
//           }}>
//           <Text style={styles.MessageReplyText}>Messages</Text>
//           <Text style={[styles.MessageReplyText, {marginLeft: 40}]}>Reply</Text>
//         </View>

//         {autoReplies.map((item, index) => (
//           <View key={index} style={styles.autoReplyItem}>
//             <View style={styles.autoRepliesContainer}>
//               <Text
//                 style={styles.autoReplyText}
//                 numberOfLines={1}
//                 ellipsizeMode="tail">
//                 {item.message}
//               </Text>
//             </View>
//             <View style={styles.autoRepliesContainer}>
//               <Text
//                 style={styles.autoReplyText}
//                 numberOfLines={1}
//                 ellipsizeMode="tail">
//                 {item.reply}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={() => deleteAutoReply(item._id)}>
//               <Text style={styles.deleteButton}>✗</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </ScrollView>

//       <Pressable style={styles.fab} onPress={handleAddPress}>
//         <Icon name="add" size={25} color="#fff" />
//       </Pressable>

//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Add Auto-Reply</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter Message"
//               placeholderTextColor="#888"
//               value={message}
//               onChangeText={setMessage}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Enter Reply"
//               placeholderTextColor="#888"
//               value={reply}
//               onChangeText={setReply}
//             />

//             <View style={styles.modalButtons}>
//               <Pressable
//                 style={styles.cancelButton}
//                 onPress={() => setModalVisible(false)}>
//                 <Text style={{color: '#fff'}}>Cancel</Text>
//               </Pressable>
//               <Pressable style={styles.saveButton} onPress={SaveAutoReplies}>
//                 <Text style={{color: '#fff'}}>Save</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   textAndToggle: {
//     marginTop: 15,
//     paddingHorizontal: 30,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   toggleContainer: {
//     width: 50,
//     height: 30,
//     borderRadius: 30,
//     padding: 3,
//     justifyContent: 'center',
//     marginVertical: 10,
//   },
//   circle: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     elevation: 2,
//   },
//   text: {
//     color: '#000',
//     marginLeft: 20,
//   },
//   text1: {
//     fontSize: 10,
//     color: '#000',
//     marginLeft: 20,
//   },
//   fab: {
//     width: 50,
//     height: 50,
//     backgroundColor: '#14AE5C',
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     borderRadius: 5, // Square shape
//   },
//   fabIcon: {
//     fontSize: 30,
//     color: 'white',
//   },
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContainer: {
//     width: '80%',
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   input: {
//     height: 45,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     marginBottom: 10,
//     color: '#000',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   cancelButton: {
//     backgroundColor: '#e84118',
//     padding: 10,
//     borderRadius: 8,
//     width: '45%',
//     alignItems: 'center',
//   },
//   saveButton: {
//     backgroundColor: '#4cd137',
//     padding: 10,
//     borderRadius: 8,
//     width: '45%',
//     alignItems: 'center',
//   },
//   autoReplyItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   MessageReplyText: {
//     fontSize: 12,
//     marginLeft: 30,
//   },
//   autoReplyText: {
//     flex: 1,
//     color: '#000',
//     fontSize: 12,
//     marginVertical: 5,
//   },
//   deleteButton: {
//     color: '#14AE5C',
//     fontSize: 18,
//   },
//   autoRepliesContainer: {
//     backgroundColor: '#ffffff',
//     padding: 5,
//     borderRadius: 5,
//     height: 40,
//     width: 150,
//     alignItems: 'flex-start',
//   },
// });
// export default AutoReply;
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '../constants/config';

const AutoReply = ({route}) => {
  const {userId, chatId} = route.params;
  // const API_BASE_URL = 'http://192.168.215.120:3001/api/chat/';

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [autoReplies, setAutoReplies] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);

  const fetchAutoReplies = async () => {
    try {
      const url = `${API_BASE_URL}/chat/getAutoReplies/${userId}/${chatId}/`;
      const response = await axios.get(url);
      console.log('Auto-replies response:', response.data);

      const {autoReplies, isEnabled} = response.data;
      setAutoReplies(Array.isArray(autoReplies) ? autoReplies : []);
      setIsEnabled(!!isEnabled);
    } catch (error) {
      console.error('Error fetching auto-replies:', error);
    }
  };

  const SaveAutoReplies = async () => {
    try {
      const url = `${API_BASE_URL}/chat/addAutoReply/${userId}/${chatId}/`;
      const response = await axios.post(url, [{message, reply}]);
      if (response) {
        console.log('Auto-reply saved successfully:', response.data);
        setMessage('');
        setReply('');
        setModalVisible(false);
        fetchAutoReplies();
      }
    } catch (error) {
      console.error('Error saving auto-replies:', error);
    }
  };

  const deleteAutoReply = async autoReplyId => {
    try {
      const url = `${API_BASE_URL}/chat/removeAutoReply/${autoReplyId}`;
      // Your backend is using PUT, not DELETE
      const response = await axios.put(url);
      if (response) {
        console.log('Auto-reply deleted successfully:', response.data);
        fetchAutoReplies();
      }
    } catch (error) {
      console.error('Error deleting auto-reply:', error);
    }
  };

  const toggleSwitch = async () => {
    try {
      const newToggleState = !isEnabled;
      // Sync toggle state to server
      const url = `${API_BASE_URL}/chat/modifyAutoReplies/`;
      await axios.put(url, {
        user: userId,
        chat: chatId,
        isEnabled: newToggleState,
      });

      setIsEnabled(newToggleState);
    } catch (error) {
      console.error('Error toggling auto-reply:', error);
    }
  };

  const handleAddPress = () => {
    setModalVisible(true);
  };

  useEffect(() => {
    fetchAutoReplies();
  }, []);

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={{paddingBottom: 120}}>
        <View style={styles.textAndToggle}>
          <View>
            <Text style={styles.text}>Turn on auto-reply for this chat</Text>
            <Text style={styles.text1}>Auto reply feature</Text>
            <Text style={styles.text1}>
              automatically saves replies to stored messages
            </Text>
          </View>
          <View>
            <Pressable
              style={[
                styles.toggleContainer,
                {backgroundColor: isEnabled ? '#4cd137' : '#dcdde1'},
              ]}
              onPress={toggleSwitch}>
              <View
                style={[
                  styles.circle,
                  {alignSelf: isEnabled ? 'flex-end' : 'flex-start'},
                ]}
              />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 60,
          }}>
          <Text style={styles.MessageReplyText}>Messages</Text>
          <Text style={[styles.MessageReplyText, {marginLeft: 40}]}>Reply</Text>
        </View>

        {autoReplies.map((item, index) => (
          <View key={index} style={styles.autoReplyItem}>
            <View style={styles.autoRepliesContainer}>
              <Text
                style={styles.autoReplyText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.message}
              </Text>
            </View>
            <View style={styles.autoRepliesContainer}>
              <Text
                style={styles.autoReplyText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.reply}
              </Text>
            </View>
            <TouchableOpacity onPress={() => deleteAutoReply(item._id)}>
              <Text style={styles.deleteButton}>✗</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={handleAddPress}>
        <Icon name="add" size={25} color="#fff" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Auto-Reply</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Message"
              placeholderTextColor="#888"
              value={message}
              onChangeText={setMessage}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Reply"
              placeholderTextColor="#888"
              value={reply}
              onChangeText={setReply}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={{color: '#fff'}}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={SaveAutoReplies}>
                <Text style={{color: '#fff'}}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  textAndToggle: {
    marginTop: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  toggleContainer: {
    width: 50,
    height: 30,
    borderRadius: 30,
    padding: 3,
    justifyContent: 'center',
    marginVertical: 10,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  text: {
    color: '#000',
    marginLeft: 20,
  },
  text1: {
    fontSize: 10,
    color: '#000',
    marginLeft: 20,
  },
  fab: {
    width: 50,
    height: 50,
    backgroundColor: '#14AE5C',
    position: 'absolute',
    bottom: 30,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderRadius: 5, // Square shape
  },
  fabIcon: {
    fontSize: 30,
    color: 'white',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#e84118',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4cd137',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  autoReplyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  MessageReplyText: {
    fontSize: 12,
    marginLeft: 30,
  },
  autoReplyText: {
    flex: 1,
    color: '#000',
    fontSize: 12,
    marginVertical: 5,
  },
  deleteButton: {
    color: '#14AE5C',
    fontSize: 18,
  },
  autoRepliesContainer: {
    backgroundColor: '#ffffff',
    padding: 5,
    borderRadius: 5,
    height: 40,
    width: 150,
    alignItems: 'flex-start',
  },
});
export default AutoReply;
