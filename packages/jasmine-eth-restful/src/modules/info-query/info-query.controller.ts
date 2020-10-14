import {Controller, Get, Param, ParseIntPipe, Query} from "@nestjs/common";
import InfoQueryService from "./info-query.service";
import {SortOrder} from "./models/sort-order";
import BlocksQueryModel, {BlockBasicInfo} from "./models/blocks-query.response";
import MetadataModel from "./models/metadata.model";
import BlockInfoResponse, {BlockInfo} from "./models/block-info.response";
import TransactionsQueryResponse, {TransactionBasicInfo} from "./models/transactions-query.response";
import TransactionInfoResponse, {
    ApprovalEvent,
    TransactionInfo,
    TransferEvent
} from "./models/transaction-info.response";
import AccountTransactionsResponse from "./models/account-transactions.response";
import AccountBalanceResponse from "./models/account-balance.response";
import ContractStatusResponse, {MintEvent} from "./models/contract-status.response";
import {ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation} from "@nestjs/swagger";

@Controller()
export default class InfoQueryController {
    constructor(
        private readonly infoQueryService: InfoQueryService,
    ) {
    }

    @Get("blocks")
    @ApiOperation({summary: "Query blocks"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({type: BlocksQueryModel})
    public getBlocks(@Query("sortOrder") sortOrder: SortOrder,
                     @Query("page", ParseIntPipe) page: number,
                     @Query("count", ParseIntPipe) count: number): BlocksQueryModel {
        const blocks: BlockBasicInfo[] = [
            {
                hash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
                height: 1,
                parentHash: "0x2302e1c0b972d00932deb5dab9eb2982f570597d9d42504c05d9c2147eaf9c88",
                timestamp: 1429287689,
                transactions: [
                    "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
                ]
            },
            {
                hash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b47",
                height: 2,
                parentHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
                timestamp: 1429288689,
                transactions: [
                    "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8c",
                ]
            }
        ];
        const pageSize = count;
        return <BlocksQueryModel>{
            code: 200,
            msg: "OK",
            data: {
                metadata: <MetadataModel>{
                    totalCount: blocks[blocks.length - 1].height,
                    page: page,
                    count: Math.ceil(blocks.length / pageSize),
                },
                blocks: blocks.slice(pageSize * (page - 1), pageSize * page),
            }
        }
    }

    @Get("blockInfo")
    @ApiOperation({summary: "Get block information"})
    @ApiBadRequestResponse({description: "Invalid block height"})
    @ApiNotFoundResponse({description: "Block not found"})
    @ApiOkResponse({type: BlockInfoResponse})
    public getBlockInfo(@Query("height", ParseIntPipe) height: number): BlockInfoResponse {
        const blocks: BlockInfo[] = [
            {
                hash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
                height: 1,
                parentHash: "0x2302e1c0b972d00932deb5dab9eb2982f570597d9d42504c05d9c2147eaf9c88",
                nonce: "0xfb6e1a62d119228b",
                sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
                logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                transactionsRoot: "0x3a1b03875115b79539e5bd33fb00d8f7b7cd61929d5a3c574f507b8acf415bee",
                stateRoot: "0xf1133199d44695dfa8fd1bcfe424d82854b5cebef75bddd7e40ea94cda515bcb",
                miner: "0x8888f1f195afa192cfee860698584c030f4c9db1",
                difficulty: '21345678965432',
                totalDifficulty: '324567845321',
                size: 616,
                extraData: "0x",
                gasLimit: 3141592,
                gasUsed: 21662,
                timestamp: 1429287689,
                transactions: [
                    "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
                ],
                uncles: [],
            },
            {
                hash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b47",
                height: 2,
                parentHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
                nonce: "0xfb6e1a62d119228c",
                sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
                logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                transactionsRoot: "0x3a1b03875115b79539e5bd33fb00d8f7b7cd61929d5a3c574f507b8acf415bee",
                stateRoot: "0xf1133199d44695dfa8fd1bcfe424d82854b5cebef75bddd7e40ea94cda515bcb",
                miner: "0x8888f1f195afa192cfee860698584c030f4c9db1",
                difficulty: '21345678965432',
                totalDifficulty: '324567845321',
                size: 616,
                extraData: "0x",
                gasLimit: 3141592,
                gasUsed: 21662,
                timestamp: 1429288689,
                transactions: [
                    "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8c",
                ],
                uncles: [],
            }
        ];

        return <BlockInfoResponse>{
            code: 200,
            msg: "OK",
            data: {
                block: blocks.find(value => value.height === height),
            }
        }
    }

    @Get("txs")
    @ApiOperation({summary: "Query transactions"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({type: TransactionsQueryResponse})
    public getTxs(@Query('sortOrder') sortOrder: SortOrder,
                  @Query('page', ParseIntPipe) page: number,
                  @Query('count', ParseIntPipe) count: number): TransactionsQueryResponse {
        const txs: TransactionBasicInfo[] = [
            {
                hash: "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
                blockHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
                blockHeight: 1,
            },
            {
                hash: "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8c",
                blockHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b47",
                blockHeight: 2,
            }
        ];

        const pageSize = count;

        return <TransactionsQueryResponse>{
            code: 200,
            msg: "OK",
            data: {
                metadata: {
                    totalCount: txs.length,
                    page: page,
                    count: Math.ceil(txs.length / pageSize),
                },
                txs: txs.slice(pageSize * (page - 1), pageSize * page),
            }
        }
    }

    @Get("tx")
    @ApiOperation({summary: "Get transaction information"})
    @ApiBadRequestResponse({description: "Invalid transaction hash"})
    @ApiNotFoundResponse({description:"Transaction not found"})
    @ApiOkResponse({type: TransactionInfoResponse})
    public getTx(@Query('txHash') txHash: string): TransactionInfoResponse {
        const txs: TransactionInfo[] = [
            {
                hash: "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
                blockHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
                blockHeight: 1,
                nonce: 2,
                transactionIndex: 0,
                from: "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b",
                to: "0x6295ee1b4f6dd65047762f924ecd367c17eabf8f",
                value: '123450000000000000',
                gasUsed: 314159,
                gasPrice: '2000000000000',
                input: "0x57cb2fc4",
                status: true,
                events: [
                    <TransferEvent>{
                        params: {
                            from: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                            to: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                            value: "100000000000000000",
                        },
                        raw: {
                            data: "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
                            topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
                        },
                        name: "Transfer",
                        signature: "0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7",
                        address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                    }
                ],
            },
            {
                hash: "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8c",
                blockHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b47",
                blockHeight: 2,
                nonce: 2,
                transactionIndex: 0,
                from: "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b",
                to: "0x6295ee1b4f6dd65047762f924ecd367c17eabf8f",
                value: '123450000000000000',
                gasUsed: 314159,
                gasPrice: '2000000000000',
                input: "0x57cb2fc4",
                status: true,
                events: [
                    <ApprovalEvent>{
                        params: {
                            owner: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                            spender: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                            value: "100000000000000000",
                        },
                        raw: {
                            data: "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
                            topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
                        },
                        name: "Transfer",
                        signature: "0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7",
                        address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                    }
                ],
            }
        ];

        return {
            code: 200,
            msg: "OK",
            data: {
                tx: txs.find(value => value.hash === txHash),
            }
        };
    }

    @Get("txs/:address")
    @ApiOperation({summary: "Query the history transactions of an account"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({type: AccountTransactionsResponse})
    public getAccountTxs(@Param('address') address: string,
                         @Query('page', ParseIntPipe) page: number,
                         @Query('count', ParseIntPipe) count: number): AccountTransactionsResponse {
        return {
            code: 200,
            msg: "OK",
            data: {
                metadata: {
                    totalCount: 2,
                    page: page,
                    count: 2,
                },
                txHashes: ["0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe"]
            }
        }
    }

    @Get("balance/:address")
    @ApiOperation({summary: "Query account ERC20 balance"})
    @ApiBadRequestResponse({description: "Invalid account address"})
    @ApiOkResponse({type: AccountBalanceResponse})
    public getAccountBalance(@Param('address') address: string): AccountBalanceResponse {
        return {
            code: 200,
            msg: "OK",
            data: {
                balance: '1000000000000000000',
            }
        }
    }

    @Get("status/:contractAddress")
    @ApiOperation({summary: "Get contract status"})
    @ApiBadRequestResponse({description: "Invalid contract address"})
    @ApiNotFoundResponse({description: "Contract not found"})
    @ApiOkResponse({type: ContractStatusResponse})
    public getContractStatus(@Param('contractAddress') contractAddress: string): ContractStatusResponse {
        return {
            code: 200,
            msg: "OK",
            data: {
                name: "TFCToken",
                symbol: "TFC",
                decimals: 18,
                totalSupply: "1000000000000000000",
                address: contractAddress,
                mintEvents: [
                    <MintEvent>{
                        params: {
                            from: "0x0",
                            to: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                            value: "100000000000000000",
                        },
                        raw: {
                            data: "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
                            topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
                        },
                        name: "Transfer",
                        signature: "0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7",
                        address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
                    }
                ]
            }
        }
    }
}
