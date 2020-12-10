import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class EthereumService {
    constructor(
        private readonly configService: ConfigService,
    ) {
    }

    public getEndpoint(networkId: number): string {
        return this.configService.get<string>(
            `services.ethereum.${networkId}.endpoint`,
            `endpoint for network ${networkId} not provided`
        );
    }
};
