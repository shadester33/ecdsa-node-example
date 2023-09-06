const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp  = require('ethereum-cryptography/secp256k1')
const { toHex } = require('ethereum-cryptography/utils')

app.use(cors());
app.use(express.json());

// Private keys for reference (Non Prod behaviour)
// 1. 1836577a39d1135287b0719fe5f9bce054857b07e6d2dff7f4af1c330547028e
// 2. ff517bc47eb1ea4adeead7284c1d6290974ddb8b0710f80b9c12a1885f050d52
// 3. fce7b326871a95375cc3a435945f58dca885493a0bfe4a46f0cd2e8e4cfbda4b
const balances = {
  "04b08099217a5ca912dbc8f8a78a24a017b71cbd86cf808d722c90be7cd342e7a9cc4911235fbcb811de4561d9a9ff31f823d611fbbe4102a6edbe484cfdc59d20": 100,
  "048e80705bfdb08a383983430f3a0f9b861ef9f15244e35f80e4e900b32811a07665f1bc0aade4c03811eb01b5929f1f3eb7df47d0266ef58c5211cc177937adfc": 50,
  "0405d6d9d32cb3bd9aac4e7c9bcf34a41d415a064fadfe560a541b606f1a7a7d8b4ca9c52ad47b7cd57aad79ac46a70a47aca5246a739c7131c936b5d2b38c8135": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  // 1. get a signature from the client application
  const { dataPayload, messageHash, sign } = req.body;
  const publicKey = getPublicKeyFromSignature(messageHash, sign);

  if (publicKey !== dataPayload.sender) res.status(400).send({message: 'Invalid address/sender'});
  if (balances[publicKey] === undefined) res.status(400).send({message: 'Sender Address does not exist'});
  if (balances[dataPayload.recipient] === undefined) res.status(400).send({message: 'Recipient Address does not exist'});
  
  setInitialBalance(dataPayload.sender);
  setInitialBalance(dataPayload.recipient);

  const { sender, amount, recipient } = dataPayload;

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
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

function getPublicKeyFromSignature(messageHash, sign, sender) {
  const signature = Uint8Array.from(Object.values(sign[0]));
  const recoveryBit = sign[1];
  const recoveredPublicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);
  const hexRecoveredPublicKey = toHex(recoveredPublicKey);
  return hexRecoveredPublicKey;
}
