const express = require('express'),
    app = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    path = require('path'),
    dotenv = require('dotenv'),
    superHeroRoute = require('./routes/super-hero-route')
;
app.use(cors());

dotenv.config();
//Mongo Connection
mongoose.connect(process.env.MongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.error(err));
mongoose.Promise = global.Promise;

const apiPrefix = '/api/';

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, 'public')));

//Routes
app.use(apiPrefix + 'super-hero', superHeroRoute);

// app.get(apiPrefix + 'super-hero', (req, res) => {
//     res.send('I got you!!')
// })

// app.get('/*', (req, res) => {
//     res.sendFile('./index.html', {root: __dirname});
// });

module.exports = app;
