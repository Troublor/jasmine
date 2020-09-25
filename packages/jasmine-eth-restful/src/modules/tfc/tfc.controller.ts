import {Controller, Get, Param} from "@nestjs/common";
import TfcService from "./tfc.service";
import {Address} from "jasmine-eth-ts";
import AddressPipe from "./address.pipe";
import {ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import AccountInfo from "./models/account.info.model";
import TokenInfo from "./models/token.info.model";

@ApiTags("tfc-erc20")
@Controller("tfc-erc20")
export default class TfcController {
    constructor(
        private readonly tfcService: TfcService,
    ) {
    }

    @ApiOperation({summary: "Get the information of one account in TFC ERC20 Token contract"})
    @Get("accounts/:address")
    @ApiBadRequestResponse({description: "Invalid Ethereum Address"})
    @ApiOkResponse({type: AccountInfo})
    async getAccountInfo(@Param('address', AddressPipe) address: Address): Promise<AccountInfo> {
        let balance = await this.tfcService.balanceOf(address);
        return {
            address: address,
            balance: balance.toString('hex'),
        }
    }

    @Get("tokenInfo")
    @ApiOperation({summary: "Get the ERC20 token information of TFC-ERC20"})
    @ApiOkResponse({type: TokenInfo})
    async getTokenInfo(): Promise<TokenInfo> {
        return {
            name: await this.tfcService.name(),
            symbol: await this.tfcService.symbol(),
            totalSupply: (await this.tfcService.totalSupply()).toString("hex"),
            decimals: await this.tfcService.decimals(),
        }
    }
};
