const secp = require('ethereum-cryptography/secp256k1');
const utils = require('ethereum-cryptography/utils');

// private key coming back as a byte array > convert it to hex
const privateKey = utils.toHex(secp.utils.randomPrivateKey());

console.log(`Private Key`);
console.log(privateKey);

const publicKey = secp.getPublicKey(privateKey);

console.log(`Public Key`);
console.log(utils.toHex(publicKey));
