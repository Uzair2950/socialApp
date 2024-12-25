import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

const App = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('http://192.168.10.11:3000/data')
            .then(response => setData(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <View>
            {data.map((item, index) => (
                <Text key={index}>{item.name}</Text>
            ))}
        </View>
    );
};

export default App;
