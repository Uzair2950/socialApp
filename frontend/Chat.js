// import React, {useEffect, useState, useRef} from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
// } from 'react-native';
// import {Text} from 'react-native-paper';
// import axios from 'axios';
// import {io} from 'socket.io-client';

// const Chat = ({navigation, route}) => {
//   const {uid, chatId, chatAvatar, chatName} = route.params;
//   const [messages, setMessages] = useState([]);
//   const [refresh, setRefresh] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [autoReplies, setAutoReplies] = useState([]);
//   const [keyboardPadding, setKeyboardPadding] = useState(0); // State to manage keyboard padding
//   // const uid = '6754a9268db89992d5b8221f';
//   const socket = useRef(null);
//   const API_BASE_URL = 'http://192.168.215.120:3001/api/';
//   const IMG_BASE_URL = 'http://192.168.215.120:3001';
//   // Fetch messages
//   const fetchMessages = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}chat/getChat/${chatId}/${uid}/0`,
//       );
//       // Ensure messages are in reverse order (newest first)
//       setMessages([...response.data.messages].reverse());
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch auto-replies for the current user and chat
//   const fetchAutoReplies = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}chat/getAutoReplies/${uid}/${chatId}`,
//       );
//       setAutoReplies(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error('Error fetching auto-replies:', error);
//     }
//   };

//   // Initialize Socket.IO connection
//   useEffect(() => {
//     socket.current = io(`${IMG_BASE_URL}`, {
//       transports: ['websocket'],
//     });

//     socket.current.on(`receiveMessage_${chatId}`, messageId => {
//       axios
//         .get(`${API_BASE_URL}chat/getMessage/${messageId}/${uid}`)
//         .then(response => {
//           setMessages(prevMessages => {
//             const messageExists = prevMessages.some(
//               msg => msg._id === messageId || msg._id === response.data._id,
//             );

//             if (messageExists) {
//               return prevMessages;
//             }

//             // Check if the received message matches any auto-reply message
//             const autoReply = autoReplies.find(
//               ar =>
//                 ar.message.toLowerCase() ===
//                 response.data.content.toLowerCase(),
//             );

//             if (autoReply) {
//               // Send the auto-reply
//               sendAutoReply(autoReply.reply);
//             }

//             // Add the new message to the top of the list (newest first)
//             return [response.data, ...prevMessages];
//           });
//         })
//         .catch(error => {
//           console.error('Error fetching new message:', error);
//         });
//     });

//     // Cleanup on unmount
//     return () => {
//       socket.current.disconnect();
//       setMessages([]); // Reset messages when leaving the screen
//     };
//   }, [chatId, autoReplies]);

//   // Fetch messages and auto-replies when the chatId changes
//   useEffect(() => {
//     fetchMessages();
//     fetchAutoReplies();
//   }, [chatId]);

//   // Listen for keyboard show/hide events
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       event => {
//         // Adjust padding based on keyboard height
//         setKeyboardPadding(event.endCoordinates.height);
//       },
//     );

//     const keyboardDidHideListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         // Reset padding when keyboard is hidden
//         setKeyboardPadding(0);
//       },
//     );

//     // Cleanup listeners on unmount
//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Send a new message
//   const sendMessage = async () => {
//     if (inputText.trim() === '') return;

//     try {
//       const tempId = Date.now().toString();
//       const newMessage = {
//         _id: tempId,
//         content: inputText,
//         senderId: uid,
//         createdAt: new Date().toISOString(),
//         sentByMe: true,
//       };

//       // Add the new message to the top of the list (newest first)
//       setMessages(prevMessages => [newMessage, ...prevMessages]);
//       setRefresh(prev => !prev); // Force re-render
//       setInputText('');

//       const response = await axios.post(
//         `${API_BASE_URL}chat/sendMessage/${chatId}`,
//         {
//           senderId: uid,
//           content: inputText,
//         },
//       );

//       // Update the temporary message ID with the actual ID from the server
//       setMessages(prevMessages =>
//         prevMessages.map(msg =>
//           msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
//         ),
//       );

//       setRefresh(prev => !prev); // Force another re-render

//       socket.current.emit('sendMessage', {
//         chatId,
//         messageId: response.data.message_id,
//         senderId: uid,
//       });
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   };

//   // Send an auto-reply message
//   const sendAutoReply = async reply => {
//     console.log('Triggering Auto-Reply with:', reply);
//     try {
//       const tempId = Date.now().toString();
//       const newMessage = {
//         _id: tempId,
//         content: reply,
//         senderId: uid,
//         createdAt: new Date().toISOString(),
//         sentByMe: true,
//       };

//       // Add the auto-reply message to the top of the list (newest first)
//       setMessages(prevMessages => [newMessage, ...prevMessages]);
//       setRefresh(prev => !prev); // Force re-render

//       const response = await axios.post(
//         `${API_BASE_URL}chat/sendMessage/${chatId}`,
//         {
//           senderId: uid,
//           content: reply,
//         },
//       );

//       // Update the temporary message ID with the actual ID from the server
//       setMessages(prevMessages =>
//         prevMessages.map(msg =>
//           msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
//         ),
//       );

//       setRefresh(prev => !prev); // Force another re-render

//       socket.current.emit('sendMessage', {
//         chatId,
//         messageId: response.data.message_id,
//         senderId: uid,
//       });
//     } catch (error) {
//       console.error('Error sending auto-reply:', error);
//     }
//   };

//   // Render each message
//   const renderMessage = ({item}) => {
//     const isSender =
//       (typeof item.senderId === 'string' && item.senderId === uid) || // Check if senderId is a string
//       (typeof item.senderId === 'object' &&
//         item.senderId?._id?.toString() === uid?.toString()); // Check if senderId is an object

//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           isSender ? styles.senderMessage : styles.receiverMessage,
//         ]}>
//         <Text style={styles.messageText}>{item.content}</Text>
//         <Text style={styles.timestamp}>
//           {new Date(item.createdAt).toLocaleTimeString([], {
//             hour: '2-digit',
//             minute: '2-digit',
//           })}
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 60} // Adjust this value as needed
//     >
//       {/* Message List */}
//       <FlatList
//         data={messages} // Messages are already in reverse order (newest first)
//         keyExtractor={item => item._id}
//         renderItem={renderMessage}
//         contentContainerStyle={[
//           styles.messageList,
//           {paddingBottom: keyboardPadding}, // Add dynamic padding at the bottom
//         ]}
//         inverted // Display messages from the bottom
//         extraData={refresh} // Ensures re-rendering when `refresh` changes
//       />
//       {/* Input Area */}
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type a message..."
//           placeholderTextColor="black"
//           value={inputText}
//           onChangeText={setInputText}
//           multiline
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//           <Text style={styles.sendButtonText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   messageList: {
//     padding: 10,
//   },
//   messageContainer: {
//     maxWidth: '80%',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   senderMessage: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#DCF8C6',
//   },
//   receiverMessage: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#fff',
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   timestamp: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 5,
//     alignSelf: 'flex-end',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   input: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#F5F5F5',
//     borderRadius: 20,
//     marginRight: 10,
//     maxHeight: 100,
//     color: '#000000',
//   },
//   sendButton: {
//     padding: 10,
//     backgroundColor: '#0CAF50',
//     borderRadius: 20,
//   },
//   sendButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default Chat;
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import {Text} from 'react-native-paper';
import axios from 'axios';
import {io} from 'socket.io-client';
import * as ImagePicker from 'react-native-image-picker';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

const Chat = ({navigation, route}) => {
  const {uid, chatId, chatAvatar, chatName} = route.params;
  const [messages, setMessages] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [autoReplies, setAutoReplies] = useState([]);
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null); // New state to store selected image

  const socket = useRef(null);
  // const API_BASE_URL = 'http://192.168.215.120:3001/api/';
  // const IMG_BASE_URL = 'http://192.168.215.120:3001';
  let count = 0;
  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/getChat/${chatId}/${uid}/0`,
      );
      setMessages([...response.data.messages].reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch auto-replies
  const fetchAutoReplies = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/getAutoReplies/${uid}/${chatId}`,
      );
      setAutoReplies(response.data);
    } catch (error) {
      console.error('Error fetching auto-replies:', error);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    socket.current = io(`${IMG_BASE_URL}`, {
      transports: ['websocket'],
    });

    socket.current.on(`receiveMessage_${chatId}`, messageId => {
      axios
        .get(`${API_BASE_URL}/chat/getMessage/${messageId}/${uid}`)
        .then(response => {
          setMessages(prevMessages => {
            const messageExists = prevMessages.some(
              msg => msg._id === messageId || msg._id === response.data._id,
            );

            if (messageExists) {
              return prevMessages;
            }

            const autoReply = autoReplies.find(
              ar =>
                ar.message.toLowerCase() ===
                response.data.content.toLowerCase(),
            );

            if (autoReply) {
              sendAutoReply(autoReply.reply);
            }

            return [response.data, ...prevMessages];
          });
        })
        .catch(error => {
          console.error('Error fetching new message:', error);
        });
    });

    return () => {
      socket.current.disconnect();
      setMessages([]);
    };
  }, [chatId, autoReplies]);

  useEffect(() => {
    fetchMessages();
    fetchAutoReplies();
  }, [chatId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      event => {
        setKeyboardPadding(event.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardPadding(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Send message with image or text
  const sendMessage = async () => {
    if (inputText.trim() === '' && !selectedImage) return;

    try {
      const tempId = Date.now().toString();
      const newMessage = {
        _id: tempId,
        content: inputText,
        senderId: uid,
        createdAt: new Date().toISOString(),
        sentByMe: true,
        imageUrl: selectedImage ? selectedImage.uri : null, // Include image URL if available
      };

      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setRefresh(prev => !prev);
      setInputText('');
      setSelectedImage(null);

      const formData = new FormData();
      formData.append('senderId', uid);
      formData.append('content', inputText);
      if (selectedImage) {
        formData.append('attachments', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName,
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/chat/sendMessage/${chatId}`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
        ),
      );

      setRefresh(prev => !prev);

      socket.current.emit('sendMessage', {
        chatId,
        messageId: response.data.message_id,
        senderId: uid,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Send auto-reply message
  const sendAutoReply = async reply => {
    console.log('Triggering Auto-Reply with:', reply);
    try {
      const tempId = Date.now().toString();
      const newMessage = {
        _id: tempId,
        content: reply,
        senderId: uid,
        createdAt: new Date().toISOString(),
        sentByMe: true,
      };

      setMessages(prevMessages => [newMessage, ...prevMessages]);
      setRefresh(prev => !prev);

      const response = await axios.post(
        `${API_BASE_URL}/chat/sendMessage/${chatId}`,
        {senderId: uid, content: reply},
      );

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
        ),
      );

      setRefresh(prev => !prev);

      socket.current.emit('sendMessage', {
        chatId,
        messageId: response.data.message_id,
        senderId: uid,
      });
    } catch (error) {
      console.error('Error sending auto-reply:', error);
    }
  };

  // Handle image selection
  const selectImage = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', quality: 0.8},
      response => {
        if (response.assets && response.assets[0]) {
          setSelectedImage(response.assets[0]);
        }
      },
    );
  };

  // Render each message
  const renderMessage = ({item}) => {
    if (count == 0) console.log('Item console', item);
    count++;
    const isSender =
      (typeof item.senderId === 'string' && item.senderId === uid) ||
      (typeof item.senderId === 'object' &&
        item.senderId?._id?.toString() === uid?.toString());

    // return (
    //   <View
    //     style={[
    //       styles.messageContainer,
    //       isSender ? styles.senderMessage : styles.receiverMessage,
    //     ]}>
    //     {item.imageUrl && (
    //       <>
    //         <Image source={{uri: item.imageUrl}} style={styles.messageImage} />
    //         <Text style={styles.messageText}>{item.content}</Text>
    //         <Text style={styles.timestamp}>
    //           {new Date(item.createdAt).toLocaleTimeString([], {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //           })}
    //         </Text>
    //       </>
    //     )}
    //     {item.attachments != [] && (
    //       <>
    //         <Image
    //           source={{uri: `${IMG_BASE_URL}${item.attachments}`}}
    //           style={styles.messageImage}
    //         />
    //         <Text style={styles.messageText}>{item.content}</Text>
    //         <Text style={styles.timestamp}>
    //           {new Date(item.createdAt).toLocaleTimeString([], {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //           })}
    //         </Text>
    //       </>
    //     )}
    //     {item.imageUrl == [] && item.attachments == [] && (
    //       <>
    //         <Text style={styles.messageText}>{item.content}</Text>
    //         <Text style={styles.timestamp}>
    //           {new Date(item.createdAt).toLocaleTimeString([], {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //           })}
    //         </Text>
    //       </>
    //     )}
    //   </View>
    // );
    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.senderMessage : styles.receiverMessage,
        ]}>
        {/* Render image if imageUrl exists */}
        {item.imageUrl && (
          <Image source={{uri: item.imageUrl}} style={styles.messageImage} />
        )}

        {/* Render attachments if they exist (and no imageUrl) */}
        {!item.imageUrl && item.attachments?.length > 0 && (
          <Image
            source={{uri: `${IMG_BASE_URL}${item.attachments[0]}`}} // Show first attachment
            style={styles.messageImage}
          />
        )}

        {/* Render text content if it exists */}
        {item.content && <Text style={styles.messageText}>{item.content}</Text>}

        {/* Always render timestamp */}
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 60}>
      <FlatList
        data={messages}
        keyExtractor={item => item._id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messageList,
          {paddingBottom: keyboardPadding},
        ]}
        inverted
        extraData={refresh}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="black"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity onPress={selectImage} style={styles.imageButton}>
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#0078FF',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  imageButton: {
    padding: 10,
    marginRight: 10,
  },
  imageButtonText: {
    fontSize: 24,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default Chat;
