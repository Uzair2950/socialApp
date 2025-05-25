import React, {useEffect, useState} from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  TextInput,
  Alert,
  ToastAndroid,
  ActionSheetIOS,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Linking,
  ImageBackground,
} from 'react-native';
import header from '../Images/Header.png';
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

// const API_BASE_URL = 'http://192.168.215.120:3001/api';
// const IMG_BASE_URL = 'http://192.168.215.120:3001';

const USER_ID = '6754a9268db89992d5b8221e';
const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';

const UserProfile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [postData, setPostData] = useState({
    privacyLevel: '0',
    type: '0',
    allowCommenting: true,
    postOnTimeline: true,
  });

  const showMessage = message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/user/getUserData/${USER_ID}`,
      );
      setUserData(res.data);
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  // Fetch user's friends
  const fetchUserFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/getFriends/${USER_ID}`);
      setFriends(res.data);
    } catch (error) {
      console.log('Error fetching friends:', error);
    }
  };

  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/posts/getPosts/${USER_ID}`);
      const sortedPosts = res.data.sort(
        (a, b) =>
          new Date(b.postData.createdAt) - new Date(a.postData.createdAt),
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.log('Error fetching Posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async postId => {
    if (!postId) return;
    try {
      setCommentLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/posts/getComments/${postId}/${USER_ID}`,
      );
      const formattedComments = (response.data || []).map(comment => ({
        ...comment,
        authorData: {
          ...(comment.authorData || {}),
          name: comment.authorData?.name || 'Unknown User',
          imgUrl: comment.authorData?.imgUrl || null,
        },
      }));
      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showMessage('Failed to load comments');
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!selectedPostId || !newComment.trim()) {
      showMessage('Please enter a comment');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/posts/addComment/${selectedPostId}`, {
        author: USER_ID,
        content: newComment,
      });
      setNewComment('');
      fetchComments(selectedPostId);
      setPosts(currentPosts =>
        currentPosts.map(p => {
          if (p._id === selectedPostId) {
            return {...p, commentCount: (p.commentCount || 0) + 1};
          }
          return p;
        }),
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      showMessage('Failed to add comment');
    }
  };

  // Handle like/unlike a post
  const handleLike = async postId => {
    if (!postId) return;

    try {
      const post = posts.find(p => p && p._id === postId);
      if (!post) return;

      const isLiked = post.hasLiked;

      await axios.put(
        `${API_BASE_URL}/posts/togglePostLike/${postId}/${USER_ID}/${isLiked}`,
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

  // Handle deleting a post
  const handleDeletePost = async postId => {
    if (!postId) return;
    try {
      await axios.delete(`${API_BASE_URL}/posts/deletePost/${postId}`);
      showMessage('Post deleted successfully');
      fetchUserPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showMessage('Failed to delete post');
    }
  };

  // Show delete option for user's own posts
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
          {text: 'Cancel', style: 'cancel'},
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

  // File handling functions
  const isImageAttachment = fileName => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const getFullFileUrl = relativeUrl => {
    if (!relativeUrl) return null;
    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }
    const IMG_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
    return `${IMG_BASE_URL}${
      relativeUrl.startsWith('/') ? '' : '/'
    }${relativeUrl}`;
  };

  // const downloadAndOpenFile = async fileUrl => {
  //   const fullUrl = getFullFileUrl(fileUrl);
  //   if (!fullUrl) {
  //     showMessage('Invalid file URL');
  //     return;
  //   }

  //   try {
  //     // First try to open directly if it's a common web format
  //     const canOpen = await Linking.canOpenURL(fullUrl);
  //     if (canOpen) {
  //       await Linking.openURL(fullUrl);
  //       return;
  //     }

  //     // If direct opening fails, try downloading and viewing
  //     const decodedUrl = decodeURIComponent(fullUrl);
  //     const fileName =
  //       decodedUrl.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
  //     const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  //     showMessage('Downloading file...');
  //     const options = {fromUrl: fullUrl, toFile: localFile};
  //     await RNFS.downloadFile(options).promise;

  //     try {
  //       showMessage('Opening file...');
  //       await FileViewer.open(localFile, {showOpenWithDialog: true});
  //     } catch (viewerError) {
  //       console.log('FileViewer error:', viewerError);
  //       showMessage('No app available to open this file type');
  //     }
  //   } catch (error) {
  //     console.error('Error handling file:', error);
  //     showMessage('Cannot open this file type or URL.');
  //   }
  // };
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

  const openImageViewer = imageUrl => {
    const fullUrl = getFullFileUrl(imageUrl);
    if (fullUrl) {
      navigation.navigate('ImageViewer', {imageUrl: fullUrl});
    } else {
      showMessage('Invalid image URL');
    }
  };

  // Post creation functions
  const handleAttachFile = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      setAttachments(prev => [...prev, ...results]);
      setSelectedDocuments(prev => [
        ...prev,
        ...results.map(r => r.name || `file_${Date.now()}`),
      ]);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking file:', error);
        showMessage('Failed to attach file(s)');
      }
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const newAttachments = result.assets.map(asset => ({
          uri: asset.uri,
          name:
            asset.fileName ||
            asset.uri.split('/').pop() ||
            `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
        setSelectedDocuments(prev => [
          ...prev,
          ...newAttachments.map(a => a.name),
        ]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showMessage('Failed to take photo');
    }
  };

  const removeAttachment = indexToRemove => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    setSelectedDocuments(prev =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handlePostFieldChange = (field, value) => {
    setPostData(prev => ({...prev, [field]: value}));
  };

  const resetPostForm = () => {
    setContent('');
    setAttachments([]);
    setSelectedDocuments([]);
    setPostData({
      privacyLevel: '0',
      type: '0',
      allowCommenting: true,
      postOnTimeline: true,
    });
  };

  const handleSubmitPost = async () => {
    if ((!content || !content.trim()) && attachments.length === 0) {
      showMessage('Please add content or at least one attachment.');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('author', USER_ID);
      formData.append('content', content.trim());
      formData.append('privacyLevel', postData.privacyLevel);
      formData.append('type', postData.type);
      formData.append('allowCommenting', postData.allowCommenting);
      formData.append('postOnTimeline', postData.postOnTimeline);
      attachments.forEach((attachment, index) => {
        if (attachment?.uri && attachment?.name && attachment?.type) {
          formData.append('attachments', {
            uri: attachment.uri,
            name: attachment.name,
            type: attachment.type,
          });
        }
      });
      const response = await axios.post(
        `${API_BASE_URL}/posts/addPost`,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );
      if (response.status === 200 || response.status === 201) {
        showMessage('Post created successfully!');
        setShowPostForm(false);
        resetPostForm();
        fetchUserPosts();
      } else {
        showMessage(`Post created, but received status: ${response.status}`);
      }
    } catch (error) {
      console.error(
        'Error creating post:',
        error.response?.data || error.message,
      );
      showMessage(
        error.response?.data?.message ||
          'Failed to create post. Please try again.',
      );
    } finally {
      setUploading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchUserData(),
          fetchUserFriends(),
          fetchUserPosts(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  const renderFriendItem = item => (
    <View style={styles.friendCard} key={item._id}>
      <Image
        source={{uri: `${IMG_BASE_URL}${item.imgUrl}`}}
        style={styles.friendImage}
      />
      <Text style={styles.friendName} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  );

  const renderPostItem = item => (
    <View style={styles.postContainer} key={item._id}>
      <View style={styles.authorContainer}>
        <Image
          source={{
            uri:
              getFullFileUrl(item.postData.authorData?.imgUrl) ||
              DEFAULT_PROFILE_PIC,
          }}
          style={styles.avatar}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {item.postData.authorData?.name || 'Unknown User'}
          </Text>
          <Text style={styles.postDate}>
            {moment(item.postData.createdAt).fromNow()}
          </Text>
        </View>
        {item.postData.authorData?._id === USER_ID && (
          <TouchableOpacity
            onPress={() => {
              showDeleteOption(item.postData._id);
            }}
            style={styles.moreOptionsButton}>
            <Icon name="more-vert" size={24} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {item.postData.content ? (
        <Text style={styles.postContent}>{item.postData.content}</Text>
      ) : null}

      {item.postData.attachments && item.postData.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {item.postData.attachments.map((attachment, index) => {
            if (!attachment) return null;
            const fileName = attachment.split('/').pop();
            const isImage = isImageAttachment(fileName);
            const fullAttachmentUrl = getFullFileUrl(attachment);
            if (!fullAttachmentUrl) return null;
            return isImage ? (
              <TouchableOpacity
                key={index}
                onPress={() => openImageViewer(attachment)}
                style={styles.imageAttachmentContainer}>
                <Image
                  source={{uri: fullAttachmentUrl}}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                style={styles.attachmentItemRow}
                onPress={() => downloadAndOpenFile(attachment)}>
                <Icon
                  name="attach-file"
                  size={20}
                  color="#01A082"
                  style={styles.attachmentIcon}
                />
                <Text style={styles.attachmentLink} numberOfLines={1}>
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
          onPress={() => handleLike(item._id)}>
          <Text style={styles.interactionText}>{item.likesCount || 0}</Text>
          <Image
            source={LikeIcon}
            style={{
              height: 18.58,
              width: 19.82,
              tintColor: item.hasLiked ? '#14AE5C' : '#828282',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => {
            setSelectedPostId(item._id);
            setShowCommentSection(true);
            fetchComments(item._id);
          }}>
          <Text style={styles.interactionText}>{item.commentCount || 0}</Text>
          <Icon
            name="comment"
            size={20}
            color="#828282"
            style={styles.commentIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14AE5C" />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#F8F8F8'}}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ImageBackground
          source={header}
          style={styles.headerImage}
          resizeMode="cover"
        />
        {/* User Info */}
        <View style={styles.userInfoContainer}>
          {userData.imgUrl && (
            <Image
              source={{uri: `${IMG_BASE_URL}${userData.imgUrl}`}}
              style={styles.userImage}
            />
          )}
          <View>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.username}>@{userData.name}</Text>
          </View>
          <View style={styles.userTypeContainer}>
            <Text style={styles.userType}>{userData.type}</Text>
          </View>
        </View>

        {/* Friends Count & Edit Button */}
        <View style={styles.friendsCountContainer}>
          <View>
            <Text style={styles.friendCount}>{friends.length} Friends</Text>
            <Text style={styles.bioText}>this→insomniac = true;</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Friends List Header */}
        <View style={styles.friendsHeader}>
          <Text style={styles.friendsHeading}>Friends</Text>
        </View>

        {/* Friends List */}
        <ScrollView
          horizontal
          contentContainerStyle={styles.friendsList}
          showsHorizontalScrollIndicator={false}>
          {friends.map(renderFriendItem)}
        </ScrollView>

        {/* Posts Section */}
        <View style={styles.postsHeader}>
          <Text style={styles.postsHeading}>Posts</Text>
        </View>

        {/* Posts List */}
        {posts.length > 0 ? (
          posts.map(renderPostItem)
        ) : (
          <Text style={styles.noPosts}>No posts to show yet. Create one!</Text>
        )}
      </ScrollView>

      {/* Comment Section */}
      {showCommentSection && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setShowCommentSection(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {commentLoading ? (
            <ActivityIndicator size="large" color="#14AE5C" />
          ) : (
            <ScrollView contentContainerStyle={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map(item => (
                  <View style={styles.commentItem} key={item._id}>
                    <Image
                      source={{
                        uri:
                          getFullFileUrl(item.authorData?.imgUrl) ||
                          DEFAULT_PROFILE_PIC,
                      }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <Text style={styles.commentAuthor}>
                        {item.authorData?.name || 'Unknown User'}
                      </Text>
                      <Text style={styles.commentText}>{item.content}</Text>
                      <Text style={styles.commentTime}>
                        {moment(item.createdAt).fromNow()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noCommentsText}>
                  No comments yet. Be the first!
                </Text>
              )}
            </ScrollView>
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={styles.commentPostButton}
                onPress={handleAddComment}
                disabled={!newComment.trim()}>
                <Icon
                  name="send"
                  size={24}
                  color={newComment.trim() ? '#14AE5C' : '#aaa'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Create Post Form */}
      {showPostForm && (
        <View style={styles.postFormContainer}>
          <View style={styles.postFormHeader}>
            <Text style={styles.postFormTitle}>Create New Post</Text>
            <TouchableOpacity
              onPress={() => !uploading && setShowPostForm(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.postFormScroll}>
            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#666"
              multiline
              value={content}
              onChangeText={setContent}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Post Type</Text>
              <View style={styles.optionsContainer}>
                {[
                  {value: '0', label: 'Normal Post'},
                  {value: '1', label: 'Timetable'},
                  {value: '2', label: 'Datesheet'},
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      postData.type === option.value && styles.selectedOption,
                    ]}
                    onPress={() => handlePostFieldChange('type', option.value)}>
                    <Text
                      style={[
                        styles.optionText,
                        postData.type === option.value &&
                          styles.selectedOptionText,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Level</Text>
              <View style={styles.optionsContainer}>
                {[
                  {value: '0', label: 'Public'},
                  {value: '1', label: 'Friends'},
                  {value: '2', label: 'Private'},
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      postData.privacyLevel === option.value &&
                        styles.selectedOption,
                    ]}
                    onPress={() =>
                      handlePostFieldChange('privacyLevel', option.value)
                    }>
                    <Text
                      style={[
                        styles.optionText,
                        postData.privacyLevel === option.value &&
                          styles.selectedOptionText,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Post Options</Text>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Allow Comments</Text>
                <Switch
                  value={postData.allowCommenting}
                  onValueChange={value =>
                    handlePostFieldChange('allowCommenting', value)
                  }
                  thumbColor={postData.allowCommenting ? '#14AE5C' : '#f4f3f4'}
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                />
              </View>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Post on Timeline</Text>
                <Switch
                  value={postData.postOnTimeline}
                  onValueChange={value =>
                    handlePostFieldChange('postOnTimeline', value)
                  }
                  thumbColor={postData.postOnTimeline ? '#14AE5C' : '#f4f3f4'}
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                />
              </View>
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
                        style={{marginRight: 8}}
                      />
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {documentName || 'Unnamed file'}
                      </Text>
                      <TouchableOpacity onPress={() => removeAttachment(index)}>
                        <Icon name="close" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.postButton, uploading && styles.disabledButton]}
            onPress={handleSubmitPost}
            disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      {!showPostForm && !showCommentSection && (
        <Pressable
          style={({pressed}) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => {
            resetPostForm();
            setShowPostForm(true);
          }}>
          <Icon name="add" size={25} color="#fff" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
    backgroundColor: '#F8F8F8',
  },
  headerImage: {
    height: 143,
    width: '100%',
    position: 'absolute',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  userImage: {
    height: 65,
    width: 65,
    borderRadius: 50,
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 14,
    color: 'white',
  },
  userTypeContainer: {
    marginLeft: 'auto',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    top: 50,
    right: 30,
  },
  userType: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  friendsCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 15,
  },
  friendCount: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 5,
    color: '#222',
  },
  bioText: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: '#555',
  },
  editButton: {
    backgroundColor: '#CFF7D3',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CFF7D3',
  },
  editButtonText: {
    color: '#009951',
    fontWeight: '400',
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  friendsHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAllText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  friendsList: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  friendCard: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  friendImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginBottom: 5,
    backgroundColor: '#ccc',
  },
  friendName: {
    fontSize: 12,
    textAlign: 'center',
    color: 'black',
  },
  postsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  postsHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
  postDate: {
    fontSize: 12,
    color: '#777',
  },
  moreOptionsButton: {
    padding: 5,
    marginLeft: 10,
  },
  postContent: {
    fontSize: 14.5,
    color: '#333',
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 8,
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  imageAttachmentContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#eee',
  },
  attachmentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d0e0f0',
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentLink: {
    flex: 1,
    color: '#01A082',
    fontSize: 14,
  },
  downloadIcon: {
    marginLeft: 10,
  },
  interactionContainer: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionText: {
    marginRight: 5,
    color: '#555',
    fontSize: 14,
  },
  commentIcon: {
    marginLeft: 2,
  },
  noPosts: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  commentsSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commentsList: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  commentPostButton: {
    marginLeft: 8,
    padding: 8,
  },
  postFormContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  postFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  postFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postFormScroll: {
    flex: 1,
  },
  postInput: {
    minHeight: 100,
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#14AE5C',
    borderColor: '#14AE5C',
  },
  optionText: {
    fontSize: 14,
    color: '#555',
  },
  selectedOptionText: {
    color: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 15,
    color: '#333',
  },
  attachmentButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    marginRight: 12,
  },
  attachmentButtonText: {
    marginLeft: 8,
    color: '#14AE5C',
    fontSize: 14,
  },
  attachmentsList: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  postButton: {
    backgroundColor: '#14AE5C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 5,
  },
  fabPressed: {
    backgroundColor: '#108a4a',
  },
});
export default UserProfile;
