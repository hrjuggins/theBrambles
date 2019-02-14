const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const express = require('express')
const app = express()


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}))
app.use("/css", express.static(__dirname + '/css'));
app.set('view engine', 'ejs')
dotenv.config()

app.get('/', function (req, res) {
  res.render('index')
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

app.listen((process.env.PORT || 3000), function () {
  console.log('Example app listening on port 3000!')
})