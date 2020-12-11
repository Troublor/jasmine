import {Controller, Get} from "@nestjs/common";
import EthereumService from "./ethereum.service";
import {ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import Response, {ResponseGenerator} from "../common/models/response.model";
import {Tags} from "../common/tags";
import Erc20Service from "./erc20.service";
import ManagerService from "./manager.service";

@Controller("ethereum")
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
    public getEndpoint(): Response<{ endpoint: { ws: string, http: string } }> {
        return ResponseGenerator.OK({
            endpoint: this.ethereumService.getEndpoint(),
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
                    type: "object",
                    properties: {
                        http: {type: "string"},
                        ws: {type: "string"},
                    },
                },
                contracts: {
                    type: "object",
                    properties: {
                        manager: {type: "string"},
                        erc20: {type: "string"},
                    },
                },
            },
        },
    })
    public getConfig(): Response<{ endpoint: { ws: string, http: string }, contracts: { manager: string, erc20: string } }> {
        return ResponseGenerator.OK({
            endpoint: this.ethereumService.getEndpoint(),
            contracts: {
                manager: this.managerService.getAddress(),
                erc20: this.erc20Service.getAddress(),
            },
        });
    }
};
