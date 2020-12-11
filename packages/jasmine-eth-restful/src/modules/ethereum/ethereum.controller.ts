import {Controller, Get, Param, ParseIntPipe} from "@nestjs/common";
import EthereumService from "./ethereum.service";
import NetworkIdPipe from "./pipes/network-id.pipe";
import {ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import Response, {ResponseGenerator} from "../common/models/response.model";
import {Tags} from "../common/tags";
import Erc20Service from "./erc20.service";
import ManagerService from "./manager.service";

@Controller("ethereum/:networkId")
@ApiTags(Tags.ETHEREUM)
export default class EthereumController {
    constructor(
        private readonly ethereumService: EthereumService,
        private readonly erc20Service: Erc20Service,
        private readonly managerService: ManagerService,
    ) {
    }

    @Get("endpoint")
    @ApiOperation({summary: "Get Ethereum endpoint URL"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({
        schema: {
            type: "object",
            properties: {
                endpoint: {
                    type: "object", properties: {
                        http: {type: "string"},
                        ws: {type: "string"},
                    },
                },
            },
        },
    })
    public getEndpoint(
        @Param("networkId", ParseIntPipe, NetworkIdPipe) networkId: number
    ): Response<{ endpoint: { ws: string, http: string } }> {
        return ResponseGenerator.OK({
            endpoint: this.ethereumService.getEndpoint(networkId),
        });
    }

    @Get("config")
    @ApiOperation({summary: "Get Ethereum configuration"})
    @ApiBadRequestResponse({description: "Invalid query parameters"})
    @ApiOkResponse({
        schema: {
            type: "object",
            properties: {
                endpoint: {
                    type: "object", properties: {
                        http: {type: "string"},
                        ws: {type: "string"},
                    },
                },
                manager: {type: "string"},
                erc20: {type: "string"},
            },
        },
    })
    public getConfig(
        @Param("networkId", ParseIntPipe, NetworkIdPipe) networkId: number
    ): Response<{ endpoint: { ws: string, http: string }, manager: string, erc20: string }> {
        return ResponseGenerator.OK({
            endpoint: this.ethereumService.getEndpoint(networkId),
            manager: this.managerService.getAddress(networkId),
            erc20: this.erc20Service.getAddress(networkId),
        });
    }
};
