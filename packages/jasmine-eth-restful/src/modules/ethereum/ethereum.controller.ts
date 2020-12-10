import {Controller, Get, Param, ParseIntPipe} from "@nestjs/common";
import EthereumService from "./ethereum.service";
import NetworkIdPipe from "./pipes/network-id.pipe";
import {ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags} from "@nestjs/swagger";
import Response, {ResponseGenerator} from "../common/models/response.model";
import {Tags} from "../common/tags";

@Controller("ethereum/:networkId")
@ApiTags(Tags.ETHEREUM)
export default class EthereumController {
    constructor(
        private readonly ethereumService: EthereumService
    ) {
    }

    @Get("endpoint")
    @ApiOperation({summary: "Get Ethereum endpoint URL"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({
        schema: {
            type: "object",
            properties: {
                endpoint: {type: "string"},
            },
        },
    })
    public getEndpoint(
        @Param("networkId", ParseIntPipe, NetworkIdPipe) networkId: number
    ): Response<{ endpoint: string }> {
        return ResponseGenerator.OK({
            endpoint: this.ethereumService.getEndpoint(networkId),
        });
    }
};
