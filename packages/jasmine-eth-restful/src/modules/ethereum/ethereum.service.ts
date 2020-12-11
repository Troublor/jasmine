import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class EthereumService {
    constructor(
        private readonly configService: ConfigService,
    ) {
    }

    public getEndpoint(networkId: number): { ws: string, http: string } {
        return {
            ws: this.configService.get<string>(
                `services.ethereum.${networkId}.endpoint.ws`,
                `endpoint for network ${networkId} not provided`
            ),
            http: this.configService.get<string>(
                `services.ethereum.${networkId}.endpoint.http`,
                `endpoint for network ${networkId} not provided`
            ),
        };
    }
};
