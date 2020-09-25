import {Injectable} from "@nestjs/common";
import SDK, {Address, TFC} from "jasmine-eth-ts";
import {ConfigService} from "@nestjs/config";
import BN from "bn.js";

@Injectable()
export default class TfcService {
    private readonly sdk: SDK;
    private readonly tfcAddress: Address;
    private readonly tfc: TFC;

    constructor(
        private readonly config: ConfigService
    ) {
        this.sdk = new SDK(config.get<string>("ethereum.endpoint"));
        this.tfcAddress = config.get<string>("ethereum.tfcAddress");
        this.tfc = this.sdk.getTFC(this.tfcAddress);
    }

    public async balanceOf(owner: Address): Promise<BN> {
        return this.tfc.balanceOf(owner);
    }

    public async totalSupply(): Promise<BN> {
        return this.tfc.totalSupply();
    }

    public async name(): Promise<string> {
        return this.tfc.name();
    }

    public async symbol(): Promise<string> {
        return this.tfc.symbol();
    }

    public async decimals(): Promise<number> {
        return this.tfc.decimals();
    }
};
