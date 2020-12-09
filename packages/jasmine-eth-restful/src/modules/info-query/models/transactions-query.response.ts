import ResponseModel from "./response.model";
import {ApiProperty} from "@nestjs/swagger";
import MetadataModel from "./metadata.model";

export class TransactionBasicInfo {
    @ApiProperty({
        type: String,
        description: "transaction hash",
    })
    hash!: string;

    @ApiProperty({
        type: String,
        description: "hash of the block containing the transaction",
    })
    blockHash!: string;

    @ApiProperty({
        type: Number,
        description: "height of the block containing the transaction",
    })
    blockHeight!: number;
}

export class TransactionsQueryData {
    @ApiProperty()
    metadata!: MetadataModel;

    @ApiProperty({
        type: [TransactionBasicInfo]
    })
    txs!: TransactionBasicInfo[]
}

export default class TransactionsQueryResponse extends ResponseModel {
    @ApiProperty({
        type: TransactionsQueryData,
        description: "list of basic information of transactions"
    })
    data!: TransactionsQueryData | null;
};
