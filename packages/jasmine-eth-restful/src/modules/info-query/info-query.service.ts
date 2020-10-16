import {Injectable} from "@nestjs/common";
import {ContractStatus, MintEvent, MintEventParams} from "./models/contract-status.response";
import SDK, {Address, TFC} from "jasmine-eth-ts";
import {ConfigService} from "@nestjs/config";
import * as _ from "lodash";
import {
    ApprovalEvent, ApprovalEventParams,
    ContractEvent,
    TransactionInfo,
    TransferEvent,
    TransferEventParams
} from "./models/transaction-info.response";
import BN from "bn.js";
import {TransactionBasicInfo} from "./models/transactions-query.response";
import {BlockInfo} from "./models/block-info.response";
import {BlockBasicInfo} from "./models/blocks-query.response";
import {SortOrder} from "./models/sort-order";

@Injectable()
export default class InfoQueryService {

    private readonly sdk: SDK;

    private readonly tfc: TFC;

    constructor(private readonly configService: ConfigService) {
        this.sdk = new SDK(configService.get<string>('ethereum.endpoint'));
        this.tfc = this.sdk.getTFC(configService.get<string>('ethereum.tfcAddress'));
    }

    public async getContractStatus(): Promise<ContractStatus> {
        const events = await this.tfc.contract.getPastEvents("Transfer", {
            filter: {
                from: "0x0000000000000000000000000000000000000000",
            },
            fromBlock: "earliest"
        });
        const mintEvents = events.map(event => <MintEvent>{
            params: {
                from: event.returnValues['from'],
                to: event.returnValues['to'],
                value: "0x" + new BN(event.returnValues['value']).toString("hex"),
            },
            raw: event.raw,
            signature: event.signature,
            address: event.address,
        })

        return {
            name: await this.tfc.name(),
            symbol: await this.tfc.symbol(),
            decimals: await this.tfc.decimals(),
            address: this.configService.get<string>('ethereum.tfcAddress'),
            totalSupply: "0x" + (await this.tfc.totalSupply()).toString("hex"),
            mintEvents: mintEvents,
        }
    }

    public async getAccountBalance(address: Address): Promise<BN> {
        return await this.tfc.balanceOf(address);
    }

    public async getAccountTxs(address: Address): Promise<string[]> {
        const fromTransferEvents = await this.tfc.contract.getPastEvents("Transfer", {
            filter: {
                from: address,
            },
            fromBlock: "earliest",
        });

        const toTransferEvents = await this.tfc.contract.getPastEvents("Transfer", {
            filter: {
                to: address,
            },
            fromBlock: "earliest",
        });

        const ownerApprovalEvents = await this.tfc.contract.getPastEvents("Approval", {
            filter: {
                owner: address,
            },
            fromBlock: "earliest",
        });

        const spenderApprovalEvents = await this.tfc.contract.getPastEvents("Approval", {
            filter: {
                spender: address,
            },
            fromBlock: "earliest",
        });

        let transferEvents = [...fromTransferEvents, ...toTransferEvents];
        // remove duplicate events
        transferEvents = _.uniq(transferEvents, event => JSON.stringify([event.transactionHash, event.logIndex]));

        let approvalEvents = [...ownerApprovalEvents, ...spenderApprovalEvents];
        // remove duplicate events
        approvalEvents = _.uniq(approvalEvents, event => JSON.stringify([event.transactionHash, event.logIndex]));

        const transactions = {};
        for (const event of [...transferEvents, ...approvalEvents]) {
            if (event.transactionHash in transactions) {
                continue;
            }
            transactions[event.transactionHash] = await this.sdk.web3.eth.getTransaction(event.transactionHash);
        }

        let transactionList = Object.values(transactions);
        transactionList = _.sortBy(transactionList, transaction => transaction.blockNumber);
        return transactionList.map(tx => tx['hash']);
    }

    public async getBlockNumber(): Promise<number> {
        return await this.sdk.web3.eth.getBlockNumber();
    }

    public async getTransaction(txHash: string): Promise<TransactionInfo> {
        const tx = await this.sdk.web3.eth.getTransaction(txHash);
        if (!tx) {
            // transaction does not exist
            return null;
        }

        const receipt = await this.sdk.web3.eth.getTransactionReceipt(txHash);

        const events: ContractEvent[] = [];

        if (receipt) {
            for (const log of receipt.logs) {
                const transferEventAbi = this.tfc.abi.find(item => item.name === "Transfer");
                try {
                    const params = this.sdk.web3.eth.abi.decodeLog(
                        transferEventAbi.inputs,
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
                    const approvalEventAbi = this.tfc.abi.find(item => item.name === "Approval");
                    try {
                        const params = this.sdk.web3.eth.abi.decodeLog(
                            approvalEventAbi.inputs,
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
        }
    }

    public async getTransactions(): Promise<TransactionBasicInfo[]> {
        let events = await this.tfc.contract.getPastEvents("allEvents", {
            fromBlock: "earliest",
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
        return _.uniq(txs, "hash");
    }

    public async getBlockInfo(height: number): Promise<BlockInfo> {
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
        let events = await this.tfc.contract.getPastEvents("allEvents", {
            fromBlock: "earliest",
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
            })
        }
        return [blocks, Math.ceil(blockNumbers.length / count)];
    }

    public validateTxHash(hash: string): boolean {
        return /^0x([A-Fa-f0-9]{64})$/.test(hash);
    }
};
