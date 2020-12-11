import {Injectable} from "@nestjs/common";
import {ContractStatus, MintEvent, MintEventParams} from "./models/contract-status.response";
import SDK, {Address, TFC} from "jasmine-eth-ts";
import {ConfigService} from "@nestjs/config";
import _ from "lodash";
import {
    ApprovalEvent, ApprovalEventParams,
    ContractEvent,
    TransactionInfo,
    TransferEvent,
    TransferEventParams,
} from "./models/transaction-info.response";
import BN from "bn.js";
import {TransactionBasicInfo} from "./models/transactions-query.response";
import {BlockInfo} from "./models/block-info.response";
import {BlockBasicInfo} from "./models/blocks-query.response";
import {SortOrder} from "./models/sort-order";
import Web3Utils from "web3-utils";

const networkId = 2020;

@Injectable()
export default class InfoQueryServices {

    private readonly sdk: SDK;

    private readonly tfc: TFC;

    constructor(private readonly configService: ConfigService) {
        this.sdk = new SDK(configService.get<string>("ethereum.endpoint.internal", "ethereum endpoint unprovided"));
        this.tfc = this.sdk.getTFC(configService.get<string>("ethereum.contracts.erc20", "tfc-erc20 address unprovided"));
    }

    public async getContractStatus(): Promise<ContractStatus> {
        const events = await this.tfc.contract.getPastEvents("Transfer", {
            filter: {
                from: "0x0000000000000000000000000000000000000000",
            },
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });
        const mintEvents = events.map(event => <MintEvent>{
            params: {
                from: event.returnValues["from"],
                to: event.returnValues["to"],
                value: "0x" + new BN(event.returnValues["value"]).toString("hex"),
            },
            raw: event.raw,
            signature: event.signature,
            address: event.address,
        });

        return {
            name: await this.tfc.name(),
            symbol: await this.tfc.symbol(),
            decimals: await this.tfc.decimals(),
            address: this.configService.get<string>("ethereum.contracts.erc20", "tfc-erc20 address unprovided"),
            totalSupply: "0x" + (await this.tfc.totalSupply()).toString("hex"),
            mintEvents: mintEvents,
        };
    }

    public async getAccountBalance(address: Address): Promise<BN> {
        return await this.tfc.balanceOf(address);
    }

    public async getAccountTxs(address: Address): Promise<string[]> {
        const fromTransferEvents = await this.tfc.contract.getPastEvents("Transfer", {
            filter: {
                from: address,
            },
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });

        const toTransferEvents = await this.tfc.contract.getPastEvents("Transfer", {
            filter: {
                to: address,
            },
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });

        const ownerApprovalEvents = await this.tfc.contract.getPastEvents("Approval", {
            filter: {
                owner: address,
            },
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });

        const spenderApprovalEvents = await this.tfc.contract.getPastEvents("Approval", {
            filter: {
                spender: address,
            },
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });

        let transferEvents = [...fromTransferEvents, ...toTransferEvents];
        // remove duplicate events
        transferEvents = _.uniqBy(transferEvents, event => JSON.stringify([event.transactionHash, event.logIndex]));

        let approvalEvents = [...ownerApprovalEvents, ...spenderApprovalEvents];
        // remove duplicate events
        approvalEvents = _.uniqBy(approvalEvents, event => JSON.stringify([event.transactionHash, event.logIndex]));

        const transactions: { [hash: string]: any } = {};
        for (const event of [...transferEvents, ...approvalEvents]) {
            if (event.transactionHash in transactions) {
                continue;
            }
            transactions[event.transactionHash] = await this.sdk.web3.eth.getTransaction(event.transactionHash);
        }

        let transactionList = Object.values(transactions);
        transactionList = _.sortBy(transactionList, transaction => transaction.blockNumber);
        return transactionList.map(tx => tx["hash"]);
    }

    public async getBlockNumber(): Promise<number> {
        return await this.sdk.web3.eth.getBlockNumber();
    }

    public async getTransaction(txHash: string): Promise<TransactionInfo | null> {
        const tx = await this.sdk.web3.eth.getTransaction(txHash);
        if (!tx) {
            // transaction does not exist
            return null;
        }

        const receipt = await this.sdk.web3.eth.getTransactionReceipt(txHash);

        const events: ContractEvent[] = [];

        if (receipt) {
            for (const log of receipt.logs) {
                const transferEventAbi = this.tfc.abi.find(item => item.name === "Transfer") as Web3Utils.AbiItem;
                try {
                    const params = this.sdk.web3.eth.abi.decodeLog(
                        transferEventAbi.inputs as Web3Utils.AbiInput[],
                        log.data,
                        transferEventAbi.anonymous ? log.topics : log.topics.slice(1),
                    );
                    if (params["from"] === "0x0000000000000000000000000000000000000000") {
                        // mint event
                        events.push(<MintEvent>{
                            params: <MintEventParams>{
                                from: "0x0000000000000000000000000000000000000000",
                                to: params["to"] as string,
                                value: "0x" + new BN(params["value"]).toString("hex"),
                            },
                            raw: {
                                data: log.data,
                                topics: log.topics,
                            },
                            name: "Mint",
                            signature: this.sdk.web3.eth.abi.encodeEventSignature(transferEventAbi),
                            address: log.address,
                        });
                    } else {
                        events.push(<TransferEvent>{
                            params: <TransferEventParams>{
                                from: params["from"] as string,
                                to: params["to"] as string,
                                value: "0x" + new BN(params["value"]).toString("hex"),
                            },
                            raw: {
                                data: log.data,
                                topics: log.topics,
                            },
                            name: "Transfer",
                            signature: this.sdk.web3.eth.abi.encodeEventSignature(transferEventAbi),
                            address: log.address,
                        });
                    }
                } catch (e) {
                    const approvalEventAbi = this.tfc.abi.find(item => item.name === "Approval") as Web3Utils.AbiItem;
                    try {
                        const params = this.sdk.web3.eth.abi.decodeLog(
                            approvalEventAbi.inputs as Web3Utils.AbiInput[],
                            log.data,
                            approvalEventAbi.anonymous ? log.topics : log.topics.slice(1),
                        );
                        events.push(<ApprovalEvent>{
                            params: <ApprovalEventParams>{
                                owner: params["owner"] as string,
                                spender: params["spender"] as string,
                                value: "0x" + new BN(params["value"]).toString("hex"),
                            },
                            raw: {
                                data: log.data,
                                topics: log.topics,
                            },
                            name: "Approval",
                            signature: this.sdk.web3.eth.abi.encodeEventSignature(approvalEventAbi),
                            address: log.address,
                        });
                    } catch (e) {
                    }
                }
            }
        }

        return <TransactionInfo>{
            hash: txHash,
            blockHash: tx.blockHash,
            blockHeight: tx.blockNumber,
            nonce: tx.nonce,
            transactionIndex: tx.transactionIndex,
            from: tx.from,
            to: tx.to,
            value: "0x" + new BN(tx.value).toString("hex"),
            gasUsed: receipt ? receipt.gasUsed : null,
            gasPrice: tx.gasPrice,
            input: tx.input,
            status: receipt ? receipt.status : null,
            events: events,
        };
    }

    public async getTransactions(): Promise<TransactionBasicInfo[]> {
        const events = await this.tfc.contract.getPastEvents("allEvents", {
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });
        const txs = events
            .filter(event => ["Transfer", "Approval"].includes(event.event))
            .sort((e1, e2): number => {
                if (e1.blockNumber < e2.blockNumber) return -1;
                else if (e1.blockNumber > e2.blockNumber) return 1;
                else {
                    if (e1.transactionIndex < e2.transactionIndex) return -1;
                    else if (e1.transactionIndex > e2.transactionIndex) return 1;
                    else {
                        if (e1.logIndex < e2.logIndex) return -1;
                        else if (e1.logIndex > e2.logIndex) return 1;
                        else return 0;
                    }
                }
            })
            .map(event => <TransactionBasicInfo>{
                hash: event.transactionHash,
                blockHash: event.blockHash,
                blockHeight: event.blockNumber,
            });
        return _.uniqBy(txs, value => value["hash"]);
    }

    public async getBlockInfo(height: number): Promise<BlockInfo | null> {
        const block = await this.sdk.web3.eth.getBlock(height);
        if (!block) {
            return null;
        }
        return <BlockInfo>{
            hash: block.hash,
            height: block.number,
            parentHash: block.parentHash,
            timestamp: block.timestamp,
            transactions: block.transactions,
            nonce: block.nonce,
            sha3Uncles: block.sha3Uncles,
            logsBloom: block.logsBloom,
            transactionsRoot: block.transactionRoot,
            stateRoot: block.stateRoot,
            miner: block.miner,
            difficulty: block.difficulty,
            totalDifficulty: block.totalDifficulty,
            size: block.size,
            extraData: block.extraData,
            gasLimit: block.gasLimit,
            gasUsed: block.gasUsed,
            uncles: block.uncles,
        };
    }

    public async getBlocks(sortOrder: SortOrder, page: number, count: number): Promise<[BlockBasicInfo[], number]> {
        const events = await this.tfc.contract.getPastEvents("allEvents", {
            fromBlock: this.configService.get<number>("filter.fromBlock", 0),
        });
        const txs = events
            .filter(event => ["Transfer", "Approval"].includes(event.event))
            .sort((e1, e2): number => {
                if (e1.blockNumber < e2.blockNumber) return -1;
                else if (e1.blockNumber > e2.blockNumber) return 1;
                else return 0;
            })
            .map(event => event.blockNumber);
        const blockNumbers = _.uniq(txs);
        const selectBlockNumbers = blockNumbers.slice(count * (page - 1), count * page);
        const blocks: BlockBasicInfo[] = [];
        for (const num of selectBlockNumbers) {
            const block = await this.sdk.web3.eth.getBlock(num);
            blocks.push(<BlockBasicInfo>{
                hash: block.hash,
                height: block.number,
                parentHash: block.parentHash,
                timestamp: block.timestamp,
                transactions: block.transactions,
            });
        }
        return [blocks, Math.ceil(blockNumbers.length / count)];
    }

    public validateTxHash(hash: string): boolean {
        return /^0x([A-Fa-f0-9]{64})$/.test(hash);
    }
};
