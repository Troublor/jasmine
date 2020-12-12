/**
 * This script acts as a helper to deploy jasmine-eth smart contracts on Ethereum
 */

import prompts from "prompts";
import SDK, {Account, Address, TFC} from "jasmine-eth-ts";
import BN from "bn.js";
import * as _ from "lodash";

let sdk: SDK | undefined;

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

    let deployer: Account | undefined;
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
                const balance = await sdk.balanceOf((deployer as Account).address);
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

    const response2 = await prompts({
        type: "confirm",
        name: "migrate",
        message: "Do you want to migrate from existing TFC contract?",
        initial: false,
    });
    let legacyTfc: TFC | undefined;
    if (response2.migrate) {
        while (!legacyTfc) {
            const response3 = await prompts({
                type: "text",
                name: "legacyTFCAddress",
                message: "What is the existing TFCToken (ERC20) contract address?",

            });
            if (response3.legacyTFCAddress === undefined) {
                return;
            }
            try {
                const contract = sdk.getTFC(response3.legacyTFCAddress);
                const symbol = await contract.symbol();
                if (symbol !== "TFC") {
                    console.error(`Contract at ${response3.legacyTFCAddress} is not a TFCToken (ERC20) contract`);
                }
                legacyTfc = contract;
            } catch (e) {
                console.error(`Address ${response3.legacyTFCAddress} is not a TFCToken (ERC20) contract`);
            }
        }
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

    const manager = sdk.getManager(managerAddress);
    let tfcAddress: string;
    try {
        tfcAddress = await manager.tfcAddress();
    } catch (e) {
        console.error(`Fetch TFCToken contract address error: ${e.toString()}`);
        return;
    }

    const tfc = sdk.getTFC(tfcAddress);

    if (response2.migrate) {
        console.log("Migrating from legacy TFCToken (ERC20) contract...");
        if (legacyTfc === undefined) {
            return;
        }
        const transferEvents = await legacyTfc.contract.getPastEvents("Transfer", {fromBlock: 0});
        const addresses = _.uniq(transferEvents.map(event => event.returnValues["to"]));
        for (const addr of addresses) {
            const balance = await legacyTfc.balanceOf(addr);
            if (balance.gt(new BN(0))) {
                console.log(`Migrating account ${addr} with balance ${balance}`);
                await tfc.mint(addr, balance, deployer);
            }
        }
        console.log("Migration done");
    }

    console.log(`TFCManager contract address: ${managerAddress}`);
    console.log(`TFCToken (ERC20) contract address: ${tfcAddress}`);
    console.log(`Admin account address: ${deployer.address}`);
    console.log(`Admin account private key: ${deployer.privateKey}`);
    process.exit(0);
})()
