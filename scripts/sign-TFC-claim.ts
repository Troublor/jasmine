/**
 * This script acts as a helper to deploy jasmine-eth smart contracts on Ethereum
 */

import prompts from "prompts";
import SDK, {Account, Address, Manager} from "jasmine-eth-ts";
import BN from "bn.js";

let sdk: SDK;
let manager: Manager;
let admin: Account;
let recipient: Address;

(async () => {
    while (!sdk) {
        let response0 = await prompts({
            type: 'text',
            name: 'endpoint',
            message: 'Tell me your Ethereum endpoint?',
            initial: "http://localhost:8545"
        });
        try {
            sdk = new SDK(response0.endpoint);
            await sdk.web3.eth.getBlockNumber();
        } catch (e) {
            console.error(`Something wrong with endpoint: ${e.toString()}`);
        }
    }

    let response1 = await prompts({
        type: 'text',
        name: 'managerAddress',
        message: 'What is the address of Manager contract?',
        validate: input => sdk.web3.utils.isAddress(input),
    });
    try {
        manager = sdk.getManager(response1.managerAddress);
    } catch (e) {
        console.error(`Manager contract not found at address ${response1.managerAddress}: ${e.toString()}`);
        return;
    }

    let response2 = await prompts({
        type: 'text',
        name: 'admin',
        message: 'What is the private key of admin account of Manager contract?',
    });
    try {
        admin = sdk.retrieveAccount(response2.admin);
    } catch (e) {
        console.error(`Retrieve admin account failed: ${e.toString()}`);
        return;
    }

    let response3 = await prompts({
        type: 'text',
        name: 'recipient',
        message: 'What is the address of recipient?',
        validate: input => sdk.web3.utils.isAddress(input),
    });
    recipient = response3.recipient;

    let response4 = await prompts({
        type: 'number',
        name: 'amount',
        message: 'What is amount of TFC to claim?',
        min: 0
    });
    const amount = new BN(response4.amount);
    const nonce = await manager.getUnusedNonce();
    const signature = manager.signTFCClaim(recipient, amount, nonce, admin);
    console.log("Recipient:", recipient);
    console.log("Amount:", amount.toString());
    console.log("Nonce:", nonce.toString());
    console.log("Signature:", signature);
})()
