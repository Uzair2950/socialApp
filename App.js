import React, {useEffect, useState, useLayoutEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import LOGIN from './frontend/login';
import Biit from './frontend/biitOfficialWall';
import Messages from './frontend/messages';
import Chat from './frontend/Chat';
import Icon from 'react-native-vector-icons/Ionicons';
import Alerts from './frontend/alerts';
import AutoReply from './frontend/autoreply';
import ScheduleScreen from './frontend/Schedule';
import ClassWall from './frontend/classWall';
import SocialWall from './frontend/socialWall';
import ChatScreenOptions from './frontendUtils/ChatScreenOptions';
import UserProfile from './frontend/userProfile';
import WallsHeader from './frontendUtils/WallsHeader';
import ImageView from './frontendUtils/ImageView';
import Friends from './frontend/Friends';
import FriendRequests from './frontend/FriendRequests';
import CreateGroup from './frontend/createGroup';
import GroupDetailsAndPosts from './frontend/groupDetailsAndPosts';
import GroupChatDetails from './frontend/GroupChatDetails';
import GroupMemberAdd from './frontend/groupMemberAdd';
import GroupJoinRequests from './frontend/groupJoinRequests';
import GroupChatAdminsAdd from './frontend/GroupChatAdminsAdd';
import GroupChatMemberAdd from './frontend/GroupChatMemberAdd';
import GroupChatMemberRemove from './frontend/GroupChatMemberRemove';
import GroupChatMembersView from './frontend/GroupChatMembersView';
import SearchGroups from './frontend/searchGroups';
import AddGroupAdmins from './frontend/AddGroupAdmins';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import home from './Images/Home.png';
import chats from './Images/chats.png';
import alerts from './Images/Alerts.png';
import biit from './Images/BIIT.png';
import classs from './Images/Class.png';
import ActiveClass from './Images/activeClass.png';
import Activehome from './Images/activeHome.png';
import ActiveChats from './Images/activeChat.png';
import ActiveAlerts from './Images/ActiveAlerts.png';
import {Image, View, Text, TouchableOpacity} from 'react-native';
import axios from 'axios';
import UserGroups from './frontend/groups';
import GroupSettings from './frontend/groupSettings';
import GroupMemberRemove from './frontend/groupMemberRemove';
import GroupChatSettings from './frontend/GroupChatSettings';
import {API_BASE_URL} from './constants/config';

const USER_ID = '6754a9268db89992d5b8221e';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: 'black',
  },
};

// Alert screen wrapped in drawer
const AlertWithDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Notifications"
      screenOptions={{
        drawerPosition: 'right',
        headerShown: true,
      }}>
      <Drawer.Screen
        name="Notifications"
        component={AlertsScreenWithHeader}
        options={{
          headerTitle: 'Notifications',
          headerTitleAlign: 'center',
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={UserProfile}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Friends"
        component={Friends}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Friends Request"
        component={FriendRequests}
        options={{
          headerTitleAlign: 'center',
        }}
      />
      <Drawer.Screen
        name="Groups"
        component={UserGroups}
        options={{
          headerTitleAlign: 'center',
        }}
      />
    </Drawer.Navigator>
  );
};

// Custom Alerts screen with menu icon
const AlertsScreenWithHeader = ({navigation}) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{marginRight: 15}}>
          <Icon name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return <Alerts />;
};

function MainTabs() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/notifications/getNotifications/${USER_ID}`,
      );
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.log('Error fetching unread notifications count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator initialRouteName="BIIT">
      <Tab.Screen
        name="Home"
        component={SocialWall}
        options={{
          headerShown: true,
          tabBarActiveTintColor: '#01A082',
          headerTitle: () => <WallsHeader />,
          tabBarIcon: ({focused}) => (
            <Image
              source={focused ? Activehome : home}
              style={{height: 26, width: 26}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Class"
        component={ClassWall}
        options={{
          tabBarActiveTintColor: '#01A082',
          headerTitle: () => <WallsHeader />,
          headerShown: true,
          tabBarIcon: ({focused}) => (
            <Image
              source={focused ? ActiveClass : classs}
              style={{height: 26, width: 26}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="BIIT"
        component={Biit}
        options={{
          tabBarActiveTintColor: '#01A082',
          headerTitle: () => <WallsHeader />,
          headerShown: true,
          tabBarIcon: ({focused}) => (
            <Image source={biit} style={{height: 26, width: 26}} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertWithDrawer}
        options={{
          tabBarActiveTintColor: '#01A082',
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: {
            color: 'white',
            backgroundColor: 'red',
          },
          headerShown: false, // Let drawer handle header
          tabBarIcon: ({focused}) => (
            <Image
              source={focused ? ActiveAlerts : alerts}
              style={{height: 32, width: 29.82}}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={Messages}
        options={{
          tabBarActiveTintColor: '#01A082',
          headerShown: true,
          tabBarIcon: ({focused}) => (
            <Image
              source={focused ? ActiveChats : chats}
              style={{height: 28, width: 26}}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: true,
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
            tabBarStyle: {display: 'none'},
            headerBackImage: () => (
              <Icon
                name="arrow-back"
                size={24}
                color="black"
                style={{marginLeft: 10}}
                fontFamily="Ionicons"
              />
            ),
          }}>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UserProfile"
            component={AlertWithDrawer}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LOGIN}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BiitOfficialWall"
            component={MainTabs}
            options={{
              headerShown: false,
              headerStyle: {backgroundColor: 'white'},
            }}
          />
          <Stack.Screen
            name="Messages"
            component={Messages}
            options={({navigation}) => ({
              title: 'Messages',
              headerLeft: () => (
                <Icon
                  name="arrow-back"
                  size={24}
                  color="black"
                  style={{marginLeft: 10}}
                  onPress={() => {
                    if (navigation.canGoBack()) navigation.goBack();
                  }}
                />
              ),
            })}
          />
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={({navigation, route}) =>
              ChatScreenOptions({navigation, route})
            }
          />
          <Stack.Screen
            name="AutoReply"
            component={AutoReply}
            options={{title: 'Auto-Reply'}}
          />
          <Stack.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{title: 'Schedule Messages'}}
          />
          <Stack.Screen
            name="ClassWall"
            component={ClassWall}
            options={{
              headerTitle: () => <WallsHeader />,
              headerStyle: {backgroundColor: 'white'},
            }}
          />
          <Stack.Screen
            name="SocialWall"
            component={SocialWall}
            options={{
              headerTitle: () => <WallsHeader />,
              headerStyle: {backgroundColor: 'white'},
            }}
          />
          <Stack.Screen
            name="Friends"
            component={Friends}
            options={{headerStyle: {backgroundColor: 'white'}}}
          />
          <Stack.Screen
            name="FriendRequests"
            component={FriendRequests}
            options={{headerStyle: {backgroundColor: 'white'}}}
          />
          <Stack.Screen
            name="Groups"
            component={UserGroups}
            options={{headerStyle: {backgroundColor: 'white'}}}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroup}
            options={{headerStyle: {backgroundColor: 'white'}}}
          />
          <Stack.Screen
            name="GroupDetailAndPosts"
            component={GroupDetailsAndPosts}
            options={{headerStyle: {backgroundColor: 'white'}}}
          />
          <Stack.Screen
            name="GroupSettings"
            component={GroupSettings}
            options={{headerStyle: {backgroundColor: 'white'}}}
          />
          <Stack.Screen
            name="GroupMemberAdd"
            component={GroupMemberAdd}
            options={{
              headerStyle: {backgroundColor: 'white'},
              title: 'Add Members',
            }}
          />
          <Stack.Screen
            name="GroupMemberRemove"
            component={GroupMemberRemove}
            options={{
              headerStyle: {backgroundColor: 'white'},
              title: 'Remove Members',
            }}
          />
          <Stack.Screen
            name="GroupJoinRequests"
            component={GroupJoinRequests}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddGroupAdmins"
            component={AddGroupAdmins}
            options={{title: 'Add Admins'}}
          />
          <Stack.Screen
            name="SearchGroups"
            component={SearchGroups}
            options={{title: 'Search Groups'}}
          />
          <Stack.Screen
            name="GroupChatSettings"
            component={GroupChatSettings}
            options={{title: 'Group Chat Settings'}}
          />
          <Stack.Screen
            name="GroupChatDetails"
            component={GroupChatDetails}
            options={{title: 'Group Chat Details'}}
          />
          <Stack.Screen
            name="GroupChatAdminsAdd"
            component={GroupChatAdminsAdd}
            options={{title: 'Add Group Chat Admins'}}
          />
          <Stack.Screen
            name="GroupChatMemberAdd"
            component={GroupChatMemberAdd}
            options={{title: 'Add Group Chat Members'}}
          />
          <Stack.Screen
            name="GroupChatMemberRemove"
            component={GroupChatMemberRemove}
            options={{title: 'Remove Group Chat Admins'}}
          />
          <Stack.Screen
            name="GroupChatMembersView"
            component={GroupChatMembersView}
            options={{title: 'Group Chat Members'}}
          />
          <Stack.Screen
            name="ImageViewer"
            component={ImageView}
            options={{headerStyle: {backgroundColor: 'black'}}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
