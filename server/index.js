const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
//const { useState } = require("react");

const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { sha256 } = require("ethereum-cryptography/sha256");

app.use(cors());
app.use(express.json());

const balances = {
  "baf86a977784522aa8b707fe64a391dd1400d871": 1000,
  "63a9481f7b7e64bc8ec0a545043c5bd21fdccf07": 500,
  "92b21cce358e1feca059a7dbd4d07858aa9ef811": 750,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recoverKey, msgHash } = req.body;
  console.log('SIGNATURE1: ' + signature);

  //verify signature before check balances-----
  console.log('PREVIOUS PUBLIC KEY ON SERVER');

  const msgHash2 = keccak256(utf8ToBytes(msgHash));
  let publicKey = secp.recoverPublicKey(msgHash2, signature, recoverKey);
  console.log('PUBLIC KEY ON SERVER: ' + publicKey);
  console.log('SENDER: ' + sender);

  const rest_Pkey = publicKey.slice(1);
  const hash = keccak256(rest_Pkey);
  const address = toHex(hash.slice(-20));
  console.log('ADDRESS: ' + address);//getting the address from the public key

  if (address != sender) {

    res.status(401).send({
      message:
        "Sender is not authorised for this transaction! Invalid Signature",
    });
  } else {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }

  }

});


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
