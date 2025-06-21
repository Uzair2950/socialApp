// import React, {useEffect, useState, useRef} from 'react';
// import {
//   View,
//   FlatList,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   Text,
//   RefreshControl,
// } from 'react-native';
// import axios from 'axios';
// import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';

// const VipCollectionChat = ({route}) => {
//   const {collectionId, personName, personId} = route.params;
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [groupMessages, setGroupMessages] = useState([]);
//   const flatListRef = useRef(null);

//   // Fetch VIP collection messages
//   const fetchVipMessages = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/user/getVipChat/${collectionId}`,
//       );
//       return response.data.messages.reverse(); // Reverse to show newest first
//     } catch (error) {
//       console.error('Error fetching VIP messages:', error);
//       return [];
//     }
//   };

//   // Fetch all groups where the VIP member participates
//   const fetchGroupsWithMember = async () => {
//     try {
//       // Get all chats the VIP member is part of
//       const chatsResponse = await axios.get(
//         `${API_BASE_URL}/chat/getChats_short/${personId}`,
//       );

//       // Filter only group chats
//       const groupChats = chatsResponse.data.filter(chat => chat.isGroup);

//       // Get messages from each group chat
//       const allGroupMessages = [];

//       for (const groupChat of groupChats) {
//         try {
//           // Get group details
//           const groupResponse = await axios.get(
//             `${API_BASE_URL}/chatgroup/getGroupByChatId/${groupChat._id}`,
//           );

//           // Get group chat messages
//           const chatResponse = await axios.get(
//             `${API_BASE_URL}/chatgroup/getGroupChat/${groupResponse.data._id}/${personId}`,
//           );

//           // Get group members to verify the VIP is still a member
//           const membersResponse = await axios.get(
//             `${API_BASE_URL}/chatgroup/getMembers/${groupResponse.data._id}`,
//           );

//           // Check if VIP is still in the group
//           const isStillMember = membersResponse.data.some(
//             member => member.id === personId,
//           );

//           if (isStillMember && chatResponse.data.chat?.messages) {
//             // Process messages with sender info
//             const processedMessages = await Promise.all(
//               chatResponse.data.chat.messages.map(async msg => {
//                 // Get full message details
//                 const messageResponse = await axios.get(
//                   `${API_BASE_URL}/chat/getMessage/${msg._id}/${personId}`,
//                 );
//                 console.log(
//                   '------------------------> These are messages',
//                   messageResponse.data,
//                 );
//                 if (messageResponse.data.senderId._id == personId) {
//                   console.log('Correcto presto marto');
//                   return {
//                     ...messageResponse.data,
//                     isGroupMessage: true,
//                     groupName: groupResponse.data.name,
//                     groupImg: groupResponse.data.imgUrl,
//                   };
//                 } else {
//                   console.log('NOOOOOOOO');
//                 }
//                 return {};
//               }),
//             );

//             allGroupMessages.push(...processedMessages);
//           }
//         } catch (error) {
//           console.error(`Error processing group ${groupChat._id}:`, error);
//         }
//       }

//       return allGroupMessages;
//     } catch (error) {
//       console.error('Error fetching group messages:', error);
//       return [];
//     }
//   };

//   const loadMessages = async () => {
//     try {
//       setLoading(true);
//       const [vipMessages, groupMsgs] = await Promise.all([
//         fetchVipMessages(),
//         fetchGroupsWithMember(),
//       ]);

//       // Combine and sort all messages by date
//       const allMessages = [...vipMessages, ...groupMsgs].sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
//       );

//       setMessages(allMessages);
//     } catch (error) {
//       console.error('Error loading messages:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     loadMessages();
//   };

//   useEffect(() => {
//     loadMessages();
//   }, []);

//   const renderMessage = ({item}) => (
//     <View style={styles.messageContainer}>
//       {item.isGroupMessage && (
//         <View style={styles.groupHeader}>
//           <Image
//             source={
//               item.groupImg
//                 ? {uri: `${IMG_BASE_URL}${item.groupImg}`}
//                 : require('../Images/noProfile.jpeg')
//             }
//             style={styles.groupAvatar}
//           />
//           <Text style={styles.groupName}>{item.groupName}</Text>
//         </View>
//       )}

//       {item.attachments?.length > 0 && (
//         <Image
//           source={{uri: `${IMG_BASE_URL}${item.attachments[0]}`}}
//           style={styles.messageImage}
//           resizeMode="cover"
//         />
//       )}

//       {item.content && <Text style={styles.messageText}>{item.content}</Text>}

//       <View style={styles.messageFooter}>
//         {item.senderId?.name && (
//           <Text style={styles.senderName}>{item.senderId.name}</Text>
//         )}
//         <Text style={styles.timestamp}>
//           {new Date(item.createdAt).toLocaleString()}
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <ActivityIndicator size="large" style={styles.loader} />
//       ) : (
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderMessage}
//           keyExtractor={item =>
//             `${item._id}_${item.isGroupMessage ? 'group' : 'vip'}`
//           }
//           contentContainerStyle={styles.messageList}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No messages found</Text>
//           }
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   messageList: {
//     padding: 16,
//   },
//   messageContainer: {
//     backgroundColor: '#f0f0f0',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   groupHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   groupAvatar: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     marginRight: 8,
//   },
//   groupName: {
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 8,
//   },
//   messageImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   messageFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   senderName: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//   },
//   timestamp: {
//     fontSize: 12,
//     color: '#666',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#666',
//   },
// });

// export default VipCollectionChat;
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';

const VipCollectionChat = ({route}) => {
  const {collectionId, personName, personId} = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupMessages, setGroupMessages] = useState([]);
  const flatListRef = useRef(null);

  // Fetch VIP collection messages
  const fetchVipMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/getVipChat/${collectionId}`,
      );
      return response.data.messages.reverse(); // Reverse to show newest first
    } catch (error) {
      console.error('Error fetching VIP messages:', error);
      return [];
    }
  };

  // Fetch all groups where the VIP member participates
  const fetchGroupsWithMember = async () => {
    try {
      // Get all chats the VIP member is part of
      const chatsResponse = await axios.get(
        `${API_BASE_URL}/chat/getChats_short/${personId}`,
      );

      // Filter only group chats
      const groupChats = chatsResponse.data.filter(chat => chat.isGroup);

      // Get messages from each group chat
      const allGroupMessages = [];

      for (const groupChat of groupChats) {
        try {
          // Get group details
          const groupResponse = await axios.get(
            `${API_BASE_URL}/chatgroup/getGroupByChatId/${groupChat._id}`,
          );

          // Get group chat messages
          const chatResponse = await axios.get(
            `${API_BASE_URL}/chatgroup/getGroupChat/${groupResponse.data._id}/${personId}`,
          );

          // Get group members to verify the VIP is still a member
          const membersResponse = await axios.get(
            `${API_BASE_URL}/chatgroup/getMembers/${groupResponse.data._id}`,
          );

          // Check if VIP is still in the group
          const isStillMember = membersResponse.data.some(
            member => member.id === personId,
          );

          if (isStillMember && chatResponse.data.chat?.messages) {
            // Process messages with sender info
            const processedMessages = await Promise.all(
              chatResponse.data.chat.messages.map(async msg => {
                // Get full message details
                const messageResponse = await axios.get(
                  `${API_BASE_URL}/chat/getMessage/${msg._id}/${personId}`,
                );
                console.log(
                  '------------------------> These are messages',
                  messageResponse.data,
                );
                if (messageResponse.data.senderId._id == personId) {
                  console.log('Correcto presto marto');
                  return {
                    ...messageResponse.data,
                    isGroupMessage: true,
                    groupName: groupResponse.data.name,
                    groupImg: groupResponse.data.imgUrl,
                  };
                } else {
                  console.log('NOOOOOOOO');
                  return null; // Changed from {} to null
                }
              }),
            );

            // Filter out null values before pushing
            allGroupMessages.push(
              ...processedMessages.filter(msg => msg !== null),
            );
          }
        } catch (error) {
          console.error(`Error processing group ${groupChat._id}:`, error);
        }
      }

      return allGroupMessages;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const [vipMessages, groupMsgs] = await Promise.all([
        fetchVipMessages(),
        fetchGroupsWithMember(),
      ]);

      // Combine and sort all messages by date
      const allMessages = [...vipMessages, ...groupMsgs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const renderMessage = ({item}) => {
    // Skip rendering if item is null or empty
    if (!item || Object.keys(item).length === 0) {
      return null;
    }

    return (
      <View style={styles.messageContainer}>
        {item.isGroupMessage && (
          <View style={styles.groupHeader}>
            <Image
              source={
                item.groupImg
                  ? {uri: `${IMG_BASE_URL}${item.groupImg}`}
                  : require('../Images/noProfile.jpeg')
              }
              style={styles.groupAvatar}
            />
            <Text style={styles.groupName}>{item.groupName}</Text>
          </View>
        )}

        {item.attachments?.length > 0 && (
          <Image
            source={{uri: `${IMG_BASE_URL}${item.attachments[0]}`}}
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}

        {item.content && <Text style={styles.messageText}>{item.content}</Text>}

        <View style={styles.messageFooter}>
          {item.senderId?.name && (
            <Text style={styles.senderName}>{item.senderId.name}</Text>
          )}
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item =>
            `${item._id}_${item.isGroupMessage ? 'group' : 'vip'}`
          }
          contentContainerStyle={styles.messageList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No messages found</Text>
          }
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  groupName: {
    fontWeight: 'bold',
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default VipCollectionChat;
