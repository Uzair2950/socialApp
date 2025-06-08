import React, {useState} from 'react';
import {View} from 'react-native';
import {Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatMenu from './ChatMenu';

export default function ChatScreenOptions({navigation, route}) {
  const {chatId, chatName, participants, isGroup} = route.params;
  console.log('Chat participants', participants);
  console.log('Is chat Groups?', isGroup);
  const userId = '6754a9268db89992d5b8221f';

  console.log('ChatScreenOptions - userId:', userId);
  console.log('ChatScreenOptions - chatId:', chatId);

  return {
    title: chatName || 'Chat',
    headerLeft: () => (
      <Icon
        name="arrow-back"
        size={24}
        color="black"
        style={{marginLeft: 10}}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }}
      />
    ),
    headerRight: () => (
      <ChatMenu
        navigation={navigation}
        userId={userId}
        chatId={chatId}
        participants={participants}
        isGroup={isGroup}
      />
    ),
    headerRightContainerStyle: {marginRight: 10},
  };
}
