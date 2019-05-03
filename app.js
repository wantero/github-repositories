const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

const { getHomePage } = require('./routes/index.ejs');
const { getRepoFromGitHub, infoRepoPage } = require('./routes/repositories');

const port = process.env.PORT || 5000;

var db_config = {
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bf5b1f77ed2067',
    password: '25694154',
    database: 'heroku_317d3c7abe35ce3'
  };

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
        console.log('Connected to database');
    });                                     // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

global.db = connection;

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder

// routes for the app
app.get('/', getHomePage);
app.get('/getRepositories', getRepoFromGitHub);
app.get('/info/:owner/:repo/:repoId', infoRepoPage);

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
