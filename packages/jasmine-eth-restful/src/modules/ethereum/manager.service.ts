import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class ManagerService {
    constructor(
        private readonly configService: ConfigService
    ) {
    }

    public getAddress(): string {
        return this.configService.get<string>(
            "ethereum.contracts.manager",
            "no manager address provided"
        );
    }
}
