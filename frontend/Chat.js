// import React, {useEffect, useState, useRef, useCallback} from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import {Text} from 'react-native-paper';
// import axios from 'axios';
// import {io} from 'socket.io-client';
// import * as ImagePicker from 'react-native-image-picker';
// import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';
// import Icon from 'react-native-vector-icons/Feather';

// const Chat = ({navigation, route}) => {
//   const {uid, chatId, chatAvatar, chatName, participants} = route.params;
//   console.log('---------------------->', participants);
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [autoReplies, setAutoReplies] = useState([]);
//   const [keyboardPadding, setKeyboardPadding] = useState(0);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [page, setPage] = useState(0);

//   const socket = useRef(null);
//   const flatListRef = useRef(null);
//   const messageQueue = useRef([]);

//   // Enhanced message fetching with pagination
//   const fetchMessages = useCallback(
//     async (pageNum = 0, isRefresh = false) => {
//       try {
//         setLoading(!isRefresh);
//         const response = await axios.get(
//           `${API_BASE_URL}/chat/getChat/${chatId}/${uid}/${pageNum}`,
//         );

//         if (response.data?.messages) {
//           const newMessages = response.data.messages.reverse();

//           if (isRefresh) {
//             setMessages(newMessages);
//           } else {
//             setMessages(prev => [...prev, ...newMessages]);
//           }

//           setHasMoreMessages(newMessages.length >= 20);
//           setPage(pageNum);
//         }
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [chatId, uid],
//   );

//   // Initial load and refresh
//   useEffect(() => {
//     fetchMessages();
//     fetchAutoReplies();
//   }, [fetchMessages]);

//   // Socket connection and message handling
//   useEffect(() => {
//     socket.current = io(IMG_BASE_URL, {
//       transports: ['websocket'],
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     const handleNewMessage = async messageId => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/chat/getMessage/${messageId}/${uid}`,
//         );
//         console.log(response.data);
//         if (response.data) {
//           // Check for duplicates before adding
//           setMessages(prev => {
//             if (prev.some(msg => msg._id === response.data._id)) {
//               return prev;
//             }
//             return [response.data, ...prev];
//           });

//           // Check for auto-reply
//           const autoReply = autoReplies.find(
//             ar =>
//               ar.message.toLowerCase() === response.data.content.toLowerCase(),
//           );
//           if (autoReply) {
//             sendAutoReply(autoReply.reply);
//           }
//         }
//       } catch (error) {
//         console.error('Error handling new message:', error);
//       }
//     };

//     socket.current.on(`receiveMessage_${chatId}`, handleNewMessage);

//     return () => {
//       socket.current.off(`receiveMessage_${chatId}`, handleNewMessage);
//       socket.current.disconnect();
//     };
//   }, [chatId, uid, autoReplies]);

//   // Keyboard handling
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       event => {
//         setKeyboardPadding(event.endCoordinates.height);
//       },
//     );

//     const keyboardDidHideListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardPadding(0);
//       },
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Fetch auto-replies
//   const fetchAutoReplies = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/chat/getAutoReplies/${uid}/${chatId}`,
//       );
//       setAutoReplies(response.data || []);
//     } catch (error) {
//       console.error('Error fetching auto-replies:', error);
//     }
//   };

//   // Send message with image or text
//   const sendMessage = async () => {
//     if (inputText.trim() === '' && !selectedImage) return;

//     try {
//       const tempId = Date.now().toString();
//       const newMessage = {
//         _id: tempId,
//         content: inputText,
//         senderId: uid,
//         createdAt: new Date().toISOString(),
//         sentByMe: true,
//         imageUrl: selectedImage ? selectedImage.uri : null,
//       };

//       // Optimistic update
//       setMessages(prev => [newMessage, ...prev]);
//       setInputText('');
//       setSelectedImage(null);

//       const formData = new FormData();
//       formData.append('senderId', uid);
//       formData.append('content', inputText);
//       if (selectedImage) {
//         formData.append('attachments', {
//           uri: selectedImage.uri,
//           type: selectedImage.type,
//           name: selectedImage.fileName,
//         });
//       }

//       const response = await axios.post(
//         `${API_BASE_URL}/chat/sendMessage/${chatId}`,
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       // Replace temp ID with real ID
//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
//         ),
//       );

//       socket.current.emit('sendMessage', {
//         chatId,
//         messageId: response.data.message_id,
//         senderId: uid,
//       });
//     } catch (error) {
//       console.error('Error sending message:', error);
//       // Rollback optimistic update on error
//       setMessages(prev => prev.filter(msg => msg._id !== tempId));
//     }
//   };

//   // Send auto-reply
//   const sendAutoReply = async reply => {
//     try {
//       const tempId = Date.now().toString();
//       const newMessage = {
//         _id: tempId,
//         content: reply,
//         senderId: uid,
//         createdAt: new Date().toISOString(),
//         sentByMe: true,
//       };

//       setMessages(prev => [newMessage, ...prev]);

//       const response = await axios.post(
//         `${API_BASE_URL}/chat/sendMessage/${chatId}`,
//         {senderId: uid, content: reply},
//       );

//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
//         ),
//       );

//       socket.current.emit('sendMessage', {
//         chatId,
//         messageId: response.data.message_id,
//         senderId: uid,
//       });
//     } catch (error) {
//       console.error('Error sending auto-reply:', error);
//     }
//   };

//   // Image selection
//   const selectImage = () => {
//     ImagePicker.launchImageLibrary(
//       {
//         mediaType: 'photo',
//         quality: 0.8,
//         includeBase64: false,
//       },
//       response => {
//         if (!response.didCancel && !response.error && response.assets?.[0]) {
//           setSelectedImage(response.assets[0]);
//         }
//       },
//     );
//   };

//   // Load more messages when scrolling
//   const loadMoreMessages = () => {
//     if (!loading && hasMoreMessages) {
//       fetchMessages(page + 1);
//     }
//   };

//   // Refresh messages
//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchMessages(0, true);
//   };

//   // Render each message
//   const renderMessage = ({item}) => {
//     const isSender =
//       item.senderId === uid ||
//       (typeof item.senderId === 'object' && item.senderId._id === uid);

//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           isSender ? styles.senderMessage : styles.receiverMessage,
//         ]}>
//         {/* Render image if available */}
//         {item.imageUrl && (
//           <Image
//             source={{uri: item.imageUrl}}
//             style={styles.messageImage}
//             resizeMode="cover"
//           />
//         )}

//         {/* Render attachments if available */}
//         {!item.imageUrl && item.attachments?.length > 0 && (
//           <Image
//             source={{uri: `${IMG_BASE_URL}${item.attachments[0]}`}}
//             style={styles.messageImage}
//             resizeMode="cover"
//           />
//         )}

//         {/* Render text content */}
//         {item.content && <Text style={styles.messageText}>{item.content}</Text>}

//         {/* Timestamp */}
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
//     <View style={styles.container}>
//       {loading && messages.length === 0 ? (
//         <ActivityIndicator size="large" style={styles.loader} />
//       ) : (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={{flex: 1}}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={item => item._id}
//             renderItem={renderMessage}
//             contentContainerStyle={[
//               styles.messageList,
//               {paddingBottom: keyboardPadding},
//             ]}
//             inverted
//             onEndReached={loadMoreMessages}
//             onEndReachedThreshold={0.5}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//             ListFooterComponent={
//               loading && messages.length > 0 ? (
//                 <ActivityIndicator size="small" />
//               ) : null
//             }
//           />

//           <View style={styles.inputContainer}>
//             <TouchableOpacity onPress={selectImage} style={styles.imageButton}>
//               <Icon name="camera" size={20} color="#FFFFFF" />
//             </TouchableOpacity>

//             <TextInput
//               style={styles.input}
//               placeholder="Type a message..."
//               placeholderTextColor="#666"
//               value={inputText}
//               onChangeText={setInputText}
//               multiline
//             />

//             <TouchableOpacity
//               style={styles.sendButton}
//               onPress={sendMessage}
//               disabled={inputText.trim() === '' && !selectedImage}>
//               <Text style={styles.sendButtonText}>Send</Text>
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
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
//     color: '#000',
//   },
//   messageImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   timestamp: {
//     fontSize: 10,
//     color: '#888',
//     marginTop: 5,
//     alignSelf: 'flex-end',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#FFF',
//     borderTopWidth: 1,
//     borderTopColor: '#ECECEC',
//   },
//   input: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#ECECEC',
//     borderRadius: 20,
//     color: '#000',
//     maxHeight: 100,
//   },
//   sendButton: {
//     backgroundColor: '#14AE5C',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   sendButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   imageButton: {
//     backgroundColor: '#14AE5C',
//     padding: 10,
//     borderRadius: 20,
//     marginRight: 10,
//   },
// });

// export default Chat;
// import React, {useEffect, useState, useRef, useCallback} from 'react';
// import {
//   View,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import {Text} from 'react-native-paper';
// import axios from 'axios';
// import {io} from 'socket.io-client';
// import * as ImagePicker from 'react-native-image-picker';
// import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';
// import Icon from 'react-native-vector-icons/Feather';

// const Chat = ({navigation, route}) => {
//   const {uid, chatId, chatAvatar, chatName, participants} = route.params;
//   console.log('---------------------->', participants);
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [autoReplies, setAutoReplies] = useState([]);
//   const [keyboardPadding, setKeyboardPadding] = useState(0);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [page, setPage] = useState(0);
//   const [senderDataCache, setSenderDataCache] = useState({});

//   const socket = useRef(null);
//   const flatListRef = useRef(null);
//   const messageQueue = useRef([]);

//   // Fetch sender data and cache it
//   const fetchSenderData = async senderId => {
//     try {
//       // Check cache first
//       if (senderDataCache[senderId]) {
//         return senderDataCache[senderId];
//       }

//       const response = await axios.get(
//         `${API_BASE_URL}/user/getUserData/${senderId}`,
//       );
//       const senderData = response.data;

//       // Update cache
//       setSenderDataCache(prev => ({
//         ...prev,
//         [senderId]: senderData,
//       }));

//       return senderData;
//     } catch (error) {
//       console.error('Error fetching sender data:', error);
//       return {
//         name: 'Unknown',
//         imgUrl: null,
//       };
//     }
//   };

//   // Enhanced message fetching with pagination
//   const fetchMessages = useCallback(
//     async (pageNum = 0, isRefresh = false) => {
//       try {
//         setLoading(!isRefresh);
//         const response = await axios.get(
//           `${API_BASE_URL}/chat/getChat/${chatId}/${uid}/${pageNum}`,
//         );

//         if (response.data?.messages) {
//           const newMessages = response.data.messages.reverse();

//           // Fetch sender data for each new message
//           const messagesWithSenders = await Promise.all(
//             newMessages.map(async msg => {
//               let senderId = msg.senderId;
//               if (typeof senderId === 'object') {
//                 senderId = senderId._id;
//               }

//               const senderData = await fetchSenderData(senderId);
//               return {
//                 ...msg,
//                 senderData,
//               };
//             }),
//           );

//           if (isRefresh) {
//             setMessages(messagesWithSenders);
//           } else {
//             setMessages(prev => [...prev, ...messagesWithSenders]);
//           }

//           setHasMoreMessages(newMessages.length >= 20);
//           setPage(pageNum);
//         }
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     [chatId, uid, senderDataCache],
//   );

//   // Initial load and refresh
//   useEffect(() => {
//     fetchMessages();
//     fetchAutoReplies();
//   }, [fetchMessages]);

//   // Socket connection and message handling
//   useEffect(() => {
//     socket.current = io(IMG_BASE_URL, {
//       transports: ['websocket'],
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     const handleNewMessage = async messageId => {
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/chat/getMessage/${messageId}/${uid}`,
//         );

//         if (response.data) {
//           // Get sender data
//           let senderId = response.data.senderId;
//           if (typeof senderId === 'object') {
//             senderId = senderId._id;
//           }
//           const senderData = await fetchSenderData(senderId);

//           const newMessage = {
//             ...response.data,
//             senderData,
//           };

//           // Check for duplicates before adding
//           setMessages(prev => {
//             if (prev.some(msg => msg._id === newMessage._id)) {
//               return prev;
//             }
//             return [newMessage, ...prev];
//           });

//           // Check for auto-reply
//           const autoReply = autoReplies.find(
//             ar => ar.message.toLowerCase() === newMessage.content.toLowerCase(),
//           );
//           if (autoReply) {
//             sendAutoReply(autoReply.reply);
//           }
//         }
//       } catch (error) {
//         console.error('Error handling new message:', error);
//       }
//     };

//     socket.current.on(`receiveMessage_${chatId}`, handleNewMessage);

//     return () => {
//       socket.current.off(`receiveMessage_${chatId}`, handleNewMessage);
//       socket.current.disconnect();
//     };
//   }, [chatId, uid, autoReplies, senderDataCache]);

//   // Keyboard handling
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       event => {
//         setKeyboardPadding(event.endCoordinates.height);
//       },
//     );

//     const keyboardDidHideListener = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => {
//         setKeyboardPadding(0);
//       },
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Fetch auto-replies
//   const fetchAutoReplies = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/chat/getAutoReplies/${uid}/${chatId}`,
//       );
//       setAutoReplies(response.data || []);
//     } catch (error) {
//       console.error('Error fetching auto-replies:', error);
//     }
//   };

//   // Send message with image or text
//   const sendMessage = async () => {
//     if (inputText.trim() === '' && !selectedImage) return;

//     try {
//       const tempId = Date.now().toString();
//       const newMessage = {
//         _id: tempId,
//         content: inputText,
//         senderId: uid,
//         createdAt: new Date().toISOString(),
//         sentByMe: true,
//         imageUrl: selectedImage ? selectedImage.uri : null,
//         senderData: senderDataCache[uid] || {name: 'You', imgUrl: null},
//       };

//       // Optimistic update
//       setMessages(prev => [newMessage, ...prev]);
//       setInputText('');
//       setSelectedImage(null);

//       const formData = new FormData();
//       formData.append('senderId', uid);
//       formData.append('content', inputText);
//       if (selectedImage) {
//         formData.append('attachments', {
//           uri: selectedImage.uri,
//           type: selectedImage.type,
//           name: selectedImage.fileName,
//         });
//       }

//       const response = await axios.post(
//         `${API_BASE_URL}/chat/sendMessage/${chatId}`,
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       // Replace temp ID with real ID
//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
//         ),
//       );

//       socket.current.emit('sendMessage', {
//         chatId,
//         messageId: response.data.message_id,
//         senderId: uid,
//       });
//     } catch (error) {
//       console.error('Error sending message:', error);
//       // Rollback optimistic update on error
//       setMessages(prev => prev.filter(msg => msg._id !== tempId));
//     }
//   };

//   // Send auto-reply
//   const sendAutoReply = async reply => {
//     try {
//       const tempId = Date.now().toString();
//       const newMessage = {
//         _id: tempId,
//         content: reply,
//         senderId: uid,
//         createdAt: new Date().toISOString(),
//         sentByMe: true,
//         senderData: senderDataCache[uid] || {name: 'You', imgUrl: null},
//       };

//       setMessages(prev => [newMessage, ...prev]);

//       const response = await axios.post(
//         `${API_BASE_URL}/chat/sendMessage/${chatId}`,
//         {senderId: uid, content: reply},
//       );

//       setMessages(prev =>
//         prev.map(msg =>
//           msg._id === tempId ? {...msg, _id: response.data.message_id} : msg,
//         ),
//       );

//       socket.current.emit('sendMessage', {
//         chatId,
//         messageId: response.data.message_id,
//         senderId: uid,
//       });
//     } catch (error) {
//       console.error('Error sending auto-reply:', error);
//     }
//   };

//   // Image selection
//   const selectImage = () => {
//     ImagePicker.launchImageLibrary(
//       {
//         mediaType: 'photo',
//         quality: 0.8,
//         includeBase64: false,
//       },
//       response => {
//         if (!response.didCancel && !response.error && response.assets?.[0]) {
//           setSelectedImage(response.assets[0]);
//         }
//       },
//     );
//   };

//   // Load more messages when scrolling
//   const loadMoreMessages = () => {
//     if (!loading && hasMoreMessages) {
//       fetchMessages(page + 1);
//     }
//   };

//   // Refresh messages
//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchMessages(0, true);
//   };

//   // Render each message
//   const renderMessage = ({item}) => {
//     const isSender =
//       item.senderId === uid ||
//       (typeof item.senderId === 'object' && item.senderId._id === uid);

//     return (
//       <View
//         style={[
//           styles.messageWrapper,
//           isSender ? styles.senderWrapper : styles.receiverWrapper,
//         ]}>
//         {!isSender && item.senderData?.imgUrl && (
//           <Image
//             source={{uri: `${IMG_BASE_URL}${item.senderData.imgUrl}`}}
//             style={styles.avatar}
//           />
//         )}

//         <View style={styles.messageContentWrapper}>
//           {!isSender && (
//             <Text style={styles.senderName}>
//               {item.senderData?.name || 'Unknown'}
//             </Text>
//           )}

//           <View
//             style={[
//               styles.messageContainer,
//               isSender ? styles.senderMessage : styles.receiverMessage,
//             ]}>
//             {/* Render image if available */}
//             {item.imageUrl && (
//               <Image
//                 source={{uri: item.imageUrl}}
//                 style={styles.messageImage}
//                 resizeMode="cover"
//               />
//             )}

//             {/* Render attachments if available */}
//             {!item.imageUrl && item.attachments?.length > 0 && (
//               <Image
//                 source={{uri: `${IMG_BASE_URL}${item.attachments[0]}`}}
//                 style={styles.messageImage}
//                 resizeMode="cover"
//               />
//             )}

//             {/* Render text content */}
//             {item.content && (
//               <Text style={styles.messageText}>{item.content}</Text>
//             )}

//             {/* Timestamp */}
//             <Text style={styles.timestamp}>
//               {new Date(item.createdAt).toLocaleTimeString([], {
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })}
//             </Text>
//           </View>
//         </View>

//         {isSender && item.senderData?.imgUrl && (
//           <Image
//             source={{uri: `${IMG_BASE_URL}${item.senderData.imgUrl}`}}
//             style={styles.avatar}
//           />
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {loading && messages.length === 0 ? (
//         <ActivityIndicator size="large" style={styles.loader} />
//       ) : (
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={{flex: 1}}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={item => item._id}
//             renderItem={renderMessage}
//             contentContainerStyle={[
//               styles.messageList,
//               {paddingBottom: keyboardPadding},
//             ]}
//             inverted
//             onEndReached={loadMoreMessages}
//             onEndReachedThreshold={0.5}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//             ListFooterComponent={
//               loading && messages.length > 0 ? (
//                 <ActivityIndicator size="small" />
//               ) : null
//             }
//           />

//           <View style={styles.inputContainer}>
//             <TouchableOpacity onPress={selectImage} style={styles.imageButton}>
//               <Icon name="camera" size={20} color="#FFFFFF" />
//             </TouchableOpacity>

//             <TextInput
//               style={styles.input}
//               placeholder="Type a message..."
//               placeholderTextColor="#666"
//               value={inputText}
//               onChangeText={setInputText}
//               multiline
//             />

//             <TouchableOpacity
//               style={styles.sendButton}
//               onPress={sendMessage}
//               disabled={inputText.trim() === '' && !selectedImage}>
//               <Text style={styles.sendButtonText}>Send</Text>
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   messageList: {
//     padding: 10,
//   },
//   messageWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     marginBottom: 10,
//   },
//   senderWrapper: {
//     justifyContent: 'flex-end',
//   },
//   receiverWrapper: {
//     justifyContent: 'flex-start',
//   },
//   messageContentWrapper: {
//     maxWidth: '80%',
//     marginHorizontal: 5,
//   },
//   senderName: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 2,
//     marginLeft: 5,
//   },
//   avatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   messageContainer: {
//     padding: 10,
//     borderRadius: 10,
//   },
//   senderMessage: {
//     backgroundColor: '#DCF8C6',
//     alignSelf: 'flex-end',
//   },
//   receiverMessage: {
//     backgroundColor: '#fff',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#000',
//   },
//   messageImage: {
//     width: 200,
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   timestamp: {
//     fontSize: 10,
//     color: '#888',
//     marginTop: 5,
//     alignSelf: 'flex-end',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#FFF',
//     borderTopWidth: 1,
//     borderTopColor: '#ECECEC',
//   },
//   input: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#ECECEC',
//     borderRadius: 20,
//     color: '#000',
//     maxHeight: 100,
//   },
//   sendButton: {
//     backgroundColor: '#14AE5C',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   sendButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   imageButton: {
//     backgroundColor: '#14AE5C',
//     padding: 10,
//     borderRadius: 20,
//     marginRight: 10,
//   },
// });

// export default Chat;

import React, {useEffect, useState, useRef, useCallback} from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Text} from 'react-native-paper';
import axios from 'axios';
import {io} from 'socket.io-client';
import * as ImagePicker from 'react-native-image-picker';
import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';
import Icon from 'react-native-vector-icons/Feather';

const Chat = ({navigation, route}) => {
  const {uid, chatId, chatAvatar, chatName, participants} = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoReplies, setAutoReplies] = useState([]);
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [page, setPage] = useState(0);

  // Use ref for senderDataCache to avoid dependency issues
  const senderDataCache = useRef({});
  const pendingUserRequests = useRef({});

  const socket = useRef(null);
  const flatListRef = useRef(null);
  const messageQueue = useRef([]);

  // Fetch sender data with caching and request deduplication
  const fetchSenderData = useCallback(async senderId => {
    // Return cached data if available
    if (senderDataCache.current[senderId]) {
      return senderDataCache.current[senderId];
    }

    // If request already in progress, return its promise
    if (pendingUserRequests.current[senderId]) {
      return pendingUserRequests.current[senderId];
    }

    try {
      // Create a new promise for this request
      const requestPromise = axios
        .get(`${API_BASE_URL}/user/getUserData/${senderId}`)
        .then(response => {
          const senderData = response.data;
          // Update cache
          senderDataCache.current = {
            ...senderDataCache.current,
            [senderId]: senderData,
          };
          return senderData;
        })
        .finally(() => {
          // Clean up pending request
          delete pendingUserRequests.current[senderId];
        });

      // Store the promise
      pendingUserRequests.current[senderId] = requestPromise;

      return await requestPromise;
    } catch (error) {
      console.error('Error fetching sender data:', error);
      // Return default data and cache it
      const defaultData = {
        name: 'Unknown',
        imgUrl: null,
      };
      senderDataCache.current = {
        ...senderDataCache.current,
        [senderId]: defaultData,
      };
      return defaultData;
    }
  }, []);

  // Enhanced message fetching with pagination
  const fetchMessages = useCallback(
    async (pageNum = 0, isRefresh = false) => {
      try {
        setLoading(!isRefresh);
        const response = await axios.get(
          `${API_BASE_URL}/chat/getChat/${chatId}/${uid}/${pageNum}`,
        );

        if (response.data?.messages) {
          const newMessages = response.data.messages.reverse();

          // Process messages in batches to avoid overwhelming the app
          const batchSize = 10;
          const processedMessages = [];

          for (let i = 0; i < newMessages.length; i += batchSize) {
            const batch = newMessages.slice(i, i + batchSize);
            const processedBatch = await Promise.all(
              batch.map(async msg => {
                let senderId = msg.senderId;
                if (typeof senderId === 'object') {
                  senderId = senderId._id;
                }

                // Only fetch sender data if we don't have it already
                const cachedData = senderDataCache.current[senderId];
                const senderData =
                  cachedData || (await fetchSenderData(senderId));

                return {
                  ...msg,
                  // Use a composite key to ensure uniqueness
                  uniqueKey: `${msg._id}_${senderId}`,
                  senderData,
                };
              }),
            );
            processedMessages.push(...processedBatch);
          }

          if (isRefresh) {
            setMessages(processedMessages);
          } else {
            setMessages(prev => [...processedMessages, ...prev]);
          }

          setHasMoreMessages(newMessages.length >= 20);
          setPage(pageNum);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [chatId, uid, fetchSenderData],
  );

  // Initial load and refresh
  useEffect(() => {
    fetchMessages();
    fetchAutoReplies();
  }, [fetchMessages]);

  // Socket connection and message handling
  useEffect(() => {
    socket.current = io(IMG_BASE_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const handleNewMessage = async messageId => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chat/getMessage/${messageId}/${uid}`,
        );

        if (response.data) {
          // Get sender data
          let senderId = response.data.senderId;
          if (typeof senderId === 'object') {
            senderId = senderId._id;
          }

          const cachedData = senderDataCache.current[senderId];
          const senderData = cachedData || (await fetchSenderData(senderId));

          const newMessage = {
            ...response.data,
            // Use a composite key to ensure uniqueness
            uniqueKey: `${response.data._id}_${senderId}`,
            senderData,
          };

          // Check for duplicates before adding
          setMessages(prev => {
            if (prev.some(msg => msg.uniqueKey === newMessage.uniqueKey)) {
              return prev;
            }
            return [newMessage, ...prev];
          });

          // Check for auto-reply
          const autoReply = autoReplies.find(
            ar => ar.message.toLowerCase() === newMessage.content.toLowerCase(),
          );
          if (autoReply) {
            sendAutoReply(autoReply.reply);
          }
        }
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    socket.current.on(`receiveMessage_${chatId}`, handleNewMessage);

    return () => {
      socket.current.off(`receiveMessage_${chatId}`, handleNewMessage);
      socket.current.disconnect();
    };
  }, [chatId, uid, autoReplies, fetchSenderData]);

  // Keyboard handling
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

  // Fetch auto-replies
  // const fetchAutoReplies = async () => {
  //   console.log('we inside fetchAutoReplies');
  //   try {
  //     const response = await axios.get(
  //       `${API_BASE_URL}/chat/getAutoReplies/${uid}/${chatId}`,
  //     );
  //     console.log(`we got response for ${uid} ${chatId}`, response.data);
  //     setAutoReplies(response.data || []);
  //   } catch (error) {
  //     console.error('Error fetching auto-replies:', error);
  //   }
  // };
  // Fetch auto-replies from the other participant
  const fetchAutoReplies = async () => {
    try {
      // First get the other participant's ID
      const participantResponse = await axios.get(
        `${API_BASE_URL}/chat/getChatParticipant/${chatId}/${uid}`,
      );

      const otherParticipantId = participantResponse.data.participantId;

      if (!otherParticipantId) {
        console.log('No other participant found for auto-replies');
        return;
      }

      // Now get the auto-replies from the other participant
      const response = await axios.get(
        `${API_BASE_URL}/chat/getAutoReplies/${otherParticipantId}/${chatId}`,
      );

      setAutoReplies(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching auto-replies:', error);
      // If there's an error, set empty array to avoid issues
      setAutoReplies([]);
    }
  };

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
        imageUrl: selectedImage ? selectedImage.uri : null,
        senderData: senderDataCache.current[uid] || {name: 'You', imgUrl: null},
        // Use a composite key to ensure uniqueness
        uniqueKey: `${tempId}_${uid}`,
      };

      // Optimistic update
      setMessages(prev => [newMessage, ...prev]);
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

      // Replace temp ID with real ID
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId
            ? {
                ...msg,
                _id: response.data.message_id,
                uniqueKey: `${response.data.message_id}_${uid}`,
              }
            : msg,
        ),
      );

      socket.current.emit('sendMessage', {
        chatId,
        messageId: response.data.message_id,
        senderId: uid,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Rollback optimistic update on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    }
  };

  // Send auto-reply
  const sendAutoReply = async reply => {
    try {
      const tempId = Date.now().toString();
      const newMessage = {
        _id: tempId,
        content: reply,
        senderId: uid,
        createdAt: new Date().toISOString(),
        sentByMe: true,
        senderData: senderDataCache.current[uid] || {name: 'You', imgUrl: null},
        // Use a composite key to ensure uniqueness
        uniqueKey: `${tempId}_${uid}`,
      };

      setMessages(prev => [newMessage, ...prev]);

      const response = await axios.post(
        `${API_BASE_URL}/chat/sendMessage/${chatId}`,
        {senderId: uid, content: reply},
      );

      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId
            ? {
                ...msg,
                _id: response.data.message_id,
                uniqueKey: `${response.data.message_id}_${uid}`,
              }
            : msg,
        ),
      );

      socket.current.emit('sendMessage', {
        chatId,
        messageId: response.data.message_id,
        senderId: uid,
      });
    } catch (error) {
      console.error('Error sending auto-reply:', error);
    }
  };

  // Image selection
  const selectImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (!response.didCancel && !response.error && response.assets?.[0]) {
          setSelectedImage(response.assets[0]);
        }
      },
    );
  };

  // Load more messages when scrolling
  const loadMoreMessages = () => {
    if (!loading && hasMoreMessages) {
      fetchMessages(page + 1);
    }
  };

  // Refresh messages
  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages(0, true);
  };

  // Render each message
  const renderMessage = ({item}) => {
    const isSender =
      item.senderId === uid ||
      (typeof item.senderId === 'object' && item.senderId._id === uid);

    return (
      <View
        style={[
          styles.messageWrapper,
          isSender ? styles.senderWrapper : styles.receiverWrapper,
        ]}>
        {!isSender && item.senderData?.imgUrl && (
          <Image
            source={{uri: `${IMG_BASE_URL}${item.senderData.imgUrl}`}}
            style={styles.avatar}
          />
        )}

        <View style={styles.messageContentWrapper}>
          {!isSender && (
            <Text style={styles.senderName}>
              {item.senderData?.name || 'Unknown'}
            </Text>
          )}

          <View
            style={[
              styles.messageContainer,
              isSender ? styles.senderMessage : styles.receiverMessage,
            ]}>
            {/* Render image if available */}
            {item.imageUrl && (
              <Image
                source={{uri: item.imageUrl}}
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}

            {/* Render attachments if available */}
            {!item.imageUrl && item.attachments?.length > 0 && (
              <Image
                source={{uri: `${IMG_BASE_URL}${item.attachments[0]}`}}
                style={styles.messageImage}
                resizeMode="cover"
              />
            )}

            {/* Render text content */}
            {item.content && (
              <Text style={styles.messageText}>{item.content}</Text>
            )}

            {/* Timestamp */}
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {isSender && item.senderData?.imgUrl && (
          <Image
            source={{uri: `${IMG_BASE_URL}${item.senderData.imgUrl}`}}
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && messages.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.uniqueKey} // Use the composite key
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messageList,
              {paddingBottom: keyboardPadding},
            ]}
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              loading && messages.length > 0 ? (
                <ActivityIndicator size="small" />
              ) : null
            }
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={selectImage} style={styles.imageButton}>
              <Icon name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={inputText.trim() === '' && !selectedImage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 10,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  senderWrapper: {
    justifyContent: 'flex-end',
  },
  receiverWrapper: {
    justifyContent: 'flex-start',
  },
  messageContentWrapper: {
    maxWidth: '80%',
    marginHorizontal: 5,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginLeft: 5,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
  },
  senderMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  receiverMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    color: '#000',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#14AE5C',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#14AE5C',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
});

export default Chat;
