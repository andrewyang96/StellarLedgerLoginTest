const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

const https = require('https');
const fs = require('fs');
const httpsOptions = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH)
};

const StellarLedger = require('stellar-ledger-api');
const bip32Path = "44'/148'/0'";

app.get('/', (req, res) => {
  res.send('<a href="login">Login here</a>');
});

app.get('/login', (req, res) => {
  StellarLedger.comm.create_async(2**31-1).then(function(comm) {
    const api = new StellarLedger.Api(comm);
    api.connect(function() {
      api.getPublicKey_async(bip32Path).then(function (result) {
        res.send('Your public key is ' + result.publicKey);
      }).catch(function (err) {
        res.send(err);
      });
    }, function(err) {
      res.send(err);
    });
  });
});

const server = https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
  console.log('Server running at ' + process.env.PORT);
});
