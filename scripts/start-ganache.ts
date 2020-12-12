/**
 * This script is used to start a local private Ethereum testnet using Ganache-core
 */

import prompts from "prompts";
import * as fs from "fs";
import {WriteStream} from "fs";
import path from "path";
import chalk from "chalk";
import ganacheCore from "ganache-core";
import * as tar from "tar";

interface JsonRpcRequest {
    id: number,
    method: string,
    params: any[],
}

interface JsonRpcResponse {
    id: number,
    result: any,
}

class Logger {
    private readonly logStream: WriteStream;

    private pendingRequests: { [id: number]: JsonRpcRequest[] } = {};

    constructor(
        private readonly logFilePath: string,
        private readonly ignoredRPCs: string[] = []) {
        this.logStream = fs.createWriteStream(logFilePath);
        console.log("Log file generated at " + logFilePath);
    }

    log(data: string) {
        if (Logger.isRequest(data)) {
            const req = Logger.parseRequest(data);
            if (!this.pendingRequests[req.id]) {
                this.pendingRequests[req.id] = [];
            }
            this.pendingRequests[req.id].push(req);
        } else if (Logger.isResponse(data)) {
            const resp = Logger.parseResponse(data);
            if (resp.id in this.pendingRequests && this.pendingRequests[resp.id].length > 0) {
                const req = this.pendingRequests[resp.id].pop() as JsonRpcRequest;
                if (this.ignoredRPCs.includes(req.method)) {
                    return;
                }
                this.logRequestResponse(req, resp);
            } else {
                // no match request
                this.logRequestResponse(undefined, resp);
            }
        } else if (Logger.isMethodName(data)) {
            return;
        } else {
            this._log(data);
        }
    }

    private _log(msg: string) {
        const time = currentTimeString();
        console.log(chalk.green(`[${time}] `) + msg);
        this.logStream.write(`[${time}] ` + msg + "\n");
    }

    private logRequestResponse(req: JsonRpcRequest | undefined, resp: JsonRpcResponse) {
        const served = {
            method: req?.method,
            params: req?.params,
            result: resp.result,
        }
        const msg = `Served JSON-RPC: ${JSON.stringify(served)}`;
        this._log(msg);
    }

    private static isRequest(data: string): boolean {
        return data.trim().startsWith(">");
    }

    private static isResponse(data: string): boolean {
        return data.trim().startsWith("<");
    }

    private static isMethodName(data: string): boolean {
        return new RegExp(/^[a-zA-Z]/).test(data);
    }

    private static parseResponse(data: string): JsonRpcResponse {
        data = data.replace(/\s<\s\s/g, "");
        return JSON.parse(data);
    }

    private static parseRequest(data: string): JsonRpcRequest {
        data = data.replace(/\s\s>\s/g, "");
        return JSON.parse(data);
    }

    close() {
        this.logStream.close();
    }
}

const logDir = process.env.JASMINE_LOG ? process.env.JASMINE_LOG : path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, {recursive: true});
}
if (!fs.statSync(logDir).isDirectory()) {
    console.error(`Log path ${logDir} is not a directory`);
}

function currentTimeString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()},${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
}

const logger = new Logger(path.join(__dirname, "..", "logs", `private-chain.${currentTimeString()}.log`), ["eth_blockNumber"]);


(async () => {
    let response4 = await prompts({
        type: "select",
        name: "startType",
        message: "Start a new private blockchain or use an existing one?",
        choices: [
            {title: 'Start a new chain', value: 'new'},
            {title: 'Using existing chain from database path', value: 'existingPath'},
            {title: 'Using existing chain from backup tarball', value: "existingTarball"}
        ],
        initial: 0,
    });
    if (response4.startType === undefined) {
        return;
    }
    let dbPath: string | undefined;
    if (response4.startType === "new") {
        const response5 = await prompts({
            type: "text",
            name: "dbPath",
            message: "What is the path to save chain database? (absolute path)",
        });
        if (response5.dbPath === undefined) {
            return;
        }
        dbPath = response5.dbPath;
    } else if (response4.startType === "existingPath") {
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
                if (!fs.existsSync(path.join(prev, "!blocks!0")) ||
                    !fs.statSync(path.join(prev, "!blocks!0")).isFile()) {
                    return `path ${prev} doesn't seem to be an existing chain database`
                }
                return true;
            }
        });
        if (response5.dbPath === undefined) {
            return;
        }
        dbPath = response5.dbPath;
    } else if (response4.startType === "existingTarball") {
        const response6 = await prompts({
            type: "text",
            name: "tarballPath",
            message: "What is the path to backup tarball file?",
            validate: prev => {
                if (!fs.existsSync(prev)) {
                    return "file not exist";
                }
                if (!fs.statSync(prev).isFile()) {
                    return `${prev} is not a file`;
                }
                return true;
            }
        });
        if (response6.tarballPath === undefined) {
            return;
        }
        const defaultBlockchainDir = path.join(__dirname, "..", "blockchain");
        if (!fs.existsSync(defaultBlockchainDir)) {
            fs.mkdirSync(defaultBlockchainDir, {recursive: true});
        }
        if (!fs.statSync(defaultBlockchainDir).isDirectory()) {
            console.error(`Default Blockchain path ${defaultBlockchainDir} is not a directory`);
            return;
        }
        console.log(chalk.green("Extracting backup tarball..."));
        dbPath = fs.mkdtempSync(path.join(defaultBlockchainDir, "chain-"));
        tar.extract(
            {
                file: response6.tarballPath,
                sync: true,
                cwd: path.join(dbPath)
            }
        );
        console.log(chalk.green(`Chain database backup extracted to ${dbPath}`))
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

    if (!port) {
        return;
    }

    let response5 = await prompts({
        type: "number",
        min: 0,
        name: "blockTime",
        message: "Provide the time interval of block mining (in seconds)",
        initial: 0
    });
    const blockTime = response5.blockTime;

    logger.log("Starting private Ethereum blockchain...");
    logger.log(`[Config] Data directory: ${dbPath}`);
    logger.log(`[Config] Http Ethereum endpoint: http://${host}:${port}`);
    logger.log(`[Config] WebSocket Ethereum endpoint: ws://${host}:${port}`);
    if (blockTime == 0) {
        logger.log(`[Config] Only mine blocks when transaction comes`);
    } else if (blockTime > 0) {
        logger.log(`[Config] Mine blocks at time interval of ${blockTime} seconds`);
    }
    const mnemonic = "myth like bonus scare over problem client lizard pioneer submit female collect";

    const config: ganacheCore.IServerOptions = {
        port: port,
        mnemonic: mnemonic,
        gasPrice: "0x0",
        network_id: 2020,
        networkId: 2020,
        ws: true,
        gasLimit: "0xffffffff",
        db_path: dbPath,
        logger: logger,
        verbose: true,
    }
    if (blockTime > 0) {
        config.blockTime = blockTime;
    }
    // @ts-ignore
    config["_chainId"] = 2020;
    // @ts-ignore
    config["_chainIdRpc"] = 2020;

    console.log();

    const server = ganacheCore.server(config);

    const listener = (err: Error, blockchain: any) => {
        const accounts = blockchain.accounts;
        let count = 0;
        for (const address in accounts) {
            if (accounts.hasOwnProperty(address)) {
                const account: { secretKey: Buffer } = accounts[address];
                logger.log(`[Account ${count}] Address: ${address}`);
                logger.log(`[Account ${count}] PrivateKey: 0x${account.secretKey.toString('hex')}`);
                count++;
            }
        }
    }

    process.on("uncaughtException", function (e) {
        console.log(e.stack);
        process.exit(1);
    })

    const closeHandler = function () {
        console.log(chalk.yellow(`Blockchain data is stored at ${dbPath}`));
        console.log(chalk.yellow("Set chain database path to this path to restore the blockchain"));
        // graceful shutdown
        server.close(function (err) {
            if (err) {
                console.log(err.stack || err);
                process.exit();
            } else {
                process.exit(0);
            }
        });
        // backup data dir
        console.log(chalk.green("Backup chain database..."));
        const backupDir = process.env.JASMINE_BACKUP ? process.env.JASMINE_BACKUP : path.join(__dirname, "..", "backup");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, {recursive: true});
        }
        if (!fs.statSync(backupDir).isDirectory()) {
            console.error(`Backup path ${backupDir} is not a directory`);
        }
        const backupFile = `testnet.${currentTimeString()}.tgz`;
        tar.create(
            {
                gzip: true,
                sync: true,
                file: path.join(backupDir, backupFile),
                preservePaths: false,
                cwd: dbPath as string
            },
            [...fs.readdirSync(dbPath as string)]
        );
        console.log(chalk.green("Chain database backup saved to " + path.join(backupDir, backupFile)));
        console.log(chalk.green("Blockchain stopped"));
        logger.close();
    }

    process.on("exit", closeHandler);
    // process.on("SIGINT", closeHandler);
    // process.on("SIGTERM", closeHandler);
    // process.on("SIGHUP", closeHandler);

    // @ts-ignore
    server.listen(port, host, listener);
    logger.log("Blockchain started");

})()
