import React from 'react';
import {Image, View} from 'react-native';
import {API_BASE_URL} from '../constants/config';
import {IMG_BASE_URL} from '../constants/config';

const App = () => {
  const [userData, setUserData] = useState({});

  // const API_BASE_URL = 'http://192.168.215.120:3001/api';
  // const IMG_BASE_URL = 'http://192.168.215.120:3001';
  const USER_ID = '6754a9268db89992d5b8221e';
  const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/40';
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
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View>
      <Image source={{uri: `${IMG_BASE_URL}${userData.imgUrl}`}} />
    </View>
  );
};
export default App;
