// import React, {useEffect, useState, useCallback} from 'react';
// import {
//   View,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   Pressable,
//   Text,
//   Modal,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import axios from 'axios';
// import {useFocusEffect} from '@react-navigation/native';
// import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';
// import noProfile from '../Images/noProfile.jpeg';

// const VipCollections = ({navigation}) => {
//   const uid = '6754a9268db89992d5b8221e';
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [nonVipPeople, setNonVipPeople] = useState([]);

//   const fetchVipCollections = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${API_BASE_URL}/user/getVipCollections/${uid}`,
//       );
//       setCollections(res.data);
//       console.log(res.data);
//     } catch (err) {
//       console.error('Error fetching VIP Collections:', err);
//       Alert.alert('Error', 'Failed to load VIP collections');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchNonVipPeople = async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/user/getPeopleNotInCollection/${uid}`,
//       );
//       setNonVipPeople(res.data);
//     } catch (err) {
//       console.error('Error fetching non-VIP people:', err);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchVipCollections();
//     }, []),
//   );

//   const handleAddToVip = async personId => {
//     try {
//       const res = await axios.post(
//         `${API_BASE_URL}/user/createVipCollection/${uid}`,
//         {person: personId},
//       );
//       setCollections(prev => [...prev, res.data]);
//       setModalVisible(false);
//     } catch (err) {
//       Alert.alert('Error', 'Failed to add to VIP collection');
//     }
//   };

//   const renderVipItem = ({item}) => (
//     <TouchableOpacity
//       style={styles.collectionItem}
//       onPress={() =>
//         navigation.navigate('VipChat', {
//           collectionId: item._id,
//           personName: item.person?.name || 'VIP Collection',
//         })
//       }>
//       <Image
//         source={
//           item.person?.imgUrl
//             ? {uri: `${IMG_BASE_URL}${item.person.imgUrl}`}
//             : noProfile
//         }
//         style={styles.avatar}
//       />
//       <View style={styles.textContainer}>
//         <Text style={styles.name}>{item.person?.name || 'Unknown User'}</Text>
//         <Text style={styles.type}>VIP Collection</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderNonVipItem = ({item}) => (
//     <TouchableOpacity
//       style={styles.collectionItem}
//       onPress={() => handleAddToVip(item._id)}>
//       <Image
//         source={
//           item.imgUrl ? {uri: `${IMG_BASE_URL}${item.imgUrl}`} : noProfile
//         }
//         style={styles.avatar}
//       />
//       <View style={styles.textContainer}>
//         <Text style={styles.name}>{item.name}</Text>
//         <Text style={styles.type}>Add to VIP</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={{flex: 1}}>
//       <View style={styles.container}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#6200ee" />
//         ) : (
//           <FlatList
//             data={collections}
//             keyExtractor={item => item._id}
//             renderItem={renderVipItem}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No VIP collections found</Text>
//             }
//           />
//         )}
//       </View>

//       <Pressable
//         style={styles.fab}
//         onPress={() => {
//           fetchNonVipPeople();
//           setModalVisible(true);
//         }}>
//         <Icon name="add" size={25} color="#fff" />
//       </Pressable>

//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         onRequestClose={() => setModalVisible(false)}>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Create A VIP Collection</Text>
//             <Pressable onPress={() => setModalVisible(false)}>
//               <Icon name="close" size={24} color="#000" />
//             </Pressable>
//           </View>
//           <FlatList
//             data={nonVipPeople}
//             keyExtractor={item => item._id}
//             renderItem={renderNonVipItem}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>No contacts available</Text>
//             }
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   collectionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     marginBottom: 8,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     elevation: 2,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   type: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 2,
//   },
//   fab: {
//     width: 56,
//     height: 56,
//     backgroundColor: '#14AE5C',
//     position: 'absolute',
//     bottom: 24,
//     right: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     borderRadius: 28,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     paddingTop: 16,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#666',
//   },
// });

// export default VipCollections;
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
  Text,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import {API_BASE_URL, IMG_BASE_URL} from '../constants/config';
import noProfile from '../Images/noProfile.jpeg';

const VipCollections = ({navigation}) => {
  const uid = '6754a9268db89992d5b8221e';
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nonVipPeople, setNonVipPeople] = useState([]);

  const fetchVipCollections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/user/getVipCollections/${uid}`,
      );
      setCollections(res.data);
    } catch (err) {
      console.error('Error fetching VIP Collections:', err);
      Alert.alert('Error', 'Failed to load VIP collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchNonVipPeople = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/user/getPeopleNotInCollection/${uid}`,
      );
      setNonVipPeople(res.data);
    } catch (err) {
      console.error('Error fetching non-VIP people:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVipCollections();
    }, []),
  );

  const handleAddToVip = async personId => {
    try {
      // Find the person data before creating the collection
      const personToAdd = nonVipPeople.find(person => person._id === personId);

      // Create the collection
      const createRes = await axios.post(
        `${API_BASE_URL}/user/createVipCollection/${uid}`,
        {person: personId},
      );

      // Create a temporary collection object with known person data
      const tempCollection = {
        ...createRes.data,
        person: personToAdd || {_id: personId}, // Fallback if person data not found
      };

      // Optimistically update the UI
      setCollections(prev => [tempCollection, ...prev]);
      setModalVisible(false);

      // Refresh the list to get complete data from backend
      fetchVipCollections();
    } catch (err) {
      Alert.alert('Error', 'Failed to add to VIP collection');
      console.error('Error adding to VIP:', err);
    }
  };

  const handleDeleteCollection = async collectionId => {
    try {
      Alert.alert(
        'Delete Collection',
        'Are you sure you want to delete this VIP collection?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            onPress: async () => {
              await axios.delete(
                `${API_BASE_URL}/user/deleteVipCollection/${collectionId}`,
              );
              setCollections(prev => prev.filter(c => c._id !== collectionId));
            },
            style: 'destructive',
          },
        ],
      );
    } catch (err) {
      console.error('Error deleting collection:', err);
      Alert.alert('Error', 'Failed to delete VIP collection');
    }
  };

  const renderVipItem = ({item}) => (
    <View style={styles.collectionItemContainer}>
      <TouchableOpacity
        style={styles.collectionItem}
        onPress={() =>
          navigation.navigate('VipChat', {
            collectionId: item._id,
            personName: item.person?.name || 'VIP Collection',
            personId: item.person?._id,
          })
        }>
        <Image
          source={
            item.person?.imgUrl
              ? {uri: `${IMG_BASE_URL}${item.person.imgUrl}`}
              : noProfile
          }
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.person?.name || 'Loading...'}</Text>
          <Text style={styles.type}>VIP Collection</Text>
        </View>
      </TouchableOpacity>
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDeleteCollection(item._id)}>
        <Icon name="delete" size={24} color="#ff4444" />
      </Pressable>
    </View>
  );

  const renderNonVipItem = ({item}) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => handleAddToVip(item._id)}>
      <Image
        source={
          item.imgUrl ? {uri: `${IMG_BASE_URL}${item.imgUrl}`} : noProfile
        }
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>Add to VIP</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <FlatList
          data={collections}
          keyExtractor={item => item._id}
          renderItem={renderVipItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No VIP collections found</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => {
          fetchNonVipPeople();
          setModalVisible(true);
        }}>
        <Icon name="add" size={25} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create A VIP Collection</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </Pressable>
          </View>
          <FlatList
            data={nonVipPeople}
            keyExtractor={item => item._id}
            renderItem={renderNonVipItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No contacts available</Text>
            }
            contentContainerStyle={styles.modalListContent}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  modalListContent: {
    paddingHorizontal: 16,
  },
  collectionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  type: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14AE5C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default VipCollections;
