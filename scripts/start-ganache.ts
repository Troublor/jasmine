/**
 * This script is used to start a local private Ethereum testnet using Ganache-core
 */

import prompts from "prompts";
import Wallet from 'ethereumjs-wallet'
import BN from "bn.js";
import * as child_process from "child_process";
import * as fs from "fs";

(async () => {
    let response4 = await prompts({
        type: "select",
        name: "startType",
        message: "Create a brand-new blockchain or use an existing one?",
        choices: [
            {title: 'Start a new chain', value: 'new'},
            {title: 'Using existing chain', value: 'existing'},
        ],
        initial: 0,
    });
    if (response4.startType === undefined) {
        return;
    }
    let accounts: { secretKey: string, balance: string }[] | undefined;
    let dbPath: string | undefined;
    if (response4.startType === "new") {
        let response0 = await prompts({
            type: "confirm",
            name: "generateAccount",
            message: "Do you want to use automatically generated accounts?",
            initial: true,
        });
        if (response0.generateAccount === undefined) {
            return;
        } else if (!response0.generateAccount) {
            let response1 = await prompts({
                type: "text",
                name: "alloc",
                message: "What is your account ETH allocation config? format: JSON {[privateKey]: balance}",
                validate: input => {
                    try {
                        const alloc = JSON.parse(input);
                        for (let privateKey of Object.keys(alloc)) {
                            const balance = alloc[privateKey];
                            try {
                                if (privateKey.startsWith("0x")) {
                                    privateKey = privateKey.slice(2);
                                }
                                Wallet.fromPrivateKey(Buffer.from(privateKey, "hex"));
                            } catch (e) {
                                return `Invalid private key: ${e.toString()}`;
                            }
                        }
                    } catch (e) {
                        return `Invalid format, example: {"0xeee892cf591ae7d941e5b38bc98c900e430e1821046384bc756a3fe9e7840204":"1000000000000000000"}`
                    }
                    return true;
                }
            });
            const alloc = JSON.parse(response1.alloc);
            accounts = [];
            for (let privateKey of Object.keys(alloc)) {
                const b = alloc[privateKey];
                if (!privateKey.startsWith("0x")) {
                    privateKey = "0x" + privateKey;
                }
                accounts.push({
                    secretKey: privateKey,
                    balance: "0x" + new BN(b).toString("hex")
                });
            }
        } else {
            accounts = undefined;
        }

        const response6 = await prompts({
            type: "confirm",
            name: "saveChain",
            message: "Do you want to save the chain?",
            initial: false
        });
        if (response6.saveChain === undefined) {
            return;
        }

        if (response6.saveChain) {
            const response5 = await prompts({
                type: "text",
                name: "dbPath",
                message: "What is the path to save chain database?",
            });
            if (response5.dbPath === undefined) {
                return;
            }
            dbPath = response5.dbPath;
        }
    } else if (response4.startType === "existing") {
        const response5 = await prompts({
            type: "text",
            name: "dbPath",
            message: "What is the existing database path?",
            validate: prev => {
                if (!fs.existsSync(prev)) {
                    return `path ${prev} does not exist`;
                }
                if (!fs.statSync(prev).isDirectory()) {
                    return `path ${prev} is not a directory`;
                }
                return true;
            }
        });
        if (response5.dbPath === undefined) {
            return;
        }
        dbPath = response5.dbPath;
    } else return

    let response3 = await prompts({
        type: "text",
        name: "host",
        message: "What is the host name to listen on?",
        initial: "127.0.0.1",
    })

    const host = response3.host;

    let response2 = await prompts({
        type: "number",
        name: "port",
        message: "Which port do you want blockchain to run at?",
        initial: 8545,
        float: false,
        min: 0,
        max: 65535,
    });
    const port = response2.port;

    let response5 = await prompts({
        type: "number",
        min: 0,
        name: "blockTime",
        message: "Provide the time interval of block mining (in seconds)",
        initial: 0
    });
    const blockTime = response5.blockTime;

    const args = [`--port`, port, `--host`, host,];
    if (accounts) {
        for (let alloc of accounts) {
            args.push("--account", `${alloc.secretKey},${alloc.balance}`);
        }
    } else {
        args.push("--deterministic");
    }
    args.push("--gasPrice", "0x0");
    args.push("--chainId", "2020");
    args.push("--networkId", "2020");
    args.push("--blockTime", blockTime);

    if (dbPath) {
        args.push("--db", dbPath);
    }
    child_process.spawnSync("ganache-cli", args, {
        stdio: "inherit"
    });

})()
