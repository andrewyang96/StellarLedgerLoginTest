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

const StellarSdk = require('stellar-sdk');
const stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');

app.get('/', (req, res) => {
  res.send('<a href="login">Login here</a>');
});

app.get('/login', (req, res) => {
  StellarLedger.comm.create_async(2**31-1).then((comm) => {
    const api = new StellarLedger.Api(comm);
    api.connect(() => {
      api.getPublicKey_async(bip32Path).then((result) => {
        res.send('Your public key is ' + result.publicKey);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }, (err) => {
      res.status(500).send(err);
    });
  });
});

app.get('/info/:publicKey', (req, res) => {
  stellarServer.accounts()
    .accountId(req.params.publicKey)
    .call()
    .then((result) => {
      res.send(result);
    }).catch(() => {
      res.status(404).end();
    });
});

const server = https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
  console.log('Server running at ' + process.env.PORT);
});
