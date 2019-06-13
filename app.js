const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//const port = 3000;
const port = process.env.PORT || 3000;

const renamer = require('./routes/renamer');

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.json());

// Angular References
app.use(express.static(path.join(__dirname, 'frontend/src')));

app.use('/services', renamer);

// Index Route
app.get('/', (req, res) => {
    res.send('Invalid endpoint.');
});



app.listen(port, () => {
    console.log('Server started on port: ' + port);
});