import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class EthereumService {
    constructor(
        private readonly configService: ConfigService,
    ) {
    }

    public getEndpoint(): { ws: string, http: string } {
        return {
            ws: this.configService.get<string>(
                "ethereum.endpoint.ws",
                "endpoint not provided"
            ),
            http: this.configService.get<string>(
                "ethereum.endpoint.http",
                "endpoint not provided"
            ),
        };
    }
};
