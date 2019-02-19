const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const express = require('express')
const request = require('request')
const app = express()

const fs = require('fs')
const { google } = require('googleapis')
const googleAuth = require('google-auth-library')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}))
app.use("/css", express.static(__dirname + '/css'));
app.set('view engine', 'ejs')
dotenv.config()

const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || 
      process.env.USERPROFILE) + '/credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

const googleSecrets = JSON.parse(fs.readFileSync('client_secret.json')).installed;
const oauth2Client = new googleAuth.OAuth2Client(
  googleSecrets.client_id,
  googleSecrets.client_secret,
  googleSecrets.redirect_uris[0]
)

const token = fs.readFileSync(TOKEN_PATH);
oauth2Client.setCredentials(JSON.parse(token));

const calendar = google.calendar({version: 'v3', auth: oauth2Client});
const CALENDAR_ID = 'bnbthebrambles@gmail.com';

app.get('/', function (req, res) {
  calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
  res.render('index')
})

app.get('/book', function (req, res) {
  res.render('book')
})

app.post('/book', function (req, res) {
  let start = `${req.body['trip-start']}T00:00:00.000Z`
  let end = `${req.body['trip-end']}T23:59:59.000Z`
  let query
  calendar.events.list({
    calendarId : CALENDAR_ID, 
    timeMin: start,
    timeMax: end
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    events = response.data.items;
    if (events.length > 0) {
      query = "Not available"
      res.render('book', {query: query})
    } else {
      query = "Available"
      res.render('book', {query: query})
    }
  });
})


app.post('/contact', function (req, res) {
  res.render('index')
})

app.post('/', function (req, res) {
  let mailOpts, smtpTrans;
  smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  mailOpts = {
    from: req.body.name + '&lt;' + req.body.email + '&gt;',
    to: process.env.GMAIL_USER,
    subject: 'New message from contact form on website',
    text: `${req.body.name} (${req.body.email}) says: ${req.body.message}`
  };
  smtpTrans.sendMail(mailOpts, function(error, response) {
    if(error) {
      res.render('index', {msg: 'Error occured, message not sent'})
    }
    res.render('index', {msg: 'Message sent!'})
  })
})

app.get('/property', function(req, res) {
  res.render('property')
})

app.get('/area', function(req, res) {
  res.render('area')
})

app.listen((process.env.PORT || 3000), function () {
  console.log('Example app listening on port 3000!')
})