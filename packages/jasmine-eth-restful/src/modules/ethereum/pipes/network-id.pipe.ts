import {BadRequestException, Injectable, PipeTransform} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export default class NetworkIdPipe implements PipeTransform<number, number> {
    constructor(
        private readonly configService: ConfigService
    ) {
    }

    transform(value: number): number {
        const networks = this.configService.get<{ [networkId: number]: any }>("services.ethereum", {});
        if (value === 0) {
            return this.configService.get<number>("services.ethereum.defaultNetworkId", 1);
        }
        if (!(value in networks)) {
            throw new BadRequestException(`networkId ${value} is not supported`);
        }
        return value;
    }
};
