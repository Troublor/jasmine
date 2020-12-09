import {ApiProperty} from "@nestjs/swagger";
import {Address} from "jasmine-eth-ts";

export default class AccountInfo {
    @ApiProperty({
        type: String,
        description: "Ethereum address"
    })
    address!: Address;

    @ApiProperty({
        type: String,
        description: "balance of the account, a hex number"
    })
    balance!: string
};
