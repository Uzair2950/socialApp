import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Linking,
  Platform,
  Alert,
  ToastAndroid,
  Modal,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  PermissionsAndroid,
  ActionSheetIOS,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import LikeIcon from '../Images/likeIcon.png';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

const OfficialPostsScreen = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('6754a9268db89992d5b8221e');
  const [modalVisible, setModalVisible] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [content, setContent] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('0');
  const [allowCommenting, setAllowCommenting] = useState(true);
  const [postOnTimeline, setPostOnTimeline] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const offcialGroupId = '6797ebcc37200dbcdec36ba9';
  // const API_BASE_URL = 'http://192.168.215.120:3001/api/';
  // const IMG_BASE_URL = 'http://192.168.215.120:3001';

  const showMessage = message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to upload files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, groupsResponse, groupInfoResponse] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/feed/getOfficialPosts/${userId}`),
            axios.get(`${API_BASE_URL}/user/getGroups/${userId}`),
            axios.get(
              `${API_BASE_URL}/postgroup/getGroup/${offcialGroupId}/${userId}`,
            ),
          ]);

        setPosts(postsResponse.data || []);
        setIsAdmin(groupInfoResponse.data?.isAdmin || false);

        const validatedGroups = (groupsResponse.data || [])
          .filter(group => group && group._id)
          .map(group => ({
            _id: group._id,
            name: group.name || 'Unnamed Group',
            imgUrl: group.imgUrl || 'https://via.placeholder.com/40',
          }));

        setGroups(validatedGroups);
      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('Failed to load data');
        setPosts([]);
        setGroups([]);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePost = async postId => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/deletePost/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      showMessage('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      showMessage('Failed to delete post');
    }
  };

  const showDeleteOption = postId => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete Post'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            handleDeletePost(postId);
          }
        },
      );
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => handleDeletePost(postId),
            style: 'destructive',
          },
        ],
        {cancelable: true},
      );
    }
  };

  const downloadAndOpenFile = async fileUrl => {
    if (!fileUrl) {
      showMessage('Invalid file URL');
      return;
    }

    try {
      const fileName = fileUrl.split('/').pop() || `file_${Date.now()}`;
      const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      showMessage('Downloading file...');

      const options = {
        fromUrl: `${IMG_BASE_URL}${fileUrl}`,
        toFile: localFile,
      };

      const download = RNFS.downloadFile(options);
      await download.promise;

      showMessage('Opening file...');
      await FileViewer.open(localFile);
    } catch (error) {
      console.error('Error handling file:', error);
      showMessage('Trying to open in browser...');

      try {
        await Linking.openURL(`${IMG_BASE_URL}${fileUrl}`);
      } catch (linkError) {
        showMessage('Failed to open file');
        console.error('Failed to open URL:', linkError);
      }
    }
  };

  const isImageAttachment = fileName => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const handleLike = async postId => {
    if (!postId) return;

    try {
      const post = posts.find(p => p && p._id === postId);
      if (!post) return;

      const isLiked = post.hasLiked;

      await axios.put(
        `${API_BASE_URL}/posts/togglePostLike/${postId}/${userId}/${isLiked}`,
      );

      const updatedPosts = posts.map(p => {
        if (p && p._id === postId) {
          return {
            ...p,
            hasLiked: !isLiked,
            likesCount: isLiked
              ? (p.likesCount || 0) - 1
              : (p.likesCount || 0) + 1,
          };
        }
        return p;
      });

      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error handling like:', error);
      showMessage('Failed to update like');
    }
  };

  const toggleGroupSelection = groupId => {
    if (!groupId) return;
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      setAttachments([...attachments, result[0]]);
      setSelectedDocuments([...selectedDocuments, result[0].name]);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file picker');
      } else {
        console.error('Error picking file:', error);
      }
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (
        !result.didCancel &&
        !result.errorCode &&
        result.assets &&
        result.assets[0]
      ) {
        const newAttachment = {
          uri: result.assets[0].uri,
          name:
            result.assets[0].fileName ||
            result.assets[0].uri.split('/').pop() ||
            `photo_${Date.now()}.jpg`,
          type: result.assets[0].type || 'image/jpeg',
        };
        setAttachments(prev => [...prev, newAttachment]);
        setSelectedDocuments(prev => [...prev, newAttachment.name]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showMessage('Failed to take photo');
    }
  };

  const removeAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPost = async () => {
    if ((!content || !content.trim()) && attachments.length === 0) {
      showMessage('Please add content or attachments');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append('author', userId);
      formData.append('content', content || '');
      formData.append('privacyLevel', privacyLevel);
      formData.append('type', '0');
      formData.append('allowCommenting', allowCommenting);
      formData.append('postOnTimeline', postOnTimeline);

      selectedGroups.forEach((groupId, index) => {
        if (groupId) formData.append(`group_ids[${index}]`, groupId);
      });

      for (const attachment of attachments) {
        if (attachment && attachment.uri) {
          const file = {
            uri: attachment.uri,
            name: attachment.name || `file_${Date.now()}`,
            type: attachment.type || 'application/octet-stream',
          };
          formData.append('attachments', file);
        }
      }

      const response = await axios.post(
        `${API_BASE_URL}/posts/addPost`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data && response.data.post_id) {
        showMessage('Post created successfully!');
        setModalVisible(false);

        const postsResponse = await axios.get(
          `${API_BASE_URL}/feed/getOfficialPosts/${userId}`,
        );
        setPosts(postsResponse.data || []);

        setContent('');
        setAttachments([]);
        setSelectedDocuments([]);
        setSelectedGroups([]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      showMessage('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const AddPostModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                style={styles.postInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#666"
                multiline
                value={content}
                onChangeText={setContent}
              />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy</Text>
                <View style={styles.privacyOptions}>
                  {['0', '1', '2'].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.privacyOption,
                        privacyLevel === level && styles.selectedPrivacyOption,
                      ]}
                      onPress={() => setPrivacyLevel(level)}>
                      <Text style={styles.privacyOptionText}>
                        {level === '0'
                          ? 'Public'
                          : level === '1'
                          ? 'Friends'
                          : 'Private'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Post to Groups</Text>
                {groups && groups.length > 0 ? (
                  <FlatList
                    data={groups}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item?._id || Math.random().toString()}
                    renderItem={({item}) => {
                      if (!item) return null;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.groupItem,
                            selectedGroups.includes(item._id) &&
                              styles.selectedGroupItem,
                          ]}
                          onPress={() => toggleGroupSelection(item._id)}>
                          <Image
                            source={{
                              uri: `${IMG_BASE_URL}${item.imgUrl}`,
                            }}
                            style={styles.groupImage}
                            defaultSource={require('../Images/noProfile.jpeg')}
                          />
                          <Text style={styles.groupName} numberOfLines={1}>
                            {item.name || 'Unnamed Group'}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                ) : (
                  <Text style={styles.noGroupsText}>No groups available</Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Attachments</Text>
                <View style={styles.attachmentButtons}>
                  <TouchableOpacity
                    style={styles.attachmentButton}
                    onPress={handleAttachFile}>
                    <Icon name="attach-file" size={20} color="#14AE5C" />
                    <Text style={styles.attachmentButtonText}>Add Files</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.attachmentButton}
                    onPress={handleTakePhoto}>
                    <Icon name="photo-camera" size={20} color="#14AE5C" />
                    <Text style={styles.attachmentButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>

                {selectedDocuments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {selectedDocuments.map((documentName, index) => (
                      <View key={index} style={styles.attachmentItem}>
                        <Icon
                          name={
                            isImageAttachment(documentName)
                              ? 'image'
                              : 'insert-drive-file'
                          }
                          size={20}
                          color="#14AE5C"
                        />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {documentName || 'Unnamed file'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeAttachment(index)}>
                          <Icon name="close" size={20} color="#ff4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Options</Text>
                <View style={styles.optionRow}>
                  <Text style={{color: 'black'}}>Allow Comments</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setAllowCommenting(!allowCommenting)}>
                    <Icon
                      name={allowCommenting ? 'toggle-on' : 'toggle-off'}
                      size={30}
                      color={allowCommenting ? '#14AE5C' : '#ccc'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.optionRow}>
                  <Text style={{color: 'black'}}>Post on Timeline</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setPostOnTimeline(!postOnTimeline)}>
                    <Icon
                      name={postOnTimeline ? 'toggle-on' : 'toggle-off'}
                      size={30}
                      color={postOnTimeline ? '#14AE5C' : '#ccc'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.postButton}
              onPress={handleSubmitPost}
              disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>BIIT Official</Text>
        {posts && posts.length > 0 ? (
          posts.map(post => {
            if (!post || !post._id || !post.postData) return null;

            return (
              <View key={post._id} style={styles.postContainer}>
                <View style={styles.authorContainer}>
                  <Image
                    source={{
                      uri: post.postData.authorData?.imgUrl
                        ? `${IMG_BASE_URL}${post.postData.authorData.imgUrl}`
                        : 'https://via.placeholder.com/40',
                    }}
                    style={styles.avatar}
                    defaultSource={require('../Images/noProfile.jpeg')}
                  />
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>
                      {post.postData.authorData?.name || 'Unknown User'}
                    </Text>
                    <Text style={styles.postDate}>
                      {moment(post.postData.createdAt).format(
                        'MMM D, YYYY h:mm A',
                      )}
                    </Text>
                  </View>
                  {post.is_pinned && (
                    <Text style={styles.pinnedBadge}>PINNED</Text>
                  )}
                  {isAdmin && (
                    <TouchableOpacity
                      onPress={() => showDeleteOption(post._id)}
                      style={styles.moreOptionsButton}>
                      <Icon name="more-vert" size={24} color="#333" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.postContent}>{post.postData.content}</Text>

                {post.postData.attachments?.length > 0 && (
                  <View style={styles.attachmentsContainer}>
                    {post.postData.attachments.map((attachment, index) => {
                      if (!attachment) return null;
                      const fileName = attachment.split('/').pop();
                      const isImage = isImageAttachment(fileName);

                      return isImage ? (
                        <View
                          key={index}
                          style={styles.imageAttachmentContainer}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('ImageViewer', {
                                imageUrl: `${IMG_BASE_URL}${attachment}`,
                              })
                            }>
                            <Image
                              source={{
                                uri: `${IMG_BASE_URL}${attachment}`,
                              }}
                              style={styles.attachmentImage}
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          key={index}
                          style={styles.attachmentItem}
                          onPress={() => downloadAndOpenFile(attachment)}>
                          <Icon
                            name="attach-file"
                            size={20}
                            color="#01A082"
                            style={styles.attachmentIcon}
                          />
                          <Text style={styles.attachmentLink}>
                            {fileName || 'Download file'}
                          </Text>
                          <Icon
                            name="file-download"
                            size={20}
                            color="#01A082"
                            style={styles.downloadIcon}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <View style={styles.interactionContainer}>
                  <TouchableOpacity
                    style={styles.interactionButton}
                    onPress={() => handleLike(post._id)}>
                    <Text style={styles.interactionText}>
                      {post.likesCount || 0}
                    </Text>
                    <Image
                      source={LikeIcon}
                      style={{
                        height: 18.58,
                        width: 19.82,
                        tintColor: post.hasLiked ? '#14AE5C' : '#828282',
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noPosts}>No posts available</Text>
        )}
      </ScrollView>

      {isAdmin && (
        <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
          <Icon name="add" size={25} color="#fff" />
        </Pressable>
      )}

      <AddPostModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#666',
  },
  moreOptionsButton: {
    padding: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  attachmentsContainer: {
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#e8f4ec',
    borderRadius: 8,
  },
  attachmentIcon: {
    marginRight: 10,
  },
  downloadIcon: {
    marginLeft: 'auto',
  },
  attachmentLink: {
    color: '#01A082',
    flex: 1,
    marginRight: 10,
  },
  imageAttachmentContainer: {
    marginBottom: 12,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  interactionContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    color: '#828282',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  pinnedBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#14AE5C',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 'bold',
  },
  noPosts: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  noGroupsText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  postInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    textAlignVertical: 'top',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyOption: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedPrivacyOption: {
    backgroundColor: '#e8f4ec',
    borderColor: '#14AE5C',
  },
  privacyOptionText: {
    color: '#333',
  },
  groupItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedGroupItem: {
    backgroundColor: '#e8f4ec',
    borderColor: '#14AE5C',
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  groupName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#14AE5C',
  },
  attachmentButtonText: {
    marginLeft: 5,
    color: '#14AE5C',
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentName: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleButton: {
    padding: 5,
  },
  postButton: {
    backgroundColor: '#14AE5C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OfficialPostsScreen;
