const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

mongoose.connect('mongodb://wequantez3:hakangenc1@ds237373.mlab.com:37373/graphql-reactjs')
mongoose.connection.once('open', () => {
    console.log('Connected to Database.');
});

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('Server listening port on 4000');
});