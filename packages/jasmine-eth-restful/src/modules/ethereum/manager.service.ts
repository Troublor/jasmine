import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class ManagerService {
    constructor(
        private readonly configService: ConfigService
    ) {
    }

    public getAddress(networkId: number): string {
        return this.configService.get<string>(
            `services.ethereum.${networkId}.contracts.manager`,
            "no manager address provided"
        );
    }
}
