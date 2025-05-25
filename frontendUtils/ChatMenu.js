import React, {useState} from 'react';
import {View} from 'react-native';
import {Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatMenu = ({navigation, userId, chatId}) => {
  // console.log("ChatMenu - navigation:", navigation);
  // console.log("ChatMenu - userId:", userId);
  // console.log("ChatMenu - chatId:", chatId);

  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
        <Menu.Item
          onPress={() => {
            closeMenu();
            navigation.navigate('AutoReply', {userId, chatId});
          }}
          title="Auto-Reply"
        />
      </Menu>
    </View>
  );
};

export default ChatMenu;
