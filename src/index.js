require('dotenv').config();
const app = require('express')();
const bodyParser = require('body-parser');
const twilio = require('twilio');
const twiml = twilio.twiml;
const fs = require('fs').promises;
const path = require('path');

// Config
const port = process.env.PORT || 8000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', '.data');
const forwardTo = process.env.PHONES ? process.env.PHONES.split(',') : [];
const sharedSecret = process.env.SECRET || 'changeme';
const digits = process.env.DIGITS || '999999999';

// Runtime state file read/write
const stateFile = path.join(dataDir, 'state.json');
const fileExists = async (file) => { try { await fs.access(file); return true } catch (ex) { return false; }};
const readState = async () => await fileExists(stateFile) ? JSON.parse(await fs.readFile(stateFile)) : { unlocked: false };
const writeState = async (unlocked) => fs.writeFile(stateFile, JSON.stringify({ unlocked }));


// Twilio validation
const validateMiddleware = process.env.TWILIO_AUTH_TOKEN ? twilio.webhook() : (req, res, next) => next();
app.use(bodyParser.urlencoded({ extended: false }));

// Incoming request from intercom system
app.all('/intercom', validateMiddleware, async (req, res) => {
  const resTwiml = new twiml.VoiceResponse();
  const state = await readState();

  if (state.unlocked) {
    resTwiml.play({ digits });

  } else if (forwardTo.length > 0) {
    const dial = resTwiml.dial();
    forwardTo.forEach((number) => dial.number(number.trim()));

  } else {
    resTwiml.say('Sorry, this door is locked.');
  }

  res.type('text/xml').status(200).send(resTwiml.toString());
});

// Incoming get/set request
app.all('/set', async (req, res) => {
  const secret = req.query.secret || req.body.secret;
  const unlocked = req.query.unlocked || req.body.unlocked;

  if (secret !== sharedSecret) {
    res.type('json').status(403).send(JSON.stringify({ success: false, message: 'incorrect secret'}))
  } else {
    writeState(['true', '1', 'yes', 'unlocked'].indexOf(unlocked) >= 0);
    res.type('json').send(JSON.stringify({ success: true, message: 'ok' }));
  }
});

app.listen(port, () => console.log(`listening at http://0.0.0.0:${port}/`))
