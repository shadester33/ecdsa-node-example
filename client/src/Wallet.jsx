import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";


function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = toHex(secp.getPublicKey(privateKey));
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Transfer Source</h1>
      <label>
        Private Key
        <input 
          placeholder="Insert a private key. We will not store it." 
          value={privateKey} 
          onChange={onChange}>
        </input>
      </label>
      <div>
        Account Address: {address.slice(0,20)}
      </div>
      <div className="balance">
        Account Balance: {balance}
      </div>
    </div>
  );
}

export default Wallet;
