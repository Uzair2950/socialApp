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
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  Platform,
  Alert,
  ToastAndroid,
  ActionSheetIOS,
  FlatList,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import LikeIcon from '../Images/likeIcon.png';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

const ClassPostsScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('6754a9268db89992d5b8221e');
  const [selectedSection, setSelectedSection] = useState(null);
  const [userType, setUserType] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  // const API_BASE_URL = 'http://192.168.215.120:3001/api/';
  // const IMG_BASE_URL = 'http://192.168.215.120:3001';
  const showMessage = message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `${API_BASE_URL}/user/getUserData/${userId}`,
        );
        const userData = userResponse.data;
        setUserType(userData.type || 'student');

        await fetchClassData(userData.type || 'student');
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    const fetchClassData = async type => {
      try {
        const sectionsResponse = await axios.get(
          `${API_BASE_URL}/feed/getClassWallsData/${type}/${userId}`,
        );
        setSections(sectionsResponse.data);

        if (sectionsResponse.data.length > 0) {
          setSelectedSection(sectionsResponse.data[0]);
          const postsResponse = await axios.get(
            `${API_BASE_URL}/feed/getClassWallPosts/${sectionsResponse.data[0].group}/${userId}`,
          );
          setPosts(postsResponse.data);

          // Check if user is admin of this group
          if (postsResponse.data.length > 0) {
            setIsAdmin(postsResponse.data[0].isGroupAdmin || false);
          }
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const loadSectionPosts = async section => {
    try {
      setLoading(true);
      setSelectedSection(section);
      const response = await axios.get(
        `${API_BASE_URL}/feed/getClassWallPosts/${section.group}/${userId}`,
      );
      setPosts(response.data);

      // Update admin status when loading new section
      if (response.data.length > 0) {
        setIsAdmin(response.data[0].isGroupAdmin || false);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error loading section posts:', error);
    } finally {
      setLoading(false);
    }
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
    }
  };

  const handleDeletePost = async postId => {
    try {
      // Find the post to get the postData._id
      const postToDelete = posts.find(post => post._id === postId);
      if (!postToDelete) {
        showMessage('Post not found');
        return;
      }

      const postDataId = postToDelete.postData?._id;
      if (!postDataId) {
        showMessage('Invalid post data');
        return;
      }

      // Delete using the postData._id
      await axios.delete(`${API_BASE_URL}/posts/deletePost/${postDataId}`);

      // Update state properly using functional update
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
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

  const isImageAttachment = fileName => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
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
      formData.append('privacyLevel', '0');
      formData.append('type', '0');
      formData.append('group_ids[0]', selectedSection.group);

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
          `${API_BASE_URL}/feed/getClassWallPosts/${selectedSection.group}/${userId}`,
        );
        setPosts(postsResponse.data || []);

        setContent('');
        setAttachments([]);
        setSelectedDocuments([]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
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
        {/* Section Selector */}
        {sections.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sectionSelector}>
            {sections.map(section => (
              <TouchableOpacity
                key={section._id}
                style={[
                  styles.sectionButton,
                  selectedSection?._id === section._id &&
                    styles.selectedSectionButton,
                ]}
                onPress={() => loadSectionPosts(section)}>
                <Text
                  style={[
                    styles.sectionButtonText,
                    selectedSection?._id === section._id &&
                      styles.selectedSectionText,
                  ]}>
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Posts */}
        {selectedSection && (
          <Text style={styles.title}>{selectedSection.title}</Text>
        )}

        {posts.length > 0 ? (
          posts.map(post => (
            <View key={post._id} style={styles.postContainer}>
              <View style={styles.authorContainer}>
                <Image
                  source={{
                    uri: post.postData.authorData.imgUrl
                      ? `${IMG_BASE_URL}${post.postData.authorData.imgUrl}`
                      : 'https://via.placeholder.com/40',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>
                    {post.postData.authorData.name}
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

              {post.postData.attachments &&
                post.postData.attachments.length > 0 && (
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
                  <Text style={styles.interactionText}>{post.likesCount}</Text>
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
          ))
        ) : (
          <Text style={styles.noPosts}>No posts available for this class.</Text>
        )}
      </ScrollView>

      {/* Floating Action Button for Admins */}
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
  sectionSelector: {
    marginBottom: 16,
    maxHeight: 50,
  },
  sectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedSectionButton: {
    backgroundColor: '#14AE5C',
  },
  sectionButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedSectionText: {
    color: 'white',
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
    padding: 10,
    backgroundColor: '#e8f4ec',
    borderRadius: 8,
    marginBottom: 8,
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

export default ClassPostsScreen;
