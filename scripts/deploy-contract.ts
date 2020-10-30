/**
 * This script acts as a helper to deploy jasmine-eth smart contracts on Ethereum
 */

import prompts from "prompts";
import SDK, {Account, Address} from "jasmine-eth-ts";
import BN from "bn.js";

let sdk: SDK;

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
        type: 'select',
        name: 'accountType',
        message: 'What kind of account would you use to deploy contracts?',
        choices: [
            {title: "Use existing account", value: "existing"},
            {title: "Create a new account", value: 'new'},
        ],
        initial: 0,
    });

    let deployer: Account;
    if (response1.accountType === 'new') {
        console.log("Here is the new account:");
        deployer = sdk.createAccount();
        console.log(`Address: ${deployer.address}`);
        console.log(`Private Key: ${deployer.privateKey}`);
        console.log(`Please first transfer some ETH to this new account, and then come back to deploy contracts.`);
        return;
    } else if (response1.accountType === 'existing') {
        while (!deployer) {
            let response2 = await prompts({
                type: "text",
                name: "privateKey",
                message: "What is the private key of your account?",
            });
            try {
                deployer = sdk.retrieveAccount(response2.privateKey);
            } catch (e) {
                console.error(`Something wrong with your private key: ${e.toString()}`);
            }
            try {
                const balance = await sdk.balanceOf(deployer.address);
                if (balance.eq(new BN(0))) {
                    console.error(`Your account has no ETH balance. Cannot deploy contract with this account.`);
                }
            } catch (e) {
                console.error(`Fail to get balance of this account: ${e.toString()}`);
            }
        }
    } else {
        return;
    }

    console.log(`Deploying TFC ERC20 contracts...`);
    let managerAddress: Address;
    try {
        managerAddress = await sdk.deployManager(deployer);
        console.log(`Contracts deployed.`);
    } catch (e) {
        console.error(`Failed to deploy contracts: ${e.toString()}`);
        return;
    }

    console.log(`TFCManager contract address: ${managerAddress}`);
    const manager = sdk.getManager(managerAddress);
    try {
        const tfcAddress = await manager.tfcAddress();
        console.log(`TFCToken (ERC20) contract address: ${tfcAddress}`);
        console.log(`Admin account address: ${deployer.address}`);
        console.log(`Admin account private key: ${deployer.privateKey}`);
    } catch (e) {
        console.error(`Fetch TFCToken contract address error: ${e.toString()}`);
        return;
    }
    process.exit(0);
})()
