import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {API_BASE_URL} from '../constants/config';

const ScheduleScreen = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDocuments, setSelectedDocuments] = useState([]); // State for selected documents
  const uid = '6754a9268db89992d5b8221f';
  // const API_BASE_URL = 'http://192.168.215.120:3001/api/';
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chat/getAllChats/${uid}`,
        );
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  const handleChatSelection = chatId => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      // Add the selected file to the attachments list
      setAttachments([...attachments, result[0]]);

      // Add the original file name to the selectedDocuments list for display
      setSelectedDocuments([...selectedDocuments, result[0].name]);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking file:', error);
      }
    }
  };

  const handleRemoveDocument = index => {
    // Remove the document from both attachments and selectedDocuments
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    const updatedDocuments = selectedDocuments.filter((_, i) => i !== index);

    setAttachments(updatedAttachments);
    setSelectedDocuments(updatedDocuments);
  };

  const handleDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event, time) => {
    if (time) {
      setSelectedTime(time);
    }
    setShowTimePicker(false);
  };

  // const handleSubmit = async () => {
  //   if (!messageContent.trim()) {
  //     Alert.alert('Error', 'Please enter a message.');
  //     return;
  //   }

  //   if (selectedChats.length === 0) {
  //     Alert.alert('Error', 'Please select at least one chat.');
  //     return;
  //   }

  //   try {
  //     const personalChats = selectedChats.filter(
  //       chatId => !chats.find(chat => chat.id === chatId)?.isGroup,
  //     );
  //     const groupChats = selectedChats.filter(
  //       chatId => chats.find(chat => chat.id === chatId)?.isGroup,
  //     );

  //     const formData = new FormData();

  //     // Append files to the FormData with the field name "messageAttchments"
  //     attachments.forEach((file, index) => {
  //       formData.append('messageAttchments', {
  //         uri: file.uri,
  //         name: file.name || `file_${index}`,
  //         type: file.type || 'application/octet-stream',
  //       });
  //     });

  //     // Append other fields to the FormData
  //     // formData.append('personalChats', JSON.stringify(personalChats));
  //     // formData.append('groupChats', JSON.stringify(groupChats));
  //     formData.append('personalChats', personalChats);
  //     formData.append('groupChats', groupChats);
  //     formData.append('messageContent', messageContent);
  //     formData.append('senderId', uid);

  //     // Combine selected date and time into a single pushTime value
  //     const pushTime = new Date(
  //       selectedDate.getFullYear(),
  //       selectedDate.getMonth(),
  //       selectedDate.getDate(),
  //       selectedTime.getHours(),
  //       selectedTime.getMinutes(),
  //     ).toISOString();

  //     formData.append('pushTime', pushTime);
  //     console.log(formData);
  //     // Send the request to the backend
  //     const response = await axios.post(
  //       `${API_BASE_URL}chat/scheduleMessage`,
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       },
  //     );

  //     Alert.alert('Success', 'Message scheduled successfully!');
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error('Error scheduling message:', error);
  //     Alert.alert('Error', 'Failed to schedule message.');
  //   }
  // };
  const handleSubmit = async () => {
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

    if (selectedChats.length === 0) {
      Alert.alert('Error', 'Please select at least one chat.');
      return;
    }

    try {
      const formData = new FormData();

      // Append files
      attachments.forEach((file, index) => {
        formData.append('messageAttchments', {
          uri: file.uri,
          name: file.name || `file_${index}`,
          type: file.type || 'application/octet-stream',
        });
      });

      // Append chat IDs - one entry per chat
      selectedChats.forEach(chatId => {
        const chat = chats.find(c => c.id === chatId);
        if (chat?.isGroup) {
          formData.append('groupChats', chatId);
        } else {
          formData.append('personalChats', chatId);
        }
      });

      // Combine date and time
      const pushTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
      ).toISOString();

      // Append other fields
      formData.append('messageContent', messageContent);
      formData.append('senderId', uid);
      formData.append('pushTime', pushTime);

      console.log('FormData being sent:', formData);

      const response = await axios.post(
        `${API_BASE_URL}/chat/scheduleMessage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert('Success', 'Message scheduled successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error scheduling message:', error);
      Alert.alert('Error', 'Failed to schedule message.');
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>Select Chats:</Text>
        {/* Replace FlatList with ScrollView and map */}
        <ScrollView nestedScrollEnabled style={styles.chatListContainer}>
          {chats.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chatItem,
                selectedChats.includes(item.id) && styles.selectedChatItem,
              ]}
              onPress={() => handleChatSelection(item.id)}>
              <Text
                style={[
                  styles.chatName,
                  selectedChats.includes(item.id) && styles.SelectedchatName,
                ]}>
                {item.chatInfo.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Message:</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="black"
          value={messageContent}
          onChangeText={setMessageContent}
          multiline
        />

        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleAttachFile}>
          <Text style={styles.attachButtonText}>Attach File</Text>
        </TouchableOpacity>

        {/* Display Selected Documents */}
        {selectedDocuments.length > 0 && (
          <View style={styles.selectedDocumentsContainer}>
            <Text style={styles.label}>Selected Documents:</Text>
            <ScrollView nestedScrollEnabled>
              {selectedDocuments.map((item, index) => (
                <View key={index} style={styles.documentItem}>
                  <Text style={styles.documentName}>{item}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveDocument(index)}>
                    <Icon name="close" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>Schedule Time:</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={{color: '#000'}}>
            {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowTimePicker(true)}>
          <Text style={{color: '#000'}}>
            {selectedTime.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Schedule Message</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  chatListContainer: {
    maxHeight: 200, // Set a max height for the chat list
  },
  chatItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedChatItem: {
    backgroundColor: 'green',
  },
  chatName: {
    fontSize: 16,
    color: 'black',
  },
  SelectedchatName: {
    fontSize: 16,
    color: 'white',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: 'black',
  },
  attachButton: {
    backgroundColor: '#0CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  attachButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#0CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedDocumentsContainer: {
    marginBottom: 20,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  documentName: {
    fontSize: 14,
    color: 'black',
  },
  removeButton: {
    padding: 5,
  },
});

export default ScheduleScreen;
