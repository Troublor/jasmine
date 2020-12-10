import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class Erc20Service {
    constructor(
        private readonly configService: ConfigService
    ) {
    }

    public getAddress(networkId: number): string {
        return this.configService.get<string>(
            `services.ethereum.${networkId}.contracts.erc20`,
            "no erc20 address provided"
        );
    }
}
