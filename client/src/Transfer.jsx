import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1"
import { keccak256 } from "ethereum-cryptography/keccak"
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils"

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {

      if (address === '' || recipient === '' || sendAmount === '' ) {
        alert('Please fill all fields.');
        return;
      }

      const dataPayload = {sender: address, amount: parseInt(sendAmount), recipient};
      const messageHash = toHex(keccak256(utf8ToBytes(JSON.stringify(dataPayload))))
      const sign = await secp.sign(messageHash, privateKey, { recovered: Boolean = true});

      console.log(`sending this`);
      console.log(dataPayload);

      const {
        data: { balance },
      } = await server.post(`send`,{
        dataPayload,
        messageHash,
        sign,
      }); 

      setBalance(balance);
    } catch (ex) {
      console.error(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
         Amount
        <input
          placeholder="eth amount"
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit"  className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
