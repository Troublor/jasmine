import {Controller, Get, Param, ParseIntPipe} from "@nestjs/common";
import {AddressResponse} from "./models/address.response";
import {ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import NetworkIdPipe from "./pipes/network-id.pipe";
import ManagerService from "./manager.service";
import {ResponseGenerator} from "../common/models/response.model";
import {Tags} from "../common/tags";

@Controller("ethereum/:networkId/manager")
@ApiTags(Tags.ETHEREUM)
export default class ManagerController {
    constructor(
        private readonly managerService: ManagerService
    ) {
    }

    @Get("address")
    @ApiOperation({summary: "Get TFC Manager Contract Address"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({type: AddressResponse})
    public async getTFCManager(
        @Param("networkId", ParseIntPipe, NetworkIdPipe) networkId: number
    ): Promise<AddressResponse> {
        return ResponseGenerator.OK({
            address: this.managerService.getAddress(networkId),
        });
    }
};
