import ResponseModel from "./response.model";
import {ApiProperty} from "@nestjs/swagger";
import MetadataModel from "./metadata.model";

export class AccountTransactionsData {
    @ApiProperty()
    metadata!: MetadataModel;

    @ApiProperty({
        type: [String],
    })
    txHashes!: string[];
}

export default class AccountTransactionsResponse extends ResponseModel {
    @ApiProperty({
        type: AccountTransactionsData,
        description: "transaction history of the account"
    })
    data!: AccountTransactionsData | null;
}
