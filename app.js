const express = require('express');
const routes = require('./routes/route');
const authRouter = require('./routes/auth');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Load env vars
dotenv.config({ path: './config/config.env' })

// Setup express app
const app = express();

// Connecting to the MongoDB database
mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, 'useCreateIndex': true });
mongoose.Promise = global.Promise;

// Setting up a port variable
const PORT = process.env.PORT || 5000;

// Reading the body and parsing it into json
app.use(bodyParser.json());

// error handling middleware
app.use((err, req, res, next) => {
    res.status(422).send({error: err.message});
})

//Initalize routes
app.use('/api', routes);

app.use("/auth", require("./routes/auth"));

// Listen for requests
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`))