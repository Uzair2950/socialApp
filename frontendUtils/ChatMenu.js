// import axios from 'axios';
// import React, {useEffect, useState} from 'react';
// import {View, ActivityIndicator} from 'react-native';
// import {Menu} from 'react-native-paper';
// import Icon from 'react-native-vector-icons/Ionicons';
// import {API_BASE_URL} from '../constants/config';

// const ChatMenu = ({navigation, userId, chatId, participants, isGroup}) => {
//   const [visible, setVisible] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const openMenu = () => setVisible(true);
//   const closeMenu = () => setVisible(false);

//   useEffect(() => {
//     const checkAdminStatus = async () => {
//       if (isGroup) {
//         setLoading(true);
//         setError(null);
//         try {
//           // First get group details using chatId
//           const groupResponse = await axios.get(
//             `${API_BASE_URL}/chatgroup/getGroupByChatId/${chatId}`,
//           );

//           if (!groupResponse.data) {
//             console.log('Group not found for chatId:', chatId);
//             setIsAdmin(false);
//             return;
//           }

//           const groupId = groupResponse.data._id;
//           console.log('Group ID:', groupId);

//           // Now get admins using the groupId
//           const adminsResponse = await axios.get(
//             `${API_BASE_URL}/chatgroup/getAdmins/${groupId}`,
//           );

//           const admins = adminsResponse.data || [];
//           console.log('Admins:', admins);

//           setIsAdmin(admins.some(admin => admin._id === userId));
//           console.log('This is chatMenu User ID', userId);
//           console.log('This is chatMenu Admin Bool', isAdmin);
//         } catch (error) {
//           console.error('Error checking admin status:', error);
//           setError('Failed to check admin status');
//           setIsAdmin(false);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     checkAdminStatus();
//   }, [chatId, userId, isGroup]);

//   if (loading) {
//     return (
//       <View style={{padding: 10}}>
//         <ActivityIndicator size="small" color="#0000ff" />
//       </View>
//     );
//   }

//   if (error) {
//     // Optionally show error state or return null
//     return null;
//   }

//   return (
//     <View>
//       <Menu
//         visible={visible}
//         onDismiss={closeMenu}
//         anchor={
//           <Icon
//             name="ellipsis-vertical"
//             size={24}
//             color="black"
//             style={{marginRight: 15}}
//             onPress={openMenu}
//           />
//         }>
//         {/* Always show Auto-Reply option */}
//         <Menu.Item
//           onPress={() => {
//             closeMenu();
//             navigation.navigate('AutoReply', {userId, chatId});
//           }}
//           title="Auto-Reply"
//         />

//         {/* Only show Group Settings for admins in group chats */}
//         {isGroup && isAdmin && (
//           <Menu.Item
//             onPress={() => {
//               closeMenu();
//               navigation.navigate('GroupChatSettings', {userId, chatId});
//             }}
//             title="Group Chat Settings"
//           />
//         )}
//       </Menu>
//     </View>
//   );
// };

// export default ChatMenu;
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import {API_BASE_URL} from '../constants/config';

const ChatMenu = ({navigation, userId, chatId, participants, isGroup}) => {
  const [visible, setVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Only check for admin status if it's a group chat
      if (isGroup) {
        try {
          // First get group details using chatId
          const groupResponse = await axios.get(
            `${API_BASE_URL}/chatgroup/getGroupByChatId/${chatId}`,
          );

          if (!groupResponse.data) {
            console.log('Group not found for chatId:', chatId);
            setIsAdmin(false);
            return;
          }

          const groupId = groupResponse.data._id;

          // Now get admins using the groupId
          const adminsResponse = await axios.get(
            `${API_BASE_URL}/chatgroup/getAdmins/${groupId}`,
          );

          const admins = adminsResponse.data || [];
          setIsAdmin(admins.some(admin => admin._id === userId));
        } catch (error) {
          console.error('Error checking admin status:', error);
          setError('Failed to check admin status');
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      } else {
        // Not a group chat, no need to check admin status
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [chatId, userId, isGroup]);

  // Don't render anything while loading
  if (loading) {
    return (
      <View style={{padding: 10}}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Icon
            name="ellipsis-vertical"
            size={24}
            color="black"
            style={{marginRight: 15}}
            onPress={openMenu}
          />
        }>
        {/* Always show Auto-Reply option */}
        {!isGroup && (
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('AutoReply', {userId, chatId});
            }}
            title="Auto-Reply"
          />
        )}
        {/* Only show Group Settings for admins in group chats */}
        {/* isAdmin && */}
        {isGroup && (
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('GroupChatDetails', {userId, chatId});
            }}
            title="Group Chat Settings"
          />
        )}
      </Menu>
    </View>
  );
};

export default ChatMenu;
