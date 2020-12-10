import Response from "./../../common/models/response.model";
import {ApiProperty} from "@nestjs/swagger";

export class AccountBalanceData {
    @ApiProperty()
    balance!: string;
}

export default class AccountBalanceResponse extends Response {
    @ApiProperty({
        type: AccountBalanceData,
    })
    data!: AccountBalanceData | null;
};
