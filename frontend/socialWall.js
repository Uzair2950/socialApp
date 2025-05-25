// import React, {useEffect, useState, useCallback} from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   Pressable,
//   Modal,
//   TextInput,
//   TouchableWithoutFeedback,
//   Keyboard,
//   Linking,
//   Platform,
//   Alert,
//   ToastAndroid,
//   ActionSheetIOS,
//   Switch,
//   FlatList,
//   KeyboardAvoidingView,
// } from 'react-native';
// import axios from 'axios';
// import moment from 'moment';
// import LikeIcon from '../Images/likeIcon.png'; // Ensure path is correct
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import DocumentPicker from 'react-native-document-picker';
// import {launchCamera} from 'react-native-image-picker';
// import FileViewer from 'react-native-file-viewer';
// import RNFS from 'react-native-fs';
// import {useNavigation} from '@react-navigation/native';

// // --- Configuration ---
// const API_BASE_URL = 'http://192.168.233.120:3001/api'; // Use your actual URL
// const USER_ID = '6754a9268db89992d5b8221f'; // Get from auth context
// const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';
// const DEFAULT_GROUP_PIC = 'https://via.placeholder.com/40';
// // --- End Configuration ---

// const SocialFeedScreen = () => {
//   const navigation = useNavigation();
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userId] = useState(USER_ID);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [content, setContent] = useState('');
//   const [attachments, setAttachments] = useState([]);
//   const [selectedDocuments, setSelectedDocuments] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [groups, setGroups] = useState([]);
//   const [selectedGroups, setSelectedGroups] = useState([]);

//   // Comment related states
//   const [commentModalVisible, setCommentModalVisible] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState(null);
//   const [selectedPostAllowCommenting, setSelectedPostAllowCommenting] =
//     useState(true);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [commentLoading, setCommentLoading] = useState(false);

//   // Post fields
//   const [postData, setPostData] = useState({
//     privacyLevel: '0',
//     type: '0',
//     allowCommenting: true,
//     postOnTimeline: true,
//   });

//   const showMessage = message => {
//     if (Platform.OS === 'android') {
//       ToastAndroid.show(message, ToastAndroid.SHORT);
//     } else {
//       Alert.alert('Info', message);
//     }
//   };

//   // --- Data Fetching ---
//   const fetchFeedData = useCallback(async () => {
//     try {
//       const feedResponse = await axios.get(
//         `${API_BASE_URL}/feed/getSocialFeed/${userId}`,
//       );
//       const processedPosts = (feedResponse.data || []).map(post => {
//         const author = post.author || {};
//         const interaction = post.postInteraction;
//         const likesArray = interaction?.likes || [];
//         const hasLiked = interaction ? likesArray.includes(userId) : false;
//         const likesCount = interaction ? likesArray.length : 0;
//         const commentsArray = interaction?.comments || [];
//         const commentsCount = interaction ? commentsArray.length : 0;
//         return {
//           ...post,
//           author: {
//             _id: author._id || null,
//             name: author.name || 'Unknown User',
//             imgUrl: author.imgUrl || null,
//           },
//           hasLiked: hasLiked,
//           likesCount: likesCount,
//           commentsCount: commentsCount,
//           allowCommenting: post.allowCommenting !== false,
//         };
//       });
//       setPosts(processedPosts);
//     } catch (error) {
//       console.error('Error fetching feed data:', error);
//       showMessage('Failed to load feed');
//     }
//   }, [userId]);

//   const fetchGroupsData = useCallback(async () => {
//     try {
//       const groupsResponse = await axios.get(
//         `${API_BASE_URL}/user/getGroups/${userId}`,
//       );
//       const validatedGroups = (groupsResponse.data || [])
//         .filter(group => group && group._id)
//         .map(group => ({
//           _id: group._id,
//           name: group.name || 'Unnamed Group',
//           imgUrl: group.imgUrl || null,
//         }));
//       setGroups(validatedGroups);
//     } catch (error) {
//       console.error('Error fetching groups data:', error);
//     }
//   }, [userId]);

//   // --- Comment Functionality ---
//   const fetchComments = async postId => {
//     if (!postId) return;
//     try {
//       setCommentLoading(true);
//       const response = await axios.get(
//         `${API_BASE_URL}/posts/getComments/${postId}/${userId}`,
//       );
//       const formattedComments = (response.data || []).map(comment => ({
//         ...comment,
//         authorData: {
//           ...(comment.authorData || {}),
//           name: comment.authorData?.name || 'Unknown User',
//           imgUrl: comment.authorData?.imgUrl || null,
//         },
//       }));
//       setComments(formattedComments);
//     } catch (error) {
//       console.error('Error fetching comments:', error);
//       showMessage('Failed to load comments');
//       setComments([]);
//     } finally {
//       setCommentLoading(false);
//     }
//   };

//   const handleAddComment = async () => {
//     if (!selectedPostId || !newComment.trim()) {
//       showMessage('Please enter a comment');
//       return;
//     }
//     if (!selectedPostAllowCommenting) {
//       showMessage('Comments are disabled for this post');
//       return;
//     }
//     try {
//       await axios.post(`${API_BASE_URL}/posts/addComment/${selectedPostId}`, {
//         author: userId,
//         content: newComment,
//       });
//       setNewComment('');
//       fetchComments(selectedPostId);
//       setPosts(currentPosts =>
//         currentPosts.map(p => {
//           if (p._id === selectedPostId) {
//             return {...p, commentsCount: (p.commentsCount || 0) + 1};
//           }
//           return p;
//         }),
//       );
//     } catch (error) {
//       console.error('Error adding comment:', error);
//       showMessage('Failed to add comment');
//     }
//   };

//   const openCommentsModal = async postId => {
//     const post = posts.find(p => p._id === postId);
//     if (!post) return;
//     setSelectedPostId(postId);
//     setSelectedPostAllowCommenting(post.allowCommenting);
//     setCommentModalVisible(true);
//     await fetchComments(postId);
//   };

//   // --- Initial Data Load ---
//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         setLoading(true);
//         await Promise.all([fetchFeedData(), fetchGroupsData()]);
//       } catch (error) {
//         console.error('Error loading initial data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadInitialData();
//   }, [fetchFeedData, fetchGroupsData]);

//   // --- Post Interactions ---
//   const handleLike = async postId => {
//     if (!postId) return;
//     const postIndex = posts.findIndex(p => p && p._id === postId);
//     if (postIndex === -1) return;
//     const originalPost = posts[postIndex];
//     const isLiked = originalPost.hasLiked;
//     const updatedPost = {
//       ...originalPost,
//       hasLiked: !isLiked,
//       likesCount: isLiked
//         ? Math.max(0, (originalPost.likesCount || 0) - 1)
//         : (originalPost.likesCount || 0) + 1,
//     };
//     const updatedPosts = [...posts];
//     updatedPosts[postIndex] = updatedPost;
//     setPosts(updatedPosts);
//     try {
//       await axios.put(
//         `${API_BASE_URL}/posts/togglePostLike/${postId}/${userId}/${isLiked}`,
//       );
//     } catch (error) {
//       updatedPosts[postIndex] = originalPost;
//       setPosts(updatedPosts);
//       console.error('Error handling like:', error);
//       showMessage('Failed to update like');
//     }
//   };

//   const handleDeletePost = async postId => {
//     if (!postId) return;
//     try {
//       await axios.delete(`${API_BASE_URL}/posts/deletePost/${postId}`);
//       showMessage('Post deleted successfully');
//       fetchFeedData();
//     } catch (error) {
//       console.error('Error deleting post:', error);
//       showMessage('Failed to delete post');
//     }
//   };

//   const showDeleteOption = postId => {
//     const post = posts.find(p => p._id === postId);
//     if (post?.author?._id !== userId) {
//       return;
//     }
//     if (Platform.OS === 'ios') {
//       ActionSheetIOS.showActionSheetWithOptions(
//         {
//           options: ['Cancel', 'Delete Post'],
//           destructiveButtonIndex: 1,
//           cancelButtonIndex: 0,
//         },
//         buttonIndex => {
//           if (buttonIndex === 1) {
//             handleDeletePost(postId);
//           }
//         },
//       );
//     } else {
//       Alert.alert(
//         'Delete Post',
//         'Are you sure you want to delete this post?',
//         [
//           {text: 'Cancel', style: 'cancel'},
//           {
//             text: 'Delete',
//             onPress: () => handleDeletePost(postId),
//             style: 'destructive',
//           },
//         ],
//         {cancelable: true},
//       );
//     }
//   };

//   // --- File Handling ---
//   const isImageAttachment = fileName => {
//     if (!fileName) return false;
//     const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
//     return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
//   };
//   const getFullFileUrl = relativeUrl => {
//     if (!relativeUrl) return null;
//     if (
//       relativeUrl.startsWith('http://') ||
//       relativeUrl.startsWith('https://')
//     ) {
//       return relativeUrl;
//     }
//     const IMG_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
//     return `${IMG_BASE_URL}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
//   };
//   const downloadAndOpenFile = async fileUrl => {
//     const fullUrl = getFullFileUrl(fileUrl);
//     if (!fullUrl) {
//       showMessage('Invalid file URL');
//       return;
//     }
//     try {
//       const decodedUrl = decodeURIComponent(fullUrl);
//       const fileName =
//         decodedUrl.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
//       const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;
//       showMessage('Downloading file...');
//       const options = {fromUrl: fullUrl, toFile: localFile};
//       await RNFS.downloadFile(options).promise;
//       showMessage('Download complete. Opening file...');
//       await FileViewer.open(localFile, {showOpenWithDialog: true});
//     } catch (error) {
//       console.error('Error downloading/opening file:', error);
//       try {
//         const canOpen = await Linking.canOpenURL(fullUrl);
//         if (canOpen) {
//           await Linking.openURL(fullUrl);
//         } else {
//           showMessage('Cannot open this file type or URL.');
//         }
//       } catch (linkError) {
//         console.error('Error opening URL:', linkError);
//         showMessage('Failed to open file or link.');
//       }
//     }
//   };
//   const openImageViewer = imageUrl => {
//     const fullUrl = getFullFileUrl(imageUrl);
//     if (fullUrl) {
//       navigation.navigate('ImageViewer', {imageUrl: fullUrl});
//     } else {
//       showMessage('Invalid image URL');
//     }
//   };

//   // --- Add Post Modal Functionality ---
//   const toggleGroupSelection = groupId => {
//     setSelectedGroups(prevSelected =>
//       prevSelected.includes(groupId)
//         ? prevSelected.filter(id => id !== groupId)
//         : [...prevSelected, groupId],
//     );
//   };
//   const handleAttachFile = async () => {
//     try {
//       const results = await DocumentPicker.pick({
//         type: [DocumentPicker.types.allFiles],
//         allowMultiSelection: true,
//       });
//       setAttachments(prev => [...prev, ...results]);
//       setSelectedDocuments(prev => [
//         ...prev,
//         ...results.map(r => r.name || `file_${Date.now()}`),
//       ]);
//     } catch (error) {
//       if (!DocumentPicker.isCancel(error)) {
//         console.error('Error picking file:', error);
//         showMessage('Failed to attach file(s)');
//       }
//     }
//   };
//   const handleTakePhoto = async () => {
//     try {
//       const result = await launchCamera({
//         mediaType: 'photo',
//         quality: 0.8,
//         saveToPhotos: true,
//       });
//       if (!result.didCancel && result.assets && result.assets.length > 0) {
//         const newAttachments = result.assets.map(asset => ({
//           uri: asset.uri,
//           name:
//             asset.fileName ||
//             asset.uri.split('/').pop() ||
//             `photo_${Date.now()}.jpg`,
//           type: asset.type || 'image/jpeg',
//         }));
//         setAttachments(prev => [...prev, ...newAttachments]);
//         setSelectedDocuments(prev => [
//           ...prev,
//           ...newAttachments.map(a => a.name),
//         ]);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       showMessage('Failed to take photo');
//     }
//   };
//   const removeAttachment = indexToRemove => {
//     setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
//     setSelectedDocuments(prev =>
//       prev.filter((_, index) => index !== indexToRemove),
//     );
//   };
//   const handlePostFieldChange = (field, value) => {
//     setPostData(prev => ({...prev, [field]: value}));
//   };
//   const resetPostForm = () => {
//     setContent('');
//     setAttachments([]);
//     setSelectedDocuments([]);
//     setSelectedGroups([]);
//     setPostData({
//       privacyLevel: '0',
//       type: '0',
//       allowCommenting: true,
//       postOnTimeline: true,
//     });
//   };
//   const handleSubmitPost = async () => {
//     if ((!content || !content.trim()) && attachments.length === 0) {
//       showMessage('Please add content or at least one attachment.');
//       return;
//     }
//     try {
//       setUploading(true);
//       const formData = new FormData();
//       formData.append('author', userId);
//       formData.append('content', content.trim());
//       formData.append('privacyLevel', postData.privacyLevel);
//       formData.append('type', postData.type);
//       formData.append('allowCommenting', postData.allowCommenting);
//       formData.append('postOnTimeline', postData.postOnTimeline);
//       selectedGroups.forEach(groupId => {
//         formData.append('group_ids[]', groupId);
//       });
//       attachments.forEach((attachment, index) => {
//         if (attachment?.uri && attachment?.name && attachment?.type) {
//           formData.append('attachments', {
//             uri: attachment.uri,
//             name: attachment.name,
//             type: attachment.type,
//           });
//         } else {
//           console.warn(
//             `Skipping invalid attachment at index ${index}:`,
//             attachment,
//           );
//         }
//       });
//       const response = await axios.post(
//         `${API_BASE_URL}/posts/addPost`,
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );
//       if (response.status === 200 || response.status === 201) {
//         showMessage('Post created successfully!');
//         setModalVisible(false);
//         resetPostForm();
//         fetchFeedData();
//       } else {
//         showMessage(`Post created, but received status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error(
//         'Error creating post:',
//         error.response?.data || error.message,
//       );
//       showMessage(
//         error.response?.data?.message ||
//           'Failed to create post. Please try again.',
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   // --- Render Components ---

//   // AddPostModal Component
//   const AddPostModal = React.memo(() => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={modalVisible}
//       onRequestClose={() => {
//         if (!uploading) setModalVisible(false);
//       }}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Create New Post</Text>
//               <TouchableOpacity
//                 onPress={() => !uploading && setModalVisible(false)}
//                 disabled={uploading}>
//                 <Icon name="close" size={24} color="#333" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <TextInput
//                 style={styles.postInput}
//                 placeholder="What's on your mind?"
//                 placeholderTextColor="#666"
//                 multiline
//                 value={content}
//                 onChangeText={setContent}
//               />
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Post Type</Text>
//                 <View style={styles.optionsContainer}>
//                   {[
//                     {value: '0', label: 'Normal Post'},
//                     {value: '1', label: 'Timetable'},
//                     {value: '2', label: 'Datesheet'},
//                   ].map(option => (
//                     <TouchableOpacity
//                       key={option.value}
//                       style={[
//                         styles.optionButton,
//                         postData.type === option.value && styles.selectedOption,
//                       ]}
//                       onPress={() =>
//                         handlePostFieldChange('type', option.value)
//                       }>
//                       <Text
//                         style={[
//                           styles.optionText,
//                           postData.type === option.value &&
//                             styles.selectedOptionText,
//                         ]}>
//                         {option.label}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Privacy Level</Text>
//                 <View style={styles.optionsContainer}>
//                   {[
//                     {value: '0', label: 'Public'},
//                     {value: '1', label: 'Friends'},
//                     {value: '2', label: 'Private'},
//                   ].map(option => (
//                     <TouchableOpacity
//                       key={option.value}
//                       style={[
//                         styles.optionButton,
//                         postData.privacyLevel === option.value &&
//                           styles.selectedOption,
//                       ]}
//                       onPress={() =>
//                         handlePostFieldChange('privacyLevel', option.value)
//                       }>
//                       <Text
//                         style={[
//                           styles.optionText,
//                           postData.privacyLevel === option.value &&
//                             styles.selectedOptionText,
//                         ]}>
//                         {option.label}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>
//                   Post to Groups (Optional)
//                 </Text>
//                 {groups.length > 0 ? (
//                   <FlatList
//                     data={groups}
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     keyExtractor={item => item._id}
//                     renderItem={({item}) => (
//                       <TouchableOpacity
//                         style={[
//                           styles.groupItem,
//                           selectedGroups.includes(item._id) &&
//                             styles.selectedGroupItem,
//                         ]}
//                         onPress={() => toggleGroupSelection(item._id)}>
//                         <Image
//                           source={{
//                             uri:
//                               getFullFileUrl(item.imgUrl) || DEFAULT_GROUP_PIC,
//                           }}
//                           style={styles.groupImage}
//                         />
//                         <Text style={styles.groupName} numberOfLines={1}>
//                           {item.name}
//                         </Text>
//                       </TouchableOpacity>
//                     )}
//                   />
//                 ) : (
//                   <Text style={styles.noGroupsText}>
//                     No groups available to post to.
//                   </Text>
//                 )}
//               </View>
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Post Options</Text>
//                 <View style={styles.optionRow}>
//                   <Text style={styles.optionLabel}>Allow Comments</Text>
//                   <Switch
//                     value={postData.allowCommenting}
//                     onValueChange={value =>
//                       handlePostFieldChange('allowCommenting', value)
//                     }
//                     thumbColor={
//                       postData.allowCommenting ? '#14AE5C' : '#f4f3f4'
//                     }
//                     trackColor={{false: '#767577', true: '#81b0ff'}}
//                     ios_backgroundColor="#3e3e3e"
//                   />
//                 </View>
//                 <View style={styles.optionRow}>
//                   <Text style={styles.optionLabel}>Post on Timeline</Text>
//                   <Switch
//                     value={postData.postOnTimeline}
//                     onValueChange={value =>
//                       handlePostFieldChange('postOnTimeline', value)
//                     }
//                     thumbColor={postData.postOnTimeline ? '#14AE5C' : '#f4f3f4'}
//                     trackColor={{false: '#767577', true: '#81b0ff'}}
//                     ios_backgroundColor="#3e3e3e"
//                   />
//                 </View>
//               </View>
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Attachments</Text>
//                 <View style={styles.attachmentButtons}>
//                   <TouchableOpacity
//                     style={styles.attachmentButton}
//                     onPress={handleAttachFile}>
//                     <Icon name="attach-file" size={20} color="#14AE5C" />
//                     <Text style={styles.attachmentButtonText}>Add Files</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.attachmentButton}
//                     onPress={handleTakePhoto}>
//                     <Icon name="photo-camera" size={20} color="#14AE5C" />
//                     <Text style={styles.attachmentButtonText}>Take Photo</Text>
//                   </TouchableOpacity>
//                 </View>
//                 {selectedDocuments.length > 0 && (
//                   <View style={styles.attachmentsList}>
//                     {selectedDocuments.map((documentName, index) => (
//                       <View key={index} style={styles.attachmentItem}>
//                         <Icon
//                           name={
//                             isImageAttachment(documentName)
//                               ? 'image'
//                               : 'insert-drive-file'
//                           }
//                           size={20}
//                           color="#14AE5C"
//                           style={{marginRight: 8}}
//                         />
//                         <Text style={styles.attachmentName} numberOfLines={1}>
//                           {documentName || 'Unnamed file'}
//                         </Text>
//                         <TouchableOpacity
//                           onPress={() => removeAttachment(index)}>
//                           <Icon name="close" size={20} color="#ff4444" />
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//               </View>
//             </ScrollView>
//             <TouchableOpacity
//               style={[styles.postButton, uploading && styles.disabledButton]}
//               onPress={handleSubmitPost}
//               disabled={uploading}>
//               {uploading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.postButtonText}>Post</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   ));

//   // CommentsModal Component
//   const CommentsModal = React.memo(() => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={commentModalVisible}
//       onRequestClose={() => setCommentModalVisible(false)}>
//       <TouchableWithoutFeedback onPress={() => setCommentModalVisible(false)}>
//         <View style={styles.commentsModalContainer}>
//           <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
//             <View style={styles.commentsModalContent}>
//               <View style={styles.commentsModalHeader}>
//                 <Text style={styles.commentsModalTitle}>Comments</Text>
//                 <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
//                   <Icon name="close" size={24} color="#333" />
//                 </TouchableOpacity>
//               </View>
//               {commentLoading ? (
//                 <ActivityIndicator
//                   style={{flex: 1}}
//                   size="large"
//                   color="#14AE5C"
//                 />
//               ) : (
//                 <FlatList
//                   data={comments}
//                   keyExtractor={item => item._id}
//                   renderItem={({item}) => (
//                     <View style={styles.commentItem}>
//                       <Image
//                         source={{
//                           uri:
//                             getFullFileUrl(item.authorData?.imgUrl) ||
//                             DEFAULT_PROFILE_PIC,
//                         }}
//                         style={styles.commentAvatar}
//                       />
//                       <View style={styles.commentContent}>
//                         <Text style={styles.commentAuthor}>
//                           {item.authorData?.name || 'Unknown User'}
//                         </Text>
//                         <Text style={styles.commentText}>{item.content}</Text>
//                         <Text style={styles.commentTime}>
//                           {moment(item.createdAt).fromNow()}
//                         </Text>
//                       </View>
//                     </View>
//                   )}
//                   ListEmptyComponent={
//                     <Text style={styles.noCommentsText}>
//                       No comments yet. Be the first!
//                     </Text>
//                   }
//                   contentContainerStyle={styles.commentsList}
//                   showsVerticalScrollIndicator={false}
//                 />
//               )}
//               <KeyboardAvoidingView
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
//                 <View style={styles.commentInputContainer}>
//                   <TextInput
//                     style={[
//                       styles.commentInput,
//                       !selectedPostAllowCommenting && styles.disabledInput,
//                     ]}
//                     placeholder={
//                       selectedPostAllowCommenting
//                         ? 'Write a comment...'
//                         : 'Comments are disabled'
//                     }
//                     placeholderTextColor="#999"
//                     value={newComment}
//                     onChangeText={setNewComment}
//                     multiline
//                     editable={selectedPostAllowCommenting}
//                   />
//                   {selectedPostAllowCommenting && (
//                     <TouchableOpacity
//                       style={styles.commentPostButton}
//                       onPress={handleAddComment}
//                       disabled={!newComment.trim()}>
//                       <Icon
//                         name="send"
//                         size={24}
//                         color={newComment.trim() ? '#14AE5C' : '#aaa'}
//                       />
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </KeyboardAvoidingView>
//             </View>
//           </TouchableWithoutFeedback>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   ));

//   // Main Screen Render
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#14AE5C" />
//       </View>
//     );
//   }

//   return (
//     <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
//       <FlatList
//         data={posts}
//         keyExtractor={item => item._id}
//         renderItem={({item: post}) => (
//           <View style={styles.postContainer}>
//             <View style={styles.authorContainer}>
//               <Image
//                 source={{
//                   uri:
//                     getFullFileUrl(post.author?.imgUrl) || DEFAULT_PROFILE_PIC,
//                 }}
//                 style={styles.avatar}
//               />
//               <View style={styles.authorInfo}>
//                 <Text style={styles.authorName}>
//                   {post.author?.name || 'Unknown User'}
//                 </Text>
//                 <Text style={styles.postDate}>
//                   {moment(post.updatedAt).fromNow()}
//                 </Text>
//               </View>
//               {post.author?._id === userId && (
//                 <TouchableOpacity
//                   onPress={() => showDeleteOption(post._id)}
//                   style={styles.moreOptionsButton}>
//                   <Icon name="more-vert" size={24} color="#555" />
//                 </TouchableOpacity>
//               )}
//             </View>

//             {post.content ? (
//               <Text style={styles.postContent}>{post.content}</Text>
//             ) : null}

//             {post.attachments && post.attachments.length > 0 && (
//               <View style={styles.attachmentsContainer}>
//                 {post.attachments.map((attachment, index) => {
//                   if (!attachment) return null;
//                   const fileName = attachment.split('/').pop();
//                   const isImage = isImageAttachment(fileName);
//                   const fullAttachmentUrl = getFullFileUrl(attachment);
//                   if (!fullAttachmentUrl) return null;
//                   return isImage ? (
//                     <TouchableOpacity
//                       key={index}
//                       onPress={() => openImageViewer(attachment)}
//                       style={styles.imageAttachmentContainer}>
//                       <Image
//                         source={{uri: fullAttachmentUrl}}
//                         style={styles.attachmentImage}
//                         resizeMode="cover"
//                       />
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity
//                       key={index}
//                       style={styles.attachmentItemRow}
//                       onPress={() => downloadAndOpenFile(attachment)}>
//                       <Icon
//                         name="attach-file"
//                         size={20}
//                         color="#01A082"
//                         style={styles.attachmentIcon}
//                       />
//                       <Text style={styles.attachmentLink} numberOfLines={1}>
//                         {fileName || 'Download file'}
//                       </Text>
//                       <Icon
//                         name="file-download"
//                         size={20}
//                         color="#01A082"
//                         style={styles.downloadIcon}
//                       />
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>
//             )}

//             <View style={styles.interactionContainer}>
//               <TouchableOpacity
//                 style={styles.interactionButton}
//                 onPress={() => handleLike(post._id)}>
//                 <Text
//                   style={[
//                     styles.interactionText,
//                     post.hasLiked && styles.likedText,
//                   ]}>
//                   {post.likesCount}
//                 </Text>
//                 <Image
//                   source={LikeIcon}
//                   style={[
//                     styles.likeIcon,
//                     {tintColor: post.hasLiked ? '#14AE5C' : '#828282'},
//                   ]}
//                 />
//               </TouchableOpacity>
//               {post.allowCommenting && (
//                 <TouchableOpacity
//                   style={styles.interactionButton}
//                   onPress={() => openCommentsModal(post._id)}>
//                   <Text style={styles.interactionText}>
//                     {post.commentsCount}
//                   </Text>
//                   <Icon
//                     name="comment"
//                     size={20}
//                     color="#828282"
//                     style={styles.commentIcon}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.noPosts}>No posts to show yet. Create one!</Text>
//         }
//         contentContainerStyle={
//           posts.length === 0 ? styles.emptyListContainer : styles.listContainer
//         }
//         showsVerticalScrollIndicator={false}
//       />

//       <Pressable
//         style={({pressed}) => [styles.fab, pressed && styles.fabPressed]}
//         onPress={() => {
//           resetPostForm();
//           setModalVisible(true);
//         }}>
//         <Icon name="add" size={25} color="#fff" />
//       </Pressable>

//       <AddPostModal />
//       <CommentsModal />
//     </View>
//   );
// };

// // --- Styles --- (Using the same styles as before)
// const styles = StyleSheet.create({
//   container: {flex: 1, padding: 16, backgroundColor: '#f5f5f5'},
//   listContainer: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80},
//   emptyListContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingBottom: 80,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   postContainer: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 1},
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   authorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   authorInfo: {flex: 1, marginLeft: 10},
//   interactionContainer: {
//     flexDirection: 'row',
//     paddingTop: 12,
//     marginTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   attachmentsContainer: {marginTop: 12},
//   avatar: {width: 40, height: 40, borderRadius: 20},
//   authorName: {fontWeight: '600', fontSize: 15, color: '#222'},
//   postDate: {fontSize: 12, color: '#777'},
//   moreOptionsButton: {padding: 5, marginLeft: 10},
//   postContent: {
//     fontSize: 14.5,
//     color: '#333',
//     lineHeight: 21,
//     marginTop: 4,
//     marginBottom: 8,
//   },
//   interactionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 25,
//   },
//   interactionText: {
//     color: '#666',
//     fontWeight: '500',
//     fontSize: 14,
//     marginRight: 6,
//   },
//   likedText: {color: '#14AE5C', fontWeight: '600'},
//   likeIcon: {height: 20, width: 21},
//   commentIcon: {marginTop: 1},
//   noPosts: {textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888'},
//   fab: {
//     width: 56,
//     height: 56,
//     backgroundColor: '#14AE5C',
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 28,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 3},
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   fabPressed: {backgroundColor: '#108a4a'},
//   attachmentItemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 8,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: '#d0e0f0',
//   },
//   attachmentIcon: {marginRight: 10},
//   attachmentLink: {color: '#0056b3', flex: 1, marginRight: 10, fontSize: 13},
//   downloadIcon: {marginLeft: 'auto'},
//   imageAttachmentContainer: {
//     marginBottom: 8,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   attachmentImage: {width: '100%', height: 250, backgroundColor: '#eee'},
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 20,
//     paddingBottom: 30,
//     maxHeight: '90%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   modalTitle: {fontSize: 18, fontWeight: '600', color: '#222'},
//   postInput: {
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 20,
//     textAlignVertical: 'top',
//     fontSize: 15,
//     color: '#333',
//     backgroundColor: '#f9f9f9',
//   },
//   section: {marginBottom: 25},
//   sectionTitle: {
//     fontWeight: '600',
//     fontSize: 15,
//     marginBottom: 12,
//     color: '#444',
//   },
//   optionsContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
//   optionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   selectedOption: {backgroundColor: '#e0f5e9', borderColor: '#14AE5C'},
//   optionText: {color: '#555', fontSize: 13, fontWeight: '500'},
//   selectedOptionText: {color: '#107d45', fontWeight: '600'},
//   groupItem: {
//     width: 90,
//     alignItems: 'center',
//     padding: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#f9f9f9',
//   },
//   selectedGroupItem: {backgroundColor: '#e0f5e9', borderColor: '#14AE5C'},
//   groupImage: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     marginBottom: 6,
//     backgroundColor: '#eee',
//   },
//   groupName: {fontSize: 11, textAlign: 'center', color: '#444'},
//   noGroupsText: {color: '#888', fontSize: 13, marginTop: 5},
//   attachmentButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     gap: 15,
//     marginBottom: 15,
//   },
//   attachmentButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#14AE5C',
//     backgroundColor: '#f0fff8',
//   },
//   attachmentButtonText: {
//     marginLeft: 8,
//     color: '#14AE5C',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   attachmentsList: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#f7f7f7',
//     borderRadius: 8,
//   },
//   attachmentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   attachmentName: {
//     flex: 1,
//     marginLeft: 8,
//     marginRight: 8,
//     fontSize: 13,
//     color: '#444',
//   },
//   optionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   optionLabel: {color: '#333', fontSize: 15},
//   postButton: {
//     backgroundColor: '#14AE5C',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   disabledButton: {backgroundColor: '#a5d6b9'},
//   postButtonText: {color: '#fff', fontWeight: '600', fontSize: 16},
//   commentsModalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//   },
//   commentsModalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     maxHeight: '75%',
//     minHeight: '50%',
//     display: 'flex',
//     flexDirection: 'column',
//   },
//   commentsModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   commentsModalTitle: {fontSize: 18, fontWeight: '600', color: '#222'},
//   commentsList: {flexGrow: 1},
//   commentItem: {
//     flexDirection: 'row',
//     marginBottom: 15,
//     alignItems: 'flex-start',
//   },
//   commentAvatar: {width: 36, height: 36, borderRadius: 18, marginRight: 12},
//   commentContent: {
//     flex: 1,
//     backgroundColor: '#f4f6f8',
//     padding: 12,
//     borderRadius: 12,
//   },
//   commentAuthor: {
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//     fontSize: 13.5,
//   },
//   commentText: {color: '#444', marginBottom: 5, fontSize: 14, lineHeight: 19},
//   commentTime: {fontSize: 11, color: '#888', textAlign: 'right'},
//   noCommentsText: {
//     textAlign: 'center',
//     color: '#999',
//     marginTop: 30,
//     fontSize: 14,
//   },
//   commentInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingTop: 10,
//     paddingBottom: 10,
//     paddingHorizontal: 0,
//   },
//   commentInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#d5d5d5',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 10 : 8,
//     minHeight: 40,
//     maxHeight: 100,
//     fontSize: 15,
//     backgroundColor: '#fff',
//   },
//   disabledInput: {backgroundColor: '#f0f0f0', color: '#999'},
//   commentPostButton: {marginLeft: 10, padding: 5},
// });

// export default SocialFeedScreen;
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  TextInput,
  Linking,
  Platform,
  Alert,
  ToastAndroid,
  ActionSheetIOS,
  Switch,
  FlatList,
  KeyboardAvoidingView,
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
import { API_BASE_URL } from '../constants/config';

// const API_BASE_URL = 'http://192.168.215.120:3001/api';
const USER_ID = '6754a9268db89992d5b8221f';
const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';
const DEFAULT_GROUP_PIC = 'https://via.placeholder.com/40';

const SocialFeedScreen = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState(USER_ID);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
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

  // Fetch friends' posts
  const fetchFriendsPosts = async () => {
    try {
      const friendsResponse = await axios.get(
        `${API_BASE_URL}/user/getFriends/${userId}`,
      );
      const friendsIds = friendsResponse.data.map(friend => friend._id);

      const postsPromises = friendsIds.map(async friendId => {
        const response = await axios.get(
          `${API_BASE_URL}/posts/getPosts/${friendId}/`,
        );
        return response.data;
      });

      const friendsPosts = await Promise.all(postsPromises);
      return friendsPosts.flat();
    } catch (error) {
      console.error('Error fetching friends posts:', error);
      return [];
    }
  };

  // Fetch user's own posts
  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts/getPosts/${userId}/`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  };

  // Fetch group posts
  const fetchGroupPosts = async () => {
    try {
      const groupsResponse = await axios.get(
        `${API_BASE_URL}/user/getGroups/${userId}`,
      );
      const groupIds = groupsResponse.data.map(group => group._id);

      const postsPromises = groupIds.map(async groupId => {
        const response = await axios.get(
          `${API_BASE_URL}/postgroup/getGroup/${groupId}/${userId}`,
        );
        return response.data.posts || [];
      });

      const groupPosts = await Promise.all(postsPromises);
      return groupPosts.flat();
    } catch (error) {
      console.error('Error fetching group posts:', error);
      return [];
    }
  };

  // Combine all posts and remove duplicates
  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const [friendsPosts, userPosts, groupPosts] = await Promise.all([
        fetchFriendsPosts(),
        fetchUserPosts(),
        fetchGroupPosts(),
      ]);

      // Combine all posts
      const allPosts = [...friendsPosts, ...userPosts, ...groupPosts];

      // Remove duplicates by post ID
      const uniquePosts = allPosts.reduce((acc, post) => {
        if (!acc.some(p => p._id === post._id)) {
          acc.push(post);
        }
        return acc;
      }, []);

      // Sort by date (newest first)
      uniquePosts.sort(
        (a, b) =>
          new Date(b.postData.createdAt) - new Date(a.postData.createdAt),
      );
      setPosts(uniquePosts);
    } catch (error) {
      console.error('Error fetching all posts:', error);
      showMessage('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups data
  const fetchGroupsData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/getGroups/${userId}`,
      );
      const validatedGroups = (response.data || [])
        .filter(group => group && group._id)
        .map(group => ({
          _id: group._id,
          name: group.name || 'Unnamed Group',
          imgUrl: group.imgUrl || null,
        }));
      setGroups(validatedGroups);
    } catch (error) {
      console.error('Error fetching groups data:', error);
    }
  }, [userId]);

  // Fetch comments for a post
  const fetchComments = async postId => {
    if (!postId) return;
    try {
      setCommentLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/posts/getComments/${postId}/${userId}`,
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
        author: userId,
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
  // const handleLike = async (postId, currentState) => {
  //   try {
  //     const response = await axios.put(
  //       `${API_BASE_URL}/posts/togglePostLike/${postId}/${userId}/${currentState}`,
  //     );
  //     return response.data.currentState;
  //   } catch (error) {
  //     console.error('Error handling like:', error);
  //     showMessage('Failed to update like');
  //     return currentState;
  //   }
  // };
  const handleLike = async postId => {
    if (!postId) return;

    try {
      const post = posts.find(p => p && p._id === postId);
      if (!post) return;

      const isLiked = post.hasLiked;

      await axios.put(
        `${API_BASE_URL}posts/togglePostLike/${postId}/${userId}/${isLiked}`,
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
  // const showDeleteOption = postId => {
  //   const post = posts.find(p => p._id === postId);
  //   if (post?.authorData?._id !== userId) {
  //     return;
  //   }
  //   if (Platform.OS === 'ios') {
  //     ActionSheetIOS.showActionSheetWithOptions(
  //       {
  //         options: ['Cancel', 'Delete Post'],
  //         destructiveButtonIndex: 1,
  //         cancelButtonIndex: 0,
  //       },
  //       buttonIndex => {
  //         if (buttonIndex === 1) {
  //           handleDeletePost(postId);
  //         }
  //       },
  //     );
  //   } else {
  //     Alert.alert(
  //       'Delete Post',
  //       'Are you sure you want to delete this post?',
  //       [
  //         {text: 'Cancel', style: 'cancel'},
  //         {
  //           text: 'Delete',
  //           onPress: () => handleDeletePost(postId),
  //           style: 'destructive',
  //         },
  //       ],
  //       {cancelable: true},
  //     );
  //   }
  // };

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

  const downloadAndOpenFile = async fileUrl => {
    const fullUrl = getFullFileUrl(fileUrl);
    if (!fullUrl) {
      showMessage('Invalid file URL');
      return;
    }
    try {
      const decodedUrl = decodeURIComponent(fullUrl);
      const fileName =
        decodedUrl.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
      const localFile = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      showMessage('Downloading file...');
      const options = {fromUrl: fullUrl, toFile: localFile};
      await RNFS.downloadFile(options).promise;
      showMessage('Download complete. Opening file...');
      await FileViewer.open(localFile, {showOpenWithDialog: true});
    } catch (error) {
      console.error('Error downloading/opening file:', error);
      try {
        const canOpen = await Linking.canOpenURL(fullUrl);
        if (canOpen) {
          await Linking.openURL(fullUrl);
        } else {
          showMessage('Cannot open this file type or URL.');
        }
      } catch (linkError) {
        console.error('Error opening URL:', linkError);
        showMessage('Failed to open file or link.');
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
  const toggleGroupSelection = groupId => {
    setSelectedGroups(prevSelected =>
      prevSelected.includes(groupId)
        ? prevSelected.filter(id => id !== groupId)
        : [...prevSelected, groupId],
    );
  };

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
    setSelectedGroups([]);
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
      formData.append('author', userId);
      formData.append('content', content.trim());
      formData.append('privacyLevel', postData.privacyLevel);
      formData.append('type', postData.type);
      formData.append('allowCommenting', postData.allowCommenting);
      formData.append('postOnTimeline', postData.postOnTimeline);
      selectedGroups.forEach(groupId => {
        formData.append('group_ids[]', groupId);
      });
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
        fetchAllPosts();
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
        await Promise.all([fetchAllPosts(), fetchGroupsData()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14AE5C" />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      {/* Main Posts List */}
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={({item: post}) => (
          <View style={styles.postContainer}>
            <View style={styles.authorContainer}>
              <Image
                source={{
                  uri:
                    getFullFileUrl(post.postData.authorData?.imgUrl) ||
                    DEFAULT_PROFILE_PIC,
                }}
                style={styles.avatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.postData.authorData?.name || 'Unknown User'}
                </Text>
                <Text style={styles.postDate}>
                  {moment(post.postData.createdAt).fromNow()}
                </Text>
              </View>
              {post.postData.authorData?._id === userId && (
                <TouchableOpacity
                  onPress={() => showDeleteOption(post._id)}
                  style={styles.moreOptionsButton}>
                  <Icon name="more-vert" size={24} color="#555" />
                </TouchableOpacity>
              )}
            </View>

            {post.postData.content ? (
              <Text style={styles.postContent}>{post.postData.content}</Text>
            ) : null}

            {post.postData.attachments &&
              post.postData.attachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  {post.postData.attachments.map((attachment, index) => {
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
              <TouchableOpacity
                style={styles.interactionButton}
                onPress={() => {
                  setSelectedPostId(post._id);
                  setShowCommentSection(true);
                  fetchComments(post._id);
                }}>
                <Text style={styles.interactionText}>
                  {post.commentCount || 0}
                </Text>
                <Icon
                  name="comment"
                  size={20}
                  color="#828282"
                  style={styles.commentIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noPosts}>No posts to show yet. Create one!</Text>
        }
        contentContainerStyle={
          posts.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
      />

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
            <FlatList
              data={comments}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <View style={styles.commentItem}>
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
              )}
              ListEmptyComponent={
                <Text style={styles.noCommentsText}>
                  No comments yet. Be the first!
                </Text>
              }
              contentContainerStyle={styles.commentsList}
            />
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
              <Text style={styles.sectionTitle}>Post to Groups (Optional)</Text>
              {groups.length > 0 ? (
                <FlatList
                  data={groups}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item._id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.groupItem,
                        selectedGroups.includes(item._id) &&
                          styles.selectedGroupItem,
                      ]}
                      onPress={() => toggleGroupSelection(item._id)}>
                      <Image
                        source={{
                          uri: getFullFileUrl(item.imgUrl) || DEFAULT_GROUP_PIC,
                        }}
                        style={styles.groupImage}
                      />
                      <Text style={styles.groupName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noGroupsText}>
                  No groups available to post to.
                </Text>
              )}
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
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContainer: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80},
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
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
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {flex: 1, marginLeft: 10},
  avatar: {width: 40, height: 40, borderRadius: 20},
  authorName: {fontWeight: '600', fontSize: 15, color: '#222'},
  postDate: {fontSize: 12, color: '#777'},
  moreOptionsButton: {padding: 5, marginLeft: 10},
  postContent: {
    fontSize: 14.5,
    color: '#333',
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 8,
  },
  attachmentsContainer: {marginTop: 12},
  imageAttachmentContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {width: '100%', height: 250, backgroundColor: '#eee'},
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
  attachmentIcon: {marginRight: 10},
  attachmentLink: {color: '#0056b3', flex: 1, marginRight: 10, fontSize: 13},
  downloadIcon: {marginLeft: 'auto'},
  interactionContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  interactionText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
    marginRight: 6,
  },
  likedText: {color: '#14AE5C', fontWeight: '600'},
  likeIcon: {height: 20, width: 21},
  commentIcon: {marginTop: 1},
  noPosts: {textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888'},
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
  fabPressed: {backgroundColor: '#108a4a'},

  // Comments Section Styles
  commentsSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  commentsList: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 12,
    borderRadius: 12,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontSize: 13.5,
  },
  commentText: {
    color: '#444',
    marginBottom: 5,
    fontSize: 14,
    lineHeight: 19,
  },
  commentTime: {
    fontSize: 11,
    color: '#888',
    textAlign: 'right',
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    paddingBottom: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  commentPostButton: {
    marginLeft: 10,
    padding: 5,
  },

  // Post Form Styles
  postFormContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 16,
    zIndex: 10,
  },
  postFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  postFormTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  postFormScroll: {
    flex: 1,
  },
  postInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
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
  groupItem: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  selectedGroupItem: {
    opacity: 0.7,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  groupName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  noGroupsText: {
    color: '#999',
    fontStyle: 'italic',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLabel: {
    fontSize: 15,
    color: '#444',
  },
  attachmentButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    marginRight: 12,
  },
  attachmentButtonText: {
    marginLeft: 6,
    color: '#14AE5C',
    fontSize: 14,
  },
  attachmentsList: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  postButton: {
    backgroundColor: '#14AE5C',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialFeedScreen;
