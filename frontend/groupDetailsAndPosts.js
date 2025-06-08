// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ToastAndroid,
//   Alert,
//   Switch,
//   Linking,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import moment from 'moment';
// import axios from 'axios';
// import {useNavigation} from '@react-navigation/native';
// import LikeIcon from '../Images/likeIcon.png';
// import PrivateGroup from '../Images/pricateGroup.png';
// import DocumentPicker from 'react-native-document-picker';
// import {launchCamera} from 'react-native-image-picker';
// import {useFocusEffect} from '@react-navigation/native';
// import {useCallback} from 'react';
// import { API_BASE_URL } from '../constants/config';

// // const API_BASE_URL = 'http://192.168.215.120:3001/api';
// const USER_ID = '6754a9268db89992d5b8221f';
// const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';

// const GroupDetailsAndPosts = ({route, navigation}) => {
//   const {_id: groupId, imgUrl, name} = route.params;
//   const [groupInfo, setGroupInfo] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isMember, setIsMember] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isCreator, setIsCreator] = useState(false);
//   const [showCommentSection, setShowCommentSection] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [commentLoading, setCommentLoading] = useState(false);
//   const [requestSent, setRequestSent] = useState(false);
//   const [membersCount, setMembersCount] = useState(0);
//   const [leaving, setLeaving] = useState(false);
//   // Post creation state
//   const [showPostForm, setShowPostForm] = useState(false);
//   const [content, setContent] = useState('');
//   const [attachments, setAttachments] = useState([]);
//   const [selectedDocuments, setSelectedDocuments] = useState([]);
//   const [uploading, setUploading] = useState(false);
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
//   const fetchGroupMembersCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/postgroup/getGroupMembers/${groupId}`,
//       );
//       setMembersCount(response.data.members.length);
//     } catch (error) {
//       console.error('Error fetching members count:', error);
//     }
//   };
//   const fetchGroupData = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${API_BASE_URL}/postgroup/getGroup/${groupId}/${USER_ID}`,
//       );
//       const data = response.data;

//       setGroupInfo(data.groupInfo);
//       setPosts(data.posts || []);
//       setIsMember(data.isMember);
//       setIsAdmin(data.isAdmin);
//       setIsCreator(data.isCreator);
//       console.log(response.data);
//     } catch (error) {
//       console.error('Error fetching group data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchComments = async postId => {
//     if (!postId) return;
//     try {
//       setCommentLoading(true);
//       const response = await axios.get(
//         `${API_BASE_URL}/posts/getComments/${postId}/${USER_ID}`,
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
//       setComments([]);
//     } finally {
//       setCommentLoading(false);
//     }
//   };

//   const handleAddComment = async () => {
//     if (!selectedPostId || !newComment.trim()) return;

//     try {
//       await axios.post(`${API_BASE_URL}/posts/addComment/${selectedPostId}`, {
//         author: USER_ID,
//         content: newComment,
//       });
//       setNewComment('');
//       fetchComments(selectedPostId);
//       // Update comment count in posts list
//       setPosts(prevPosts =>
//         prevPosts.map(post =>
//           post._id === selectedPostId
//             ? {...post, commentCount: (post.commentCount || 0) + 1}
//             : post,
//         ),
//       );
//     } catch (error) {
//       console.error('Error adding comment:', error);
//     }
//   };

//   const handleLike = async postId => {
//     try {
//       const post = posts.find(p => p._id === postId);
//       if (!post) return;

//       const isLiked = post.hasLiked;

//       await axios.put(
//         `${API_BASE_URL}/posts/togglePostLike/${postId}/${USER_ID}/${isLiked}`,
//       );

//       setPosts(prevPosts =>
//         prevPosts.map(p =>
//           p._id === postId
//             ? {
//                 ...p,
//                 hasLiked: !isLiked,
//                 likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
//               }
//             : p,
//         ),
//       );
//     } catch (error) {
//       console.error('Error handling like:', error);
//     }
//   };

//   // Post creation handlers
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
//       formData.append('author', USER_ID);
//       formData.append('content', content.trim());
//       formData.append('privacyLevel', postData.privacyLevel);
//       formData.append('type', postData.type);
//       formData.append('allowCommenting', postData.allowCommenting);
//       formData.append('postOnTimeline', postData.postOnTimeline);
//       formData.append('group_ids[]', groupId);

//       attachments.forEach((attachment, index) => {
//         if (attachment?.uri && attachment?.name && attachment?.type) {
//           formData.append('attachments', {
//             uri: attachment.uri,
//             name: attachment.name,
//             type: attachment.type,
//           });
//         }
//       });

//       const response = await axios.post(
//         `${API_BASE_URL}/posts/addPost`,
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       if (response.status === 200 || response.status === 201) {
//         showMessage('Post created successfully!');
//         setShowPostForm(false);
//         resetPostForm();
//         fetchGroupData(); // Refresh posts
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

//   const getFullFileUrl = relativeUrl => {
//     if (!relativeUrl) return null;
//     if (
//       relativeUrl.startsWith('http://') ||
//       relativeUrl.startsWith('https://')
//     ) {
//       return relativeUrl;
//     }
//     const IMG_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
//     return `${IMG_BASE_URL}${
//       relativeUrl.startsWith('/') ? '' : '/'
//     }${relativeUrl}`;
//   };

//   const isImageAttachment = fileName => {
//     if (!fileName) return false;
//     const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
//     return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
//   };

//   const openImageViewer = imageUrl => {
//     const fullUrl = getFullFileUrl(imageUrl);
//     if (fullUrl) {
//       navigation.navigate('ImageViewer', {imageUrl: fullUrl});
//     }
//   };
//   const showDeleteOption = postId => {
//     const post = posts.find(p => p._id === postId);
//     if (!post?.isAuthor && !isAdmin && !isCreator) {
//       return;
//     }

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
//   };

//   const handleDeletePost = async postId => {
//     console.log('Deleting post with ID:', postId);
//     try {
//       const postToDelete = posts.find(post => post._id === postId);
//       if (!postToDelete) {
//         showMessage('Post not found');
//         return;
//       }

//       const postDataId = postToDelete.postData?._id;
//       if (!postDataId) {
//         showMessage('Invalid post data');
//         return;
//       }

//       await axios.delete(`${API_BASE_URL}/posts/deletePost/${postDataId}`);

//       // Update state properly
//       setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
//       showMessage('Post deleted successfully');
//     } catch (error) {
//       console.error('Error deleting post:', error);
//       showMessage('Failed to delete post');
//     }
//   };

//   const handleJoinRequest = async () => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/postgroup/joinGroup/${groupId}/${USER_ID}`,
//       );
//       showMessage(response.data.message);
//       if (response.data.message === 'Requested..') {
//         setRequestSent(true);
//       } else {
//         fetchGroupData(); // Refresh group data if joined directly
//       }
//     } catch (error) {
//       console.error('Error sending join request:', error);
//       showMessage('Failed to send join request');
//     }
//   };

//   const handleLeaveGroup = async () => {
//     if (isCreator) {
//       Alert.alert(
//         'You Are The Creator',
//         'If you leave this group, it will be permanently deleted. Are you sure?',
//         [
//           {
//             text: 'Cancel',
//             style: 'cancel',
//           },
//           {
//             text: 'Leave and Delete',
//             onPress: async () => {
//               try {
//                 setLeaving(true);
//                 const response = await axios.delete(
//                   `${API_BASE_URL}/postgroup/deleteGroup/${groupId}`,
//                 );

//                 if (response.data.success) {
//                   Alert.alert('Success', 'Group has been deleted');
//                   navigation.goBack();
//                 } else {
//                   throw new Error(
//                     response.data.message || 'Failed to delete group',
//                   );
//                 }
//               } catch (error) {
//                 console.error('Delete group error:', error);
//                 Alert.alert(
//                   'Error',
//                   error.response?.data?.message || 'Failed to delete group',
//                 );
//               } finally {
//                 setLeaving(false);
//               }
//             },
//             style: 'destructive',
//           },
//         ],
//       );
//     } else {
//       Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Leave',
//           onPress: async () => {
//             try {
//               setLeaving(true);
//               const response = await axios.post(
//                 `${API_BASE_URL}/postgroup/removeMember/${groupId}/${USER_ID}`,
//               );

//               if (response.data.message === 'Member removed successfully') {
//                 Alert.alert('Success', 'You have left the group');
//                 navigation.goBack();
//               } else {
//                 throw new Error(
//                   response.data.message || 'Failed to leave group',
//                 );
//               }
//             } catch (error) {
//               console.error('Leave group error:', error);
//               Alert.alert(
//                 'Error',
//                 error.response?.data?.error || 'Failed to leave group',
//               );
//             } finally {
//               setLeaving(false);
//             }
//           },
//           style: 'destructive',
//         },
//       ]);
//     }
//   };
//   const navigateToGroupSettings = () => {
//     navigation.navigate('GroupSettings', {
//       groupId,
//       isAdmin,
//       isCreator,
//       groupInfo,
//     });
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchGroupData();
//       fetchGroupMembersCount();
//     }, [groupId, membersCount]),
//   );
//   const renderPostItem = ({item: post}) => (
//     <View style={styles.postContainer}>
//       <View style={styles.authorContainer}>
//         <Image
//           source={{
//             uri:
//               getFullFileUrl(post.postData?.authorData?.imgUrl) ||
//               DEFAULT_PROFILE_PIC,
//           }}
//           style={styles.avatar}
//         />
//         <View style={styles.authorInfo}>
//           <Text style={styles.authorName}>
//             {post.postData?.authorData?.name || 'Unknown User'}
//           </Text>
//           <Text style={styles.postDate}>
//             {moment(post.postData?.createdAt).fromNow()}
//           </Text>
//         </View>
//         {post.isAuthor && (
//           <TouchableOpacity
//             style={styles.moreOptionsButton}
//             onPress={() => showDeleteOption(post._id)}>
//             <Icon name="more-vert" size={24} color="#555" />
//           </TouchableOpacity>
//         )}
//       </View>

//       {post.postData?.content && (
//         <Text style={styles.postContent}>{post.postData.content}</Text>
//       )}

//       {post.postData?.attachments?.length > 0 && (
//         <View style={styles.attachmentsContainer}>
//           {post.postData.attachments.map((attachment, index) => {
//             if (!attachment) return null;
//             const fileName = attachment.split('/').pop();
//             const isImage = isImageAttachment(fileName);
//             const fullUrl = getFullFileUrl(attachment);
//             if (!fullUrl) return null;

//             return isImage ? (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => openImageViewer(attachment)}>
//                 <Image
//                   source={{uri: fullUrl}}
//                   style={styles.attachmentImage}
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.attachmentItemRow}
//                 onPress={() => Linking.openURL(fullUrl)}>
//                 <Icon
//                   name="attach-file"
//                   size={20}
//                   color="#01A082"
//                   style={styles.attachmentIcon}
//                 />
//                 <Text style={styles.attachmentLink} numberOfLines={1}>
//                   {fileName || 'Download file'}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       <View style={styles.interactionContainer}>
//         <TouchableOpacity
//           style={styles.interactionButton}
//           onPress={() => handleLike(post._id)}>
//           <Text style={styles.interactionText}>{post.likesCount || 0}</Text>
//           <Image
//             source={LikeIcon}
//             style={{
//               height: 18.58,
//               width: 19.82,
//               tintColor: post.hasLiked ? '#14AE5C' : '#828282',
//             }}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.interactionButton}
//           onPress={() => {
//             setSelectedPostId(post._id);
//             setShowCommentSection(true);
//             fetchComments(post._id);
//           }}>
//           <Text style={styles.interactionText}>{post.commentCount || 0}</Text>
//           <Icon
//             name="comment"
//             size={20}
//             color="#828282"
//             style={styles.commentIcon}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#14AE5C" />
//       </View>
//     );
//   }

//   // Show private group content if not a member
//   if (groupInfo?.is_private && !isMember) {
//     return (
//       <View style={styles.privateGroupContainer}>
//         <Image source={PrivateGroup} style={styles.privateGroupImage} />
//         <Text style={styles.privateGroupTitle}>This is a private group</Text>
//         <Text style={styles.privateGroupText}>
//           You need to be a member to view its content
//         </Text>
//         {requestSent ? (
//           <View style={styles.requestSentContainer}>
//             <Text style={styles.requestSentText}>Request Sent</Text>
//             <Icon name="check-circle" size={24} color="#14AE5C" />
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={styles.requestJoinButton}
//             onPress={handleJoinRequest}>
//             <Text style={styles.requestJoinButtonText}>Request to Join</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         {/* Group Header */}
//         <View style={styles.groupHeader}>
//           <Image
//             source={{uri: getFullFileUrl(imgUrl)}}
//             style={styles.groupImage}
//           />
//           <Text style={styles.groupName}>{name}</Text>
//           <Text style={styles.groupMembers}>
//             {membersCount} members •{' '}
//             {groupInfo?.is_private ? 'Private' : 'Public'} group
//           </Text>
//           <Text style={styles.groupDescription}>
//             {groupInfo?.aboutGroup || 'No description available'}
//           </Text>

//           <View style={styles.groupActions}>
//             {isMember ? (
//               <>
//                 <TouchableOpacity
//                   style={styles.actionButton}
//                   onPress={handleLeaveGroup}>
//                   <Text style={styles.actionButtonText}>Leave Group</Text>
//                 </TouchableOpacity>
//                 {(isAdmin || isCreator) && (
//                   <TouchableOpacity
//                     style={[styles.actionButton, {marginLeft: 10}]}
//                     onPress={navigateToGroupSettings}>
//                     <Text style={styles.actionButtonText}>Group Settings</Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             ) : !groupInfo?.is_private ? (
//               <TouchableOpacity
//                 style={styles.joinButton}
//                 onPress={handleJoinRequest}>
//                 <Text style={styles.joinButtonText}>Join Group</Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         </View>

//         {/* Posts List */}
//         <FlatList
//           data={posts}
//           keyExtractor={item => item._id}
//           renderItem={renderPostItem}
//           ListEmptyComponent={
//             <Text style={styles.noPosts}>No posts in this group yet</Text>
//           }
//           scrollEnabled={false}
//         />
//       </ScrollView>

//       {/* Comment Section */}
//       {showCommentSection && (
//         <View style={styles.commentsSection}>
//           <View style={styles.commentsHeader}>
//             <Text style={styles.commentsTitle}>Comments</Text>
//             <TouchableOpacity onPress={() => setShowCommentSection(false)}>
//               <Icon name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>
//           {commentLoading ? (
//             <ActivityIndicator size="large" color="#14AE5C" />
//           ) : (
//             <FlatList
//               data={comments}
//               keyExtractor={item => item._id}
//               renderItem={({item}) => (
//                 <View style={styles.commentItem}>
//                   <Image
//                     source={{
//                       uri:
//                         getFullFileUrl(item.authorData?.imgUrl) ||
//                         DEFAULT_PROFILE_PIC,
//                     }}
//                     style={styles.commentAvatar}
//                   />
//                   <View style={styles.commentContent}>
//                     <Text style={styles.commentAuthor}>
//                       {item.authorData?.name || 'Unknown User'}
//                     </Text>
//                     <Text style={styles.commentText}>{item.content}</Text>
//                     <Text style={styles.commentTime}>
//                       {moment(item.createdAt).fromNow()}
//                     </Text>
//                   </View>
//                 </View>
//               )}
//               ListEmptyComponent={
//                 <Text style={styles.noCommentsText}>
//                   No comments yet. Be the first!
//                 </Text>
//               }
//               contentContainerStyle={styles.commentsList}
//             />
//           )}
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
//             <View style={styles.commentInputContainer}>
//               <TextInput
//                 style={styles.commentInput}
//                 placeholder="Write a comment..."
//                 placeholderTextColor="#999"
//                 value={newComment}
//                 onChangeText={setNewComment}
//                 multiline
//               />
//               <TouchableOpacity
//                 style={styles.commentPostButton}
//                 onPress={handleAddComment}
//                 disabled={!newComment.trim()}>
//                 <Icon
//                   name="send"
//                   size={24}
//                   color={newComment.trim() ? '#14AE5C' : '#aaa'}
//                 />
//               </TouchableOpacity>
//             </View>
//           </KeyboardAvoidingView>
//         </View>
//       )}

//       {/* Enhanced Post Form */}
//       {showPostForm && (
//         <View style={styles.postFormContainer}>
//           <View style={styles.postFormHeader}>
//             <Text style={styles.postFormTitle}>Create New Post</Text>
//             <TouchableOpacity
//               onPress={() => !uploading && setShowPostForm(false)}>
//               <Icon name="close" size={24} color="#333" />
//             </TouchableOpacity>
//           </View>
//           <ScrollView style={styles.postFormScroll}>
//             <TextInput
//               style={styles.postInput}
//               placeholder="What's on your mind?"
//               placeholderTextColor="#666"
//               multiline
//               value={content}
//               onChangeText={setContent}
//             />

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Post Type</Text>
//               <View style={styles.optionsContainer}>
//                 {[
//                   {value: '0', label: 'Normal Post'},
//                   {value: '1', label: 'Timetable'},
//                   {value: '2', label: 'Datesheet'},
//                 ].map(option => (
//                   <TouchableOpacity
//                     key={option.value}
//                     style={[
//                       styles.optionButton,
//                       postData.type === option.value && styles.selectedOption,
//                     ]}
//                     onPress={() => handlePostFieldChange('type', option.value)}>
//                     <Text
//                       style={[
//                         styles.optionText,
//                         postData.type === option.value &&
//                           styles.selectedOptionText,
//                       ]}>
//                       {option.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Privacy Level</Text>
//               <View style={styles.optionsContainer}>
//                 {[
//                   {value: '0', label: 'Public'},
//                   {value: '1', label: 'Friends'},
//                   {value: '2', label: 'Private'},
//                 ].map(option => (
//                   <TouchableOpacity
//                     key={option.value}
//                     style={[
//                       styles.optionButton,
//                       postData.privacyLevel === option.value &&
//                         styles.selectedOption,
//                     ]}
//                     onPress={() =>
//                       handlePostFieldChange('privacyLevel', option.value)
//                     }>
//                     <Text
//                       style={[
//                         styles.optionText,
//                         postData.privacyLevel === option.value &&
//                           styles.selectedOptionText,
//                       ]}>
//                       {option.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Post Options</Text>
//               <View style={styles.optionRow}>
//                 <Text style={styles.optionLabel}>Allow Comments</Text>
//                 <Switch
//                   value={postData.allowCommenting}
//                   onValueChange={value =>
//                     handlePostFieldChange('allowCommenting', value)
//                   }
//                   thumbColor={postData.allowCommenting ? '#14AE5C' : '#f4f3f4'}
//                   trackColor={{false: '#767577', true: '#81b0ff'}}
//                 />
//               </View>
//               <View style={styles.optionRow}>
//                 <Text style={styles.optionLabel}>Post on Timeline</Text>
//                 <Switch
//                   value={postData.postOnTimeline}
//                   onValueChange={value =>
//                     handlePostFieldChange('postOnTimeline', value)
//                   }
//                   thumbColor={postData.postOnTimeline ? '#14AE5C' : '#f4f3f4'}
//                   trackColor={{false: '#767577', true: '#81b0ff'}}
//                 />
//               </View>
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Attachments</Text>
//               <View style={styles.attachmentButtons}>
//                 <TouchableOpacity
//                   style={styles.attachmentButton}
//                   onPress={handleAttachFile}>
//                   <Icon name="attach-file" size={20} color="#14AE5C" />
//                   <Text style={styles.attachmentButtonText}>Add Files</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.attachmentButton}
//                   onPress={handleTakePhoto}>
//                   <Icon name="photo-camera" size={20} color="#14AE5C" />
//                   <Text style={styles.attachmentButtonText}>Take Photo</Text>
//                 </TouchableOpacity>
//               </View>
//               {selectedDocuments.length > 0 && (
//                 <View style={styles.attachmentsList}>
//                   {selectedDocuments.map((documentName, index) => (
//                     <View key={index} style={styles.attachmentItem}>
//                       <Icon
//                         name={
//                           isImageAttachment(documentName)
//                             ? 'image'
//                             : 'insert-drive-file'
//                         }
//                         size={20}
//                         color="#14AE5C"
//                         style={{marginRight: 8}}
//                       />
//                       <Text style={styles.attachmentName} numberOfLines={1}>
//                         {documentName || 'Unnamed file'}
//                       </Text>
//                       <TouchableOpacity onPress={() => removeAttachment(index)}>
//                         <Icon name="close" size={20} color="#ff4444" />
//                       </TouchableOpacity>
//                     </View>
//                   ))}
//                 </View>
//               )}
//             </View>
//           </ScrollView>
//           <TouchableOpacity
//             style={[styles.postButton, uploading && styles.disabledButton]}
//             onPress={handleSubmitPost}
//             disabled={uploading}>
//             {uploading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.postButtonText}>Post</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Floating Action Button */}
//       {isMember && !showPostForm && !showCommentSection && (
//         <TouchableOpacity
//           style={styles.createPostButton}
//           onPress={() => {
//             resetPostForm();
//             setShowPostForm(true);
//           }}>
//           <Icon name="add" size={24} color="#fff" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   groupHeader: {
//     backgroundColor: '#fff',
//     padding: 16,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   groupImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   groupName: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#333',
//   },
//   groupMembers: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 12,
//   },
//   groupDescription: {
//     fontSize: 15,
//     color: '#444',
//     textAlign: 'center',
//     marginBottom: 16,
//     paddingHorizontal: 20,
//   },
//   groupActions: {
//     flexDirection: 'row',
//     width: '100%',
//     justifyContent: 'center',
//   },
//   actionButton: {
//     backgroundColor: '#e0e0e0',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   actionButtonText: {
//     color: '#333',
//     fontWeight: '500',
//   },
//   joinButton: {
//     backgroundColor: '#14AE5C',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   joinButtonText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   postContainer: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 12,
//     borderRadius: 8,
//   },
//   authorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   authorInfo: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   authorName: {
//     fontWeight: '600',
//     fontSize: 15,
//     color: '#222',
//   },
//   postDate: {
//     fontSize: 12,
//     color: '#777',
//   },
//   moreOptionsButton: {
//     padding: 5,
//   },
//   postContent: {
//     fontSize: 14.5,
//     color: '#333',
//     lineHeight: 21,
//     marginBottom: 8,
//   },
//   attachmentsContainer: {
//     marginTop: 12,
//   },
//   attachmentImage: {
//     width: '100%',
//     height: 250,
//     borderRadius: 8,
//     backgroundColor: '#eee',
//   },
//   attachmentItemRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   attachmentIcon: {
//     marginRight: 10,
//   },
//   attachmentLink: {
//     color: '#0056b3',
//     flex: 1,
//     fontSize: 13,
//   },
//   interactionContainer: {
//     flexDirection: 'row',
//     paddingTop: 12,
//     marginTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
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
//   commentIcon: {
//     marginTop: 1,
//   },
//   noPosts: {
//     textAlign: 'center',
//     marginVertical: 30,
//     fontSize: 16,
//     color: '#888',
//   },
//   createPostButton: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#14AE5C',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
//   commentsSection: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 16,
//     maxHeight: '60%',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: -2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   commentsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   commentsTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//   },
//   commentsList: {
//     flexGrow: 1,
//     paddingBottom: 16,
//   },
//   commentItem: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     alignItems: 'flex-start',
//   },
//   commentAvatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     marginRight: 12,
//   },
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
//   commentText: {
//     color: '#444',
//     marginBottom: 5,
//     fontSize: 14,
//     lineHeight: 19,
//   },
//   commentTime: {
//     fontSize: 11,
//     color: '#888',
//     textAlign: 'right',
//   },
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
//   commentPostButton: {
//     marginLeft: 10,
//     padding: 5,
//   },
//   postFormContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     padding: 16,
//     maxHeight: '80%',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: -2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   postFormHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   postFormTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#222',
//   },
//   postFormScroll: {
//     flex: 1,
//     marginBottom: 16,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#444',
//     marginBottom: 12,
//   },
//   optionsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 8,
//   },
//   optionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   selectedOption: {
//     backgroundColor: '#14AE5C',
//     borderColor: '#14AE5C',
//   },
//   optionText: {
//     fontSize: 14,
//     color: '#555',
//   },
//   selectedOptionText: {
//     color: '#fff',
//   },
//   optionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   optionLabel: {
//     fontSize: 15,
//     color: '#444',
//   },
//   attachmentButtons: {
//     flexDirection: 'row',
//     marginBottom: 12,
//   },
//   attachmentButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#f0f8f0',
//     borderRadius: 8,
//     marginRight: 12,
//   },
//   attachmentButtonText: {
//     marginLeft: 6,
//     color: '#14AE5C',
//     fontSize: 14,
//   },
//   attachmentsList: {
//     marginTop: 8,
//   },
//   attachmentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   attachmentName: {
//     flex: 1,
//     fontSize: 14,
//     color: '#555',
//     marginRight: 8,
//   },
//   disabledButton: {
//     backgroundColor: '#aaa',
//   },
//   postInput: {
//     fontSize: 16,
//     color: '#333',
//     minHeight: 100,
//     textAlignVertical: 'top',
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   postButton: {
//     backgroundColor: '#14AE5C',
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   postButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   privateGroupContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   privateGroupImage: {
//     width: 200,
//     height: 200,
//     marginBottom: 20,
//   },
//   privateGroupTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   privateGroupText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//     paddingHorizontal: 40,
//   },
//   requestJoinButton: {
//     backgroundColor: '#14AE5C',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//   },
//   requestJoinButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   requestSentContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f8f0',
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//   },
//   requestSentText: {
//     color: '#14AE5C',
//     fontSize: 16,
//     fontWeight: '500',
//     marginRight: 10,
//   },
//   pinnedBadge: {
//     backgroundColor: '#14AE5C',
//     color: 'white',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//     fontSize: 12,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   imageAttachmentContainer: {
//     marginBottom: 10,
//   },
//   attachmentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#f0f8ff',
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   downloadIcon: {
//     marginLeft: 10,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     width: '90%',
//     maxHeight: '80%',
//     borderRadius: 10,
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#14AE5C',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
//   sectionSelector: {
//     marginVertical: 10,
//     paddingHorizontal: 10,
//   },
//   sectionButton: {
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 15,
//     backgroundColor: '#f0f0f0',
//     marginRight: 10,
//   },
//   selectedSectionButton: {
//     backgroundColor: '#14AE5C',
//   },
//   sectionButtonText: {
//     color: '#555',
//   },
//   selectedSectionText: {
//     color: 'white',
//   },
//   toggleButton: {
//     padding: 5,
//   },
//   joinToViewContainer: {
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     margin: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   joinToViewText: {
//     color: '#666',
//     textAlign: 'center',
//     fontSize: 16,
//   },
// });
// export default GroupDetailsAndPosts;

// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ToastAndroid,
//   Alert,
//   Switch,
//   Linking,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import moment from 'moment';
// import axios from 'axios';
// import {useNavigation} from '@react-navigation/native';
// import LikeIcon from '../Images/likeIcon.png';
// import PrivateGroup from '../Images/pricateGroup.png';
// import DocumentPicker from 'react-native-document-picker';
// import {launchCamera} from 'react-native-image-picker';
// import {useFocusEffect} from '@react-navigation/native';
// import {useCallback} from 'react';
// import {API_BASE_URL} from '../constants/config';

// // const API_BASE_URL = 'http://192.168.215.120:3001/api';
// const USER_ID = '6754a9268db89992d5b8221e';
// const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';

// const GroupDetailsAndPosts = ({route, navigation}) => {
//   const {_id: groupId, imgUrl, name} = route.params;
//   const [groupInfo, setGroupInfo] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isMember, setIsMember] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [isCreator, setIsCreator] = useState(false);
//   const [showCommentSection, setShowCommentSection] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [commentLoading, setCommentLoading] = useState(false);
//   const [requestSent, setRequestSent] = useState(false);
//   const [membersCount, setMembersCount] = useState(0);
//   const [leaving, setLeaving] = useState(false);
//   // Post creation state
//   const [showPostForm, setShowPostForm] = useState(false);
//   const [content, setContent] = useState('');
//   const [attachments, setAttachments] = useState([]);
//   const [selectedDocuments, setSelectedDocuments] = useState([]);
//   const [uploading, setUploading] = useState(false);
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
//   const fetchGroupMembersCount = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/postgroup/getGroupMembers/${groupId}`,
//       );
//       setMembersCount(response.data.members.length);
//     } catch (error) {
//       console.error('Error fetching members count:', error);
//     }
//   };
//   const fetchGroupData = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${API_BASE_URL}/postgroup/getGroup/${groupId}/${USER_ID}`,
//       );
//       const data = response.data;

//       setGroupInfo(data.groupInfo);
//       setPosts(data.posts || []);
//       setIsMember(data.isMember);
//       setIsAdmin(data.isAdmin);
//       setIsCreator(data.isCreator);
//       console.log(response.data);
//     } catch (error) {
//       console.error('Error fetching group data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // In your fetchGroupData function, modify it like this:
//   // const fetchGroupData = async () => {
//   //   try {
//   //     setLoading(true);
//   //     const response = await axios.get(
//   //       `${API_BASE_URL}/postgroup/getGroup/${groupId}/${USER_ID}`,
//   //     );
//   //     const data = response.data;

//   //     setGroupInfo(data.groupInfo);
//   //     setPosts(data.posts || []);

//   //     // Fix the membership status for private groups
//   //     const isActuallyMember =
//   //       data.isMember &&
//   //       (!data.groupInfo?.is_private || data.isAdmin || data.isCreator);

//   //     setIsMember(isActuallyMember);
//   //     setIsAdmin(data.isAdmin);
//   //     setIsCreator(data.isCreator);
//   //     console.log('Check if he is member', isMember);
//   //   } catch (error) {
//   //     console.error('Error fetching group data:', error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const fetchComments = async postId => {
//     if (!postId) return;
//     try {
//       setCommentLoading(true);
//       const response = await axios.get(
//         `${API_BASE_URL}/posts/getComments/${postId}/${USER_ID}`,
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
//       setComments([]);
//     } finally {
//       setCommentLoading(false);
//     }
//   };

//   const handleAddComment = async () => {
//     if (!selectedPostId || !newComment.trim()) return;

//     try {
//       await axios.post(`${API_BASE_URL}/posts/addComment/${selectedPostId}`, {
//         author: USER_ID,
//         content: newComment,
//       });
//       setNewComment('');
//       fetchComments(selectedPostId);
//       // Update comment count in posts list
//       setPosts(prevPosts =>
//         prevPosts.map(post =>
//           post._id === selectedPostId
//             ? {...post, commentCount: (post.commentCount || 0) + 1}
//             : post,
//         ),
//       );
//     } catch (error) {
//       console.error('Error adding comment:', error);
//     }
//   };

//   const handleLike = async postId => {
//     try {
//       const post = posts.find(p => p._id === postId);
//       if (!post) return;

//       const isLiked = post.hasLiked;

//       await axios.put(
//         `${API_BASE_URL}/posts/togglePostLike/${postId}/${USER_ID}/${isLiked}`,
//       );

//       setPosts(prevPosts =>
//         prevPosts.map(p =>
//           p._id === postId
//             ? {
//                 ...p,
//                 hasLiked: !isLiked,
//                 likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
//               }
//             : p,
//         ),
//       );
//     } catch (error) {
//       console.error('Error handling like:', error);
//     }
//   };

//   // Post creation handlers
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
//       formData.append('author', USER_ID);
//       formData.append('content', content.trim());
//       formData.append('privacyLevel', postData.privacyLevel);
//       formData.append('type', postData.type);
//       formData.append('allowCommenting', postData.allowCommenting);
//       formData.append('postOnTimeline', postData.postOnTimeline);
//       formData.append('group_ids[]', groupId);

//       attachments.forEach((attachment, index) => {
//         if (attachment?.uri && attachment?.name && attachment?.type) {
//           formData.append('attachments', {
//             uri: attachment.uri,
//             name: attachment.name,
//             type: attachment.type,
//           });
//         }
//       });

//       const response = await axios.post(
//         `${API_BASE_URL}/posts/addPost`,
//         formData,
//         {headers: {'Content-Type': 'multipart/form-data'}},
//       );

//       if (response.status === 200 || response.status === 201) {
//         showMessage('Post created successfully!');
//         setShowPostForm(false);
//         resetPostForm();
//         fetchGroupData(); // Refresh posts
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

//   const getFullFileUrl = relativeUrl => {
//     if (!relativeUrl) return null;
//     if (
//       relativeUrl.startsWith('http://') ||
//       relativeUrl.startsWith('https://')
//     ) {
//       return relativeUrl;
//     }
//     const IMG_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
//     return `${IMG_BASE_URL}${
//       relativeUrl.startsWith('/') ? '' : '/'
//     }${relativeUrl}`;
//   };

//   const isImageAttachment = fileName => {
//     if (!fileName) return false;
//     const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
//     return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
//   };

//   const openImageViewer = imageUrl => {
//     const fullUrl = getFullFileUrl(imageUrl);
//     if (fullUrl) {
//       navigation.navigate('ImageViewer', {imageUrl: fullUrl});
//     }
//   };
//   const showDeleteOption = postId => {
//     const post = posts.find(p => p._id === postId);
//     if (!post?.isAuthor && !isAdmin && !isCreator) {
//       return;
//     }

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
//   };

//   const handleDeletePost = async postId => {
//     console.log('Deleting post with ID:', postId);
//     try {
//       const postToDelete = posts.find(post => post._id === postId);
//       if (!postToDelete) {
//         showMessage('Post not found');
//         return;
//       }

//       const postDataId = postToDelete.postData?._id;
//       if (!postDataId) {
//         showMessage('Invalid post data');
//         return;
//       }

//       await axios.delete(`${API_BASE_URL}/posts/deletePost/${postDataId}`);

//       // Update state properly
//       setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
//       showMessage('Post deleted successfully');
//     } catch (error) {
//       console.error('Error deleting post:', error);
//       showMessage('Failed to delete post');
//     }
//   };

//   const handleJoinRequest = async () => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/postgroup/joinGroup/${groupId}/${USER_ID}`,
//       );
//       showMessage(response.data.message);
//       if (response.data.message === 'Requested..') {
//         setRequestSent(true);
//       } else {
//         // If group is public and joined directly, refresh data
//         fetchGroupData();
//         fetchGroupMembersCount();
//       }
//     } catch (error) {
//       console.error('Error sending join request:', error);
//       showMessage('Failed to send join request');
//     }
//   };

//   const handleLeaveGroup = async () => {
//     if (isCreator) {
//       Alert.alert(
//         'You Are The Creator',
//         'If you leave this group, it will be permanently deleted. Are you sure?',
//         [
//           {
//             text: 'Cancel',
//             style: 'cancel',
//           },
//           {
//             text: 'Leave and Delete',
//             onPress: async () => {
//               try {
//                 setLeaving(true);
//                 const response = await axios.delete(
//                   `${API_BASE_URL}/postgroup/deleteGroup/${groupId}`,
//                 );

//                 if (response.data.success) {
//                   Alert.alert('Success', 'Group has been deleted');
//                   navigation.goBack();
//                 } else {
//                   throw new Error(
//                     response.data.message || 'Failed to delete group',
//                   );
//                 }
//               } catch (error) {
//                 console.error('Delete group error:', error);
//                 Alert.alert(
//                   'Error',
//                   error.response?.data?.message || 'Failed to delete group',
//                 );
//               } finally {
//                 setLeaving(false);
//               }
//             },
//             style: 'destructive',
//           },
//         ],
//       );
//     } else {
//       Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Leave',
//           onPress: async () => {
//             try {
//               setLeaving(true);
//               const response = await axios.post(
//                 `${API_BASE_URL}/postgroup/removeMember/${groupId}/${USER_ID}`,
//               );

//               if (response.data.message === 'Member removed successfully') {
//                 Alert.alert('Success', 'You have left the group');
//                 navigation.goBack();
//               } else {
//                 throw new Error(
//                   response.data.message || 'Failed to leave group',
//                 );
//               }
//             } catch (error) {
//               console.error('Leave group error:', error);
//               Alert.alert(
//                 'Error',
//                 error.response?.data?.error || 'Failed to leave group',
//               );
//             } finally {
//               setLeaving(false);
//             }
//           },
//           style: 'destructive',
//         },
//       ]);
//     }
//   };

//   const navigateToGroupSettings = () => {
//     navigation.navigate('GroupSettings', {
//       groupId,
//       isAdmin,
//       isCreator,
//       groupInfo,
//     });
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchGroupData();
//       fetchGroupMembersCount();
//     }, [groupId, membersCount]),
//   );
//   const renderPostItem = ({item: post}) => (
//     <View style={styles.postContainer}>
//       <View style={styles.authorContainer}>
//         <Image
//           source={{
//             uri:
//               getFullFileUrl(post.postData?.authorData?.imgUrl) ||
//               DEFAULT_PROFILE_PIC,
//           }}
//           style={styles.avatar}
//         />
//         <View style={styles.authorInfo}>
//           <Text style={styles.authorName}>
//             {post.postData?.authorData?.name || 'Unknown User'}
//           </Text>
//           <Text style={styles.postDate}>
//             {moment(post.postData?.createdAt).fromNow()}
//           </Text>
//         </View>
//         {post.isAuthor && (
//           <TouchableOpacity
//             style={styles.moreOptionsButton}
//             onPress={() => showDeleteOption(post._id)}>
//             <Icon name="more-vert" size={24} color="#555" />
//           </TouchableOpacity>
//         )}
//       </View>

//       {post.postData?.content && (
//         <Text style={styles.postContent}>{post.postData.content}</Text>
//       )}

//       {post.postData?.attachments?.length > 0 && (
//         <View style={styles.attachmentsContainer}>
//           {post.postData.attachments.map((attachment, index) => {
//             if (!attachment) return null;
//             const fileName = attachment.split('/').pop();
//             const isImage = isImageAttachment(fileName);
//             const fullUrl = getFullFileUrl(attachment);
//             if (!fullUrl) return null;

//             return isImage ? (
//               <TouchableOpacity
//                 key={index}
//                 onPress={() => openImageViewer(attachment)}>
//                 <Image
//                   source={{uri: fullUrl}}
//                   style={styles.attachmentImage}
//                   resizeMode="cover"
//                 />
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.attachmentItemRow}
//                 onPress={() => Linking.openURL(fullUrl)}>
//                 <Icon
//                   name="attach-file"
//                   size={20}
//                   color="#01A082"
//                   style={styles.attachmentIcon}
//                 />
//                 <Text style={styles.attachmentLink} numberOfLines={1}>
//                   {fileName || 'Download file'}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       <View style={styles.interactionContainer}>
//         <TouchableOpacity
//           style={styles.interactionButton}
//           onPress={() => handleLike(post._id)}>
//           <Text style={styles.interactionText}>{post.likesCount || 0}</Text>
//           <Image
//             source={LikeIcon}
//             style={{
//               height: 18.58,
//               width: 19.82,
//               tintColor: post.hasLiked ? '#14AE5C' : '#828282',
//             }}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.interactionButton}
//           onPress={() => {
//             setSelectedPostId(post._id);
//             setShowCommentSection(true);
//             fetchComments(post._id);
//           }}>
//           <Text style={styles.interactionText}>{post.commentCount || 0}</Text>
//           <Icon
//             name="comment"
//             size={20}
//             color="#828282"
//             style={styles.commentIcon}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#14AE5C" />
//       </View>
//     );
//   }

//   // Show private group content if not a member
//   if (groupInfo?.is_private && !isMember) {
//     return (
//       <View style={styles.privateGroupContainer}>
//         <Image source={PrivateGroup} style={styles.privateGroupImage} />
//         <Text style={styles.privateGroupTitle}>This is a private group</Text>
//         <Text style={styles.privateGroupText}>
//           You need to be a member to view its content
//         </Text>
//         {requestSent ? (
//           <View style={styles.requestSentContainer}>
//             <Text style={styles.requestSentText}>Request Sent</Text>
//             <Icon name="check-circle" size={24} color="#14AE5C" />
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={styles.requestJoinButton}
//             onPress={handleJoinRequest}>
//             <Text style={styles.requestJoinButtonText}>Request to Join</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         {/* Group Header */}
//         <View style={styles.groupHeader}>
//           <Image
//             source={{uri: getFullFileUrl(imgUrl)}}
//             style={styles.groupImage}
//           />
//           <Text style={styles.groupName}>{name}</Text>
//           <Text style={styles.groupMembers}>
//             {membersCount} members •{' '}
//             {groupInfo?.is_private ? 'Private' : 'Public'} group
//           </Text>
//           <Text style={styles.groupDescription}>
//             {groupInfo?.aboutGroup || 'No description available'}
//           </Text>

//           <View style={styles.groupActions}>
//             {isMember ? (
//               <>
//                 <TouchableOpacity
//                   style={styles.actionButton}
//                   onPress={handleLeaveGroup}>
//                   <Text style={styles.actionButtonText}>Leave Group</Text>
//                 </TouchableOpacity>
//                 {(isAdmin || isCreator) && (
//                   <TouchableOpacity
//                     style={[styles.actionButton, {marginLeft: 10}]}
//                     onPress={navigateToGroupSettings}>
//                     <Text style={styles.actionButtonText}>Group Settings</Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             ) : (
//               <TouchableOpacity
//                 style={styles.joinButton}
//                 onPress={handleJoinRequest}>
//                 <Text style={styles.joinButtonText}>Join Group</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//           {/* <View style={styles.groupActions}>
//             {isMember ? (
//               <>
//                 <TouchableOpacity
//                   style={styles.actionButton}
//                   onPress={handleLeaveGroup}>
//                   <Text style={styles.actionButtonText}>Leave Group</Text>
//                 </TouchableOpacity>
//                 {(isAdmin || isCreator) && (
//                   <TouchableOpacity
//                     style={[styles.actionButton, {marginLeft: 10}]}
//                     onPress={navigateToGroupSettings}>
//                     <Text style={styles.actionButtonText}>Group Settings</Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             ) : (
//               !groupInfo?.is_private && (
//                 <TouchableOpacity
//                   style={styles.joinButton}
//                   onPress={handleJoinRequest}>
//                   <Text style={styles.joinButtonText}>Join Group</Text>
//                 </TouchableOpacity>
//               )
//             )}
//           </View> */}
//           {/* <View style={styles.groupActions}>
//             {groupInfo?.is_private && !isMember && !isAdmin && !isCreator ? (
//               requestSent ? (
//                 <View style={styles.requestSentContainer}>
//                   <Text style={styles.requestSentText}>Request Sent</Text>
//                   <Icon name="check-circle" size={24} color="#14AE5C" />
//                 </View>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.requestJoinButton}
//                   onPress={handleJoinRequest}>
//                   <Text style={styles.requestJoinButtonText}>
//                     Request to Join
//                   </Text>
//                 </TouchableOpacity>
//               )
//             ) : isMember ? (
//               <>
//                 <TouchableOpacity
//                   style={styles.actionButton}
//                   onPress={handleLeaveGroup}>
//                   <Text style={styles.actionButtonText}>Leave Group</Text>
//                 </TouchableOpacity>
//                 {(isAdmin || isCreator) && (
//                   <TouchableOpacity
//                     style={[styles.actionButton, {marginLeft: 10}]}
//                     onPress={navigateToGroupSettings}>
//                     <Text style={styles.actionButtonText}>Group Settings</Text>
//                   </TouchableOpacity>
//                 )}
//               </>
//             ) : (
//               // For public groups where user isn't a member
//               <TouchableOpacity
//                 style={styles.joinButton}
//                 onPress={handleJoinRequest}>
//                 <Text style={styles.joinButtonText}>Join Group</Text>
//               </TouchableOpacity>
//             )}
//           </View> */}
//         </View>

//         {/* Only show posts if user is a member */}
//         {isMember ? (
//           <FlatList
//             data={posts}
//             keyExtractor={item => item._id}
//             renderItem={renderPostItem}
//             ListEmptyComponent={
//               <Text style={styles.noPosts}>No posts in this group yet</Text>
//             }
//             scrollEnabled={false}
//           />
//         ) : (
//           <View style={styles.joinToViewContainer}>
//             <Text style={styles.joinToViewText}>
//               Join this group to view and participate in discussions
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* ... [keep all other existing JSX unchanged] ... */}

//       {/* Floating Action Button - only show if member */}
//       {isMember && !showPostForm && !showCommentSection && (
//         <TouchableOpacity
//           style={styles.createPostButton}
//           onPress={() => {
//             resetPostForm();
//             setShowPostForm(true);
//           }}>
//           <Icon name="add" size={24} color="#fff" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import LikeIcon from '../Images/likeIcon.png';
import PrivateGroup from '../Images/pricateGroup.png';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {API_BASE_URL} from '../constants/config';

const USER_ID = '6754a9268db89992d5b8221e';
const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';

const GroupDetailsAndPosts = ({route, navigation}) => {
  const {_id: groupId, imgUrl, name} = route.params;
  const [groupInfo, setGroupInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // Post creation state
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
  const checkUserMembership = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/postgroup/getGroupMembers/${groupId}`,
      );
      const members = response.data.members || [];
      setIsMember(members.includes(USER_ID));
      console.log('User membership status:', members.includes(USER_ID));
    } catch (error) {
      console.error('Error checking user membership:', error);
      setIsMember(false); // Default to false if there's an error
    }
  };
  const fetchGroupMembersCount = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/postgroup/getGroupMembers/${groupId}`,
      );
      setMembersCount(response.data.members.length);
    } catch (error) {
      console.error('Error fetching members count:', error);
    }
  };

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/postgroup/getGroup/${groupId}/${USER_ID}`,
      );
      const data = response.data;

      setGroupInfo(data.groupInfo);
      setPosts(data.posts || []);
      //  setIsMember(data.isMember);
      setIsAdmin(data.isAdmin);
      setIsCreator(data.isCreator);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPostId || !newComment.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/posts/addComment/${selectedPostId}`, {
        author: USER_ID,
        content: newComment,
      });
      setNewComment('');
      fetchComments(selectedPostId);
      // Update comment count in posts list
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === selectedPostId
            ? {...post, commentCount: (post.commentCount || 0) + 1}
            : post,
        ),
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async postId => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      const isLiked = post.hasLiked;

      await axios.put(
        `${API_BASE_URL}/posts/togglePostLike/${postId}/${USER_ID}/${isLiked}`,
      );

      setPosts(prevPosts =>
        prevPosts.map(p =>
          p._id === postId
            ? {
                ...p,
                hasLiked: !isLiked,
                likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
              }
            : p,
        ),
      );
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Post creation handlers
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
      formData.append('group_ids[]', groupId);

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
        fetchGroupData(); // Refresh posts
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

  const isImageAttachment = fileName => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const openImageViewer = imageUrl => {
    const fullUrl = getFullFileUrl(imageUrl);
    if (fullUrl) {
      navigation.navigate('ImageViewer', {imageUrl: fullUrl});
    }
  };

  const showDeleteOption = postId => {
    const post = posts.find(p => p._id === postId);
    if (!post?.isAuthor && !isAdmin && !isCreator) {
      return;
    }

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
  };

  const handleDeletePost = async postId => {
    console.log('Deleting post with ID:', postId);
    try {
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

      await axios.delete(`${API_BASE_URL}/posts/deletePost/${postDataId}`);

      // Update state properly
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      showMessage('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      showMessage('Failed to delete post');
    }
  };

  const handleJoinRequest = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/postgroup/joinGroup/${groupId}/${USER_ID}`,
      );
      showMessage(response.data.message);
      if (response.data.message === 'Requested..') {
        setRequestSent(true);
      } else {
        fetchGroupData(); // Refresh group data if joined directly
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      showMessage('Failed to send join request');
    }
  };

  const handleLeaveGroup = async () => {
    if (isCreator) {
      Alert.alert(
        'You Are The Creator',
        'If you leave this group, it will be permanently deleted. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave and Delete',
            onPress: async () => {
              try {
                setLeaving(true);
                const response = await axios.delete(
                  `${API_BASE_URL}/postgroup/deleteGroup/${groupId}`,
                );

                if (response.data.success) {
                  Alert.alert('Success', 'Group has been deleted');
                  navigation.goBack();
                } else {
                  throw new Error(
                    response.data.message || 'Failed to delete group',
                  );
                }
              } catch (error) {
                console.error('Delete group error:', error);
                Alert.alert(
                  'Error',
                  error.response?.data?.message || 'Failed to delete group',
                );
              } finally {
                setLeaving(false);
              }
            },
            style: 'destructive',
          },
        ],
      );
    } else {
      Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          onPress: async () => {
            try {
              setLeaving(true);
              const response = await axios.post(
                `${API_BASE_URL}/postgroup/removeMember/${groupId}/${USER_ID}`,
              );

              if (response.data.message === 'Member removed successfully') {
                Alert.alert('Success', 'You have left the group');
                navigation.goBack();
              } else {
                throw new Error(
                  response.data.message || 'Failed to leave group',
                );
              }
            } catch (error) {
              console.error('Leave group error:', error);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to leave group',
              );
            } finally {
              setLeaving(false);
            }
          },
          style: 'destructive',
        },
      ]);
    }
  };

  const navigateToGroupSettings = () => {
    navigation.navigate('GroupSettings', {
      groupId,
      isAdmin,
      isCreator,
      groupInfo,
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroupData();
      fetchGroupMembersCount();
      checkUserMembership();
    }, [groupId, membersCount, refreshKey]),
  );

  const renderPostItem = ({item: post}) => (
    <View style={styles.postContainer}>
      <View style={styles.authorContainer}>
        <Image
          source={{
            uri:
              getFullFileUrl(post.postData?.authorData?.imgUrl) ||
              DEFAULT_PROFILE_PIC,
          }}
          style={styles.avatar}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {post.postData?.authorData?.name || 'Unknown User'}
          </Text>
          <Text style={styles.postDate}>
            {moment(post.postData?.createdAt).fromNow()}
          </Text>
        </View>
        {post.isAuthor && (
          <TouchableOpacity
            style={styles.moreOptionsButton}
            onPress={() => showDeleteOption(post._id)}>
            <Icon name="more-vert" size={24} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {post.postData?.content && (
        <Text style={styles.postContent}>{post.postData.content}</Text>
      )}

      {post.postData?.attachments?.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {post.postData.attachments.map((attachment, index) => {
            if (!attachment) return null;
            const fileName = attachment.split('/').pop();
            const isImage = isImageAttachment(fileName);
            const fullUrl = getFullFileUrl(attachment);
            if (!fullUrl) return null;

            return isImage ? (
              <TouchableOpacity
                key={index}
                onPress={() => openImageViewer(attachment)}>
                <Image
                  source={{uri: fullUrl}}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                style={styles.attachmentItemRow}
                onPress={() => Linking.openURL(fullUrl)}>
                <Icon
                  name="attach-file"
                  size={20}
                  color="#01A082"
                  style={styles.attachmentIcon}
                />
                <Text style={styles.attachmentLink} numberOfLines={1}>
                  {fileName || 'Download file'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.interactionContainer}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleLike(post._id)}>
          <Text style={styles.interactionText}>{post.likesCount || 0}</Text>
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
          <Text style={styles.interactionText}>{post.commentCount || 0}</Text>
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

  // Show private group content if not a member
  if (groupInfo?.is_private && !isMember) {
    return (
      <View style={styles.privateGroupContainer}>
        <Image source={PrivateGroup} style={styles.privateGroupImage} />
        <Text style={styles.privateGroupTitle}>This is a private group</Text>
        <Text style={styles.privateGroupText}>
          You need to be a member to view its content
        </Text>
        {requestSent ? (
          <View style={styles.requestSentContainer}>
            <Text style={styles.requestSentText}>Request Sent</Text>
            <Icon name="check-circle" size={24} color="#14AE5C" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.requestJoinButton}
            onPress={handleJoinRequest}>
            <Text style={styles.requestJoinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <Image
            source={{uri: getFullFileUrl(imgUrl)}}
            style={styles.groupImage}
          />
          <Text style={styles.groupName}>{name}</Text>
          <Text style={styles.groupMembers}>
            {membersCount} members •{' '}
            {groupInfo?.is_private ? 'Private' : 'Public'} group
          </Text>
          <Text style={styles.groupDescription}>
            {groupInfo?.aboutGroup || 'No description available'}
          </Text>

          <View style={styles.groupActions}>
            {isMember ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLeaveGroup}>
                  <Text style={styles.actionButtonText}>Leave Group</Text>
                </TouchableOpacity>
                {(isAdmin || isCreator) && (
                  <TouchableOpacity
                    style={[styles.actionButton, {marginLeft: 10}]}
                    onPress={navigateToGroupSettings}>
                    <Text style={styles.actionButtonText}>Group Settings</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinRequest}>
                <Text style={styles.joinButtonText}>Join Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Posts List */}
        {isMember ? (
          <FlatList
            data={posts}
            keyExtractor={item => item._id}
            renderItem={renderPostItem}
            ListEmptyComponent={
              <Text style={styles.noPosts}>No posts in this group yet</Text>
            }
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.joinToViewContainer}>
            <Text style={styles.joinToViewText}>
              Join this group to view and participate in discussions
            </Text>
          </View>
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

      {/* Post Form */}
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
      {isMember && !showPostForm && !showCommentSection && (
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => {
            resetPostForm();
            setShowPostForm(true);
          }}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupHeader: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  groupMembers: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  groupDescription: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  groupActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#14AE5C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
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
  },
  postContent: {
    fontSize: 14.5,
    color: '#333',
    lineHeight: 21,
    marginBottom: 8,
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  attachmentImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
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
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentLink: {
    color: '#0056b3',
    flex: 1,
    fontSize: 13,
  },
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
  commentIcon: {
    marginTop: 1,
  },
  noPosts: {
    textAlign: 'center',
    marginVertical: 30,
    fontSize: 16,
    color: '#888',
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#14AE5C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
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
  postFormContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  postFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  postFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  postFormScroll: {
    flex: 1,
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
  disabledButton: {
    backgroundColor: '#aaa',
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
  postButton: {
    backgroundColor: '#14AE5C',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  privateGroupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  privateGroupImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  privateGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  privateGroupText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  requestJoinButton: {
    backgroundColor: '#14AE5C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  requestJoinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  requestSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  requestSentText: {
    color: '#14AE5C',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  pinnedBadge: {
    backgroundColor: '#14AE5C',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
  },
  imageAttachmentContainer: {
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 8,
  },
  downloadIcon: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14AE5C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  sectionSelector: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  sectionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedSectionButton: {
    backgroundColor: '#14AE5C',
  },
  sectionButtonText: {
    color: '#555',
  },
  selectedSectionText: {
    color: 'white',
  },
  toggleButton: {
    padding: 5,
  },
  joinToViewContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinToViewText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});
export default GroupDetailsAndPosts;
