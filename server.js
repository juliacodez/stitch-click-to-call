'use strict';
const express = require('express');
const Nexmo = require('nexmo');
require('dotenv').config({
  path: __dirname + '/.env'
});
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
})

const adminAcl = {
  "paths": {
    "/v1/users/**": {},
    "/v1/conversations/**": {},
    "/v1/sessions/**": {},
    "/v1/devices/**": {},
    "/v1/image/**": {},
    "/v3/media/**": {},
    "/v1/applications/**": {},
    "/v1/push/**": {},
    "/v1/knocking/**": {}
  }
}

var phoneNumbers = {
  person1: process.env.CALL_NUMBER_1,
  person2: process.env.CALL_NUMBER_2,
  person3: process.env.CALL_NUMBER_3
};

const server = app.listen(3000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', function(req, res) {


  res.render('index.ejs', {
    members: Object.keys(phoneNumbers),
    token: Nexmo.generateJwt(process.env.NEXMO_PRIVATE_KEY, {
      application_id: process.env.NEXMO_APP_ID,
      sub: "demo",
      exp: new Date().getTime() + 86400,
      acl: adminAcl
    }),
    phone: process.env.NEXMO_PHONE_NUMBER
  });
});

app.post('/events', (req, res) => {
  res.status(200).end();
});

app.get('/answer', (req, res) => {
  var ncco = [{
    "action": "connect",
    "from": process.env.NEXMO_PHONE_NUMBER,
    "endpoint": [{
      "type": "phone",
      "number": phoneNumbers[req.query.to]
    }]
  }];
  res.json(ncco);
})

app.post('/sms', (req, res) => {
  nexmo.message.sendSms("NEXMO", req.body.msisdn, process.env.NEXMO_COUPON)
})
