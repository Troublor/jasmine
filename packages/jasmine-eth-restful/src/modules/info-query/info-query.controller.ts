import {
    BadRequestException,
    Controller,
    Get,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
    Param,
    ParseIntPipe,
    Query
} from "@nestjs/common";
import InfoQueryService from "./info-query.service";
import {SortOrder} from "./models/sort-order";
import BlocksQueryModel from "./models/blocks-query.response";
import BlockInfoResponse from "./models/block-info.response";
import TransactionsQueryResponse from "./models/transactions-query.response";
import TransactionInfoResponse from "./models/transaction-info.response";
import AccountTransactionsResponse from "./models/account-transactions.response";
import AccountBalanceResponse from "./models/account-balance.response";
import ContractStatusResponse from "./models/contract-status.response";
import {ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery} from "@nestjs/swagger";
import {Address, validateAndConvertAddress} from "jasmine-eth-ts";

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
    public async getBlocks(@Query("sortOrder") sortOrder: SortOrder,
                           @Query("page", ParseIntPipe) page: number,
                           @Query("count", ParseIntPipe) count: number): Promise<BlocksQueryModel> {
        if (SortOrder.ASCENDING !== sortOrder && SortOrder.DESCENDING !== sortOrder) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Query parameter 'sortOrder' must be 'asc' or 'desc'",
                data: null,
            });
        }

        if (page <= 0) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Query parameter 'page' must be positive integer",
                data: null,
            });
        }

        if (count <= 0) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Query parameter 'count' must be positive integer",
                data: null,
            });
        }

        try {
            let result = await this.infoQueryService.getBlocks(sortOrder, page, count);
            return {
                code: 200,
                msg: "OK",
                data: {
                    metadata: {
                        totalCount: await this.infoQueryService.getBlockNumber(),
                        page: page,
                        count: result[1],
                    },
                    blocks: result[0],
                }
            };
        } catch (e) {
            throw new InternalServerErrorException(<TransactionsQueryResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            })
        }
    }

    @Get("blockInfo")
    @ApiOperation({summary: "Get block information"})
    @ApiBadRequestResponse({description: "Invalid block height"})
    @ApiNotFoundResponse({description: "Block not found"})
    @ApiOkResponse({type: BlockInfoResponse})
    public async getBlockInfo(@Query("height", ParseIntPipe) height: number): Promise<BlockInfoResponse> {
        if (height <= 0) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Block height must be positive integer",
                data: null,
            });
        }

        try {
            const block = await this.infoQueryService.getBlockInfo(height);
            if (!block) {
                throw new NotFoundException(<BlockInfoResponse>{
                    code: 404,
                    msg: "Block not found",
                    data: null,
                });
            }
            return {
                code: 200,
                msg: "OK",
                data: {
                    block: block,
                }
            };
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new InternalServerErrorException(<TransactionInfoResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            });
        }
    }

    @Get("txs")
    @ApiOperation({summary: "Query transactions"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({type: TransactionsQueryResponse})
    public async getTxs(@Query('sortOrder') sortOrder: SortOrder,
                        @Query('page', ParseIntPipe) page: number,
                        @Query('count', ParseIntPipe) count: number): Promise<TransactionsQueryResponse> {
        if (SortOrder.ASCENDING !== sortOrder && SortOrder.DESCENDING !== sortOrder) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Query parameter 'sortOrder' must be 'asc' or 'desc'",
                data: null,
            });
        }

        if (page <= 0) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Query parameter 'page' must be positive integer",
                data: null,
            });
        }

        if (count <= 0) {
            throw new BadRequestException(<TransactionsQueryResponse>{
                code: 400,
                msg: "Query parameter 'count' must be positive integer",
                data: null,
            });
        }

        try {
            let txs = await this.infoQueryService.getTransactions();
            if (sortOrder === SortOrder.DESCENDING) {
                txs = txs.reverse();
            }
            return {
                code: 200,
                msg: "OK",
                data: {
                    metadata: {
                        totalCount: await this.infoQueryService.getBlockNumber(),
                        page: page,
                        count: Math.ceil(txs.length / count)
                    },
                    txs: txs.slice(count * (page - 1), count * page),
                }
            };
        } catch (e) {
            throw new InternalServerErrorException(<TransactionsQueryResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            })
        }
    }

    @Get("tx/:txHash")
    @ApiOperation({summary: "Get transaction information"})
    @ApiBadRequestResponse({description: "Invalid transaction hash"})
    @ApiNotFoundResponse({description: "Transaction not found"})
    @ApiOkResponse({type: TransactionInfoResponse})
    public async getTx(@Param('txHash') txHash: string): Promise<TransactionInfoResponse> {
        if (!this.infoQueryService.validateTxHash(txHash)) {
            throw new BadRequestException(<TransactionInfoResponse>{
                code: 400,
                msg: "Invalid transaction hash",
                data: null,
            });
        }
        try {
            const txInfo = await this.infoQueryService.getTransaction(txHash);
            if (!txInfo) {
                throw new NotFoundException(<TransactionInfoResponse>{
                    code: 404,
                    msg: "Transaction not found",
                    data: null,
                });
            }
            return {
                code: 200,
                msg: "OK",
                data: {
                    tx: txInfo,
                }
            };
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new InternalServerErrorException(<TransactionInfoResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            });
        }
    }

    @Get("txs/:address")
    @ApiOperation({summary: "Query the history transactions of an account"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({type: AccountTransactionsResponse})
    public async getAccountTxs(@Param('address') address: string,
                               @Query('page', ParseIntPipe) page: number,
                               @Query('count', ParseIntPipe) count: number): Promise<AccountTransactionsResponse> {
        if (page <= 0) {
            throw new BadRequestException(<AccountTransactionsResponse>{
                code: 400,
                msg: "Query parameter 'page' must be positive integer",
                data: null,
            });
        }

        if (count <= 0) {
            throw new BadRequestException(<AccountTransactionsResponse>{
                code: 400,
                msg: "Query parameter 'count' must be positive integer",
                data: null,
            });
        }

        const ethAddress = validateAndConvertAddress(address);
        if (!ethAddress) {
            throw new BadRequestException(<AccountTransactionsResponse>{
                code: 400,
                msg: "Invalid Ethereum address",
                data: null,
            })
        }
        try {
            const txHashes = await this.infoQueryService.getAccountTxs(address as Address);
            return {
                code: 200,
                msg: "OK",
                data: {
                    metadata: {
                        totalCount: await this.infoQueryService.getBlockNumber(),
                        page: page,
                        count: Math.ceil(txHashes.length / count),
                    },
                    txHashes: txHashes.slice(count * (page - 1), count * page),
                }
            }
        } catch (e) {
            throw new InternalServerErrorException(<AccountTransactionsResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            })
        }
    }

    @Get("balance/:address")
    @ApiOperation({summary: "Query account ERC20 balance"})
    @ApiBadRequestResponse({description: "Invalid account address"})
    @ApiOkResponse({type: AccountBalanceResponse})
    public async getAccountBalance(@Param('address') address: string): Promise<AccountBalanceResponse> {
        const ethAddress = validateAndConvertAddress(address)
        if (!ethAddress) {
            throw new BadRequestException(<AccountBalanceResponse>{
                code: 400,
                msg: "Invalid account address",
                data: null,
            });
        }
        const balance = await this.infoQueryService.getAccountBalance(address as Address);
        try {
            return {
                code: 200,
                msg: "OK",
                data: {
                    balance: "0x" + balance.toString("hex"),
                },
            };
        } catch (e) {
            throw new InternalServerErrorException(<AccountBalanceResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            })
        }
    }

    @Get("status/:contractAddress?")
    @ApiOperation({summary: "Get contract status"})
    // contract address is useless
    // @ApiBadRequestResponse({description: "Invalid contract address"})
    // @ApiNotFoundResponse({description: "Contract not found"})
    @ApiOkResponse({type: ContractStatusResponse})
    public async getContractStatus(@Param('contractAddress') contractAddress: string): Promise<ContractStatusResponse> {
        try {
            return {
                code: 200,
                msg: "OK",
                data: await this.infoQueryService.getContractStatus(),
            }
        } catch (e) {
            throw new InternalServerErrorException(<ContractStatusResponse>{
                code: 500,
                msg: e.toString(),
                data: null,
            });
        }

    }
}
