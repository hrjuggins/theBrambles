var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// We need things such as our client ID and secret, which we can read from a file
const googleSecrets = JSON.parse(fs.readFileSync('client_secret.json')).installed;

// Create an OAuth2 client which we use to generate an auth URL
// and exchange the code for a token
var oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
);

// Generate an authentication URL for us to visit
var authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES
});

console.log('Authorize this app by visiting this url: ', authUrl);

// Once we have a token, save it
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the code from that page here: ', function(code) {
  rl.close();
  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token:', err.response.data.error_description);
      return;
    }

    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log("Your credentials have been written to", TOKEN_PATH);
  });
});