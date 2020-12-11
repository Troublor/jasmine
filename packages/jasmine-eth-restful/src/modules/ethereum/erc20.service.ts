import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class Erc20Service {
    constructor(
        private readonly configService: ConfigService
    ) {
    }

    public getAddress(): string {
        return this.configService.get<string>(
            "ethereum.contracts.erc20",
            "no erc20 address provided"
        );
    }
}
