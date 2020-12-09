import ResponseModel from "./response.model";
import {ApiProperty} from "@nestjs/swagger";

export class AccountBalanceData {
    @ApiProperty()
    balance!: string;
}

export default class AccountBalanceResponse extends ResponseModel {
    @ApiProperty({
        type: AccountBalanceData
    })
    data!: AccountBalanceData | null;
};
