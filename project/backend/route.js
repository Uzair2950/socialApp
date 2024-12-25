const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

app.get('/data', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('school');
        const collection = database.collection('students');
        const data = await collection.find().toArray();
        res.json(data);
    } finally {
        await client.close();
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
