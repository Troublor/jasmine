import {ApiProperty} from "@nestjs/swagger";

export default class TokenInfo {
    @ApiProperty({
        description: "name of TFC ERC20 Token"
    })
    name!: string;

    @ApiProperty({
        description: "symbol used to represent TFC ERC20 Token"
    })
    symbol!: string;

    @ApiProperty({
        description: "decimals used in TFC ERC20 Token"
    })
    decimals!: number

    @ApiProperty({
        description: "the total token supply, a hex number"
    })
    totalSupply!: string
}
